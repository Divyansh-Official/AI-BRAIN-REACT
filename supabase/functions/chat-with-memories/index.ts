import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatRequest {
  message: string;
  conversationId?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { message, conversationId }: ChatRequest = await req.json();

    if (!message || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const embeddingResponse = await fetch(
      `${supabaseUrl}/functions/v1/generate-embedding`,
      {
        method: "POST",
        headers: {
          "Authorization": authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: message }),
      }
    );

    if (!embeddingResponse.ok) {
      throw new Error("Failed to generate embedding");
    }

    const { embedding } = await embeddingResponse.json();

    const { data: relevantMemories } = await supabase.rpc("match_memories", {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: 5,
      filter_user_id: user.id,
    });

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const context = relevantMemories && relevantMemories.length > 0
      ? relevantMemories.map((m: any) => `${m.title}: ${m.content}`).join("\n\n")
      : "No relevant memories found.";

    const systemPrompt = `You are a personalized AI assistant that acts as a digital twin of the user. 

User Profile:
- Name: ${profile?.display_name || "User"}
- Communication Tone: ${profile?.communication_tone || "friendly"}
- Learning Pace: ${profile?.learning_pace || "medium"}
- User Type: ${profile?.user_type || "general"}

Relevant Context from User's Memories:
${context}

Instructions:
- Respond in a ${profile?.communication_tone || "friendly"} tone
- Reference the user's stored memories when relevant
- Be helpful, concise, and personalized to their learning style
- If you use information from their memories, acknowledge it naturally
`;

    const chatResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.7,
      }),
    });

    if (!chatResponse.ok) {
      const error = await chatResponse.text();
      console.error("OpenAI API error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to generate response" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const chatData = await chatResponse.json();
    const assistantMessage = chatData.choices[0].message.content;

    let currentConversationId = conversationId;
    if (!currentConversationId) {
      const { data: newConv } = await supabase
        .from("conversations")
        .insert({
          user_id: user.id,
          title: message.substring(0, 50),
        })
        .select()
        .single();
      currentConversationId = newConv?.id;
    }

    if (currentConversationId) {
      await supabase.from("conversation_messages").insert([
        {
          conversation_id: currentConversationId,
          role: "user",
          content: message,
          context_memories: relevantMemories?.map((m: any) => m.memory_id) || [],
        },
        {
          conversation_id: currentConversationId,
          role: "assistant",
          content: assistantMessage,
          context_memories: relevantMemories?.map((m: any) => m.memory_id) || [],
        },
      ]);
    }

    return new Response(
      JSON.stringify({
        response: assistantMessage,
        conversationId: currentConversationId,
        relevantMemories: relevantMemories || [],
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in chat-with-memories:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});