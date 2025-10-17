import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Conversation, ConversationMessage } from '../lib/supabase';
import { Send, Loader, Brain, User, Plus, MessageSquare, Sparkles } from 'lucide-react';

export function ChatInterface() {
  const { user, session } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation);
    }
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user!.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
      if (data && data.length > 0 && !activeConversation) {
        setActiveConversation(data[0].id);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('conversation_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const startNewConversation = () => {
    setActiveConversation(null);
    setMessages([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    const tempUserMessage: ConversationMessage = {
      id: 'temp-user',
      conversation_id: activeConversation || 'temp',
      role: 'user',
      content: userMessage,
      context_memories: [],
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-with-memories`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage,
            conversationId: activeConversation,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      if (!activeConversation) {
        setActiveConversation(data.conversationId);
        await loadConversations();
      }

      await loadMessages(data.conversationId);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => prev.filter((m) => m.id !== 'temp-user'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex">
      <aside className="w-72 glass-hover border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <button
            onClick={startNewConversation}
            className="w-full relative group overflow-hidden rounded-xl p-[2px] transition-all duration-300 hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 animate-gradient"></div>
            <div className="relative bg-black rounded-xl px-4 py-3 group-hover:bg-transparent transition-all duration-300 flex items-center justify-center gap-2">
              <Plus className="w-5 h-5 text-white" />
              <span className="font-semibold text-white">New Chat</span>
            </div>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {loadingConversations ? (
            <div className="text-gray-400 text-sm text-center">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="text-gray-500 text-sm text-center">
              No conversations yet
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv, index) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversation(conv.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-300 stagger-item ${
                    activeConversation === conv.id
                      ? 'glass border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/20'
                      : 'text-gray-400 hover:bg-white/5 border border-white/5'
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-4 h-4 mt-1 flex-shrink-0 text-cyan-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate text-white">{conv.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(conv.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <div className="glass-hover border-b border-white/10 p-6 backdrop-blur-xl">
          <h2 className="text-2xl font-bold text-gradient mb-1">Chat with Your AI Brain</h2>
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Ask questions and get answers based on your stored memories
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in-up">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-3xl blur-2xl opacity-50 animate-pulse-glow"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-2xl animate-gradient">
                  <Brain className="w-12 h-12 text-white animate-pulse" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Start a Conversation
              </h3>
              <p className="text-gray-400 max-w-md">
                Ask me anything about your memories, request summaries, or get personalized
                assistance based on what you've learned
              </p>
            </div>
          ) : (
            <div className="space-y-6 max-w-3xl mx-auto">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex gap-4 animate-fade-in-up ${
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="relative group">
                    <div
                      className={`absolute inset-0 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-cyan-500 to-blue-500'
                          : 'bg-gradient-to-br from-blue-500 to-purple-500'
                      }`}
                    ></div>
                    <div
                      className={`relative w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-cyan-500 to-blue-500'
                          : 'bg-gradient-to-br from-blue-500 to-purple-500 animate-gradient'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <User className="w-6 h-6 text-white" />
                      ) : (
                        <Brain className="w-6 h-6 text-white" />
                      )}
                    </div>
                  </div>
                  <div
                    className={`flex-1 ${
                      message.role === 'user' ? 'text-right' : ''
                    }`}
                  >
                    <div
                      className={`inline-block max-w-full px-5 py-4 rounded-2xl transition-all duration-300 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20'
                          : 'glass border-2 border-white/10 text-gray-200 hover:border-white/20'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed font-medium">
                        {message.content}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 px-2">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-4 animate-fade-in">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl blur opacity-50 animate-pulse-glow"></div>
                    <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl">
                      <Brain className="w-6 h-6 text-white animate-pulse" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="inline-block px-5 py-4 glass border-2 border-white/10 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="border-t border-white/10 p-4 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="flex gap-3">
              <div className="flex-1 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl blur opacity-0 group-focus-within:opacity-20 transition-opacity"></div>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about your memories..."
                  disabled={loading}
                  className="relative w-full glass border-2 border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all duration-300 hover:border-white/20 disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="relative group overflow-hidden rounded-2xl p-[2px] transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 animate-gradient"></div>
                <div className="relative bg-black rounded-2xl p-4 group-hover:bg-transparent transition-all duration-300">
                  <Send className="w-6 h-6 text-white" />
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
