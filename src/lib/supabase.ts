import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserProfile = {
  id: string;
  display_name: string;
  communication_tone: 'friendly' | 'formal' | 'technical';
  learning_pace: 'slow' | 'medium' | 'fast';
  user_type: 'student' | 'developer' | 'professional' | 'general';
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export type Memory = {
  id: string;
  user_id: string;
  category_id: string | null;
  title: string;
  content: string;
  memory_type: 'note' | 'conversation' | 'document' | 'goal' | 'reminder';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export type MemoryCategory = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  created_at: string;
};

export type Conversation = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export type ConversationMessage = {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  context_memories: any[];
  created_at: string;
};
