import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Memory } from '../lib/supabase';
import { X, Sparkles } from 'lucide-react';

interface AddMemoryModalProps {
  memory: Memory | null;
  onClose: () => void;
  onSave: () => void;
}

export function AddMemoryModal({ memory, onClose, onSave }: AddMemoryModalProps) {
  const { user, session } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [memoryType, setMemoryType] = useState<Memory['memory_type']>('note');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (memory) {
      setTitle(memory.title);
      setContent(memory.content);
      setMemoryType(memory.memory_type);
    }
  }, [memory]);

  const generateEmbedding = async (text: string) => {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-embedding`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to generate embedding');
    }

    const data = await response.json();
    return data.embedding;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!title.trim() || !content.trim()) {
        throw new Error('Title and content are required');
      }

      const embedding = await generateEmbedding(`${title} ${content}`);

      if (memory) {
        const { error: updateError } = await supabase
          .from('memories')
          .update({
            title,
            content,
            memory_type: memoryType,
            updated_at: new Date().toISOString(),
          })
          .eq('id', memory.id);

        if (updateError) throw updateError;

        await supabase.from('memory_embeddings').delete().eq('memory_id', memory.id);

        const { error: embeddingError } = await supabase
          .from('memory_embeddings')
          .insert({
            memory_id: memory.id,
            embedding,
            chunk_index: 0,
          });

        if (embeddingError) throw embeddingError;
      } else {
        const { data: newMemory, error: insertError } = await supabase
          .from('memories')
          .insert({
            user_id: user!.id,
            title,
            content,
            memory_type: memoryType,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        const { error: embeddingError } = await supabase
          .from('memory_embeddings')
          .insert({
            memory_id: newMemory.id,
            embedding,
            chunk_index: 0,
          });

        if (embeddingError) throw embeddingError;
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="glass border-2 border-white/20 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slide-in-bottom">
        <div className="flex items-center justify-between p-6 border-b border-white/10 backdrop-blur-xl">
          <div>
            <h2 className="text-2xl font-bold text-gradient flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-cyan-400" />
              {memory ? 'Edit Memory' : 'Add New Memory'}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {memory ? 'Update your stored knowledge' : 'Store new knowledge in your digital brain'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 border border-white/10 hover:border-white/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          <div className="stagger-item">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full glass border-2 border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all duration-300 hover:border-white/20"
              placeholder="Give this memory a title"
              required
            />
          </div>

          <div className="stagger-item" style={{ animationDelay: '0.1s' }}>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Type
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(['note', 'document', 'goal', 'reminder', 'conversation'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setMemoryType(type)}
                  className={`px-3 py-2.5 rounded-xl border-2 transition-all duration-300 capitalize text-sm font-semibold ${
                    memoryType === type
                      ? 'border-blue-500 bg-blue-500/10 text-white scale-105'
                      : 'border-white/10 text-gray-400 hover:text-white hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="stagger-item" style={{ animationDelay: '0.2s' }}>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full glass border-2 border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all duration-300 hover:border-white/20 resize-none custom-scrollbar"
              placeholder="Write your memory content here..."
              required
            />
          </div>

          {error && (
            <div className="animate-fade-in glass border-2 border-red-500/50 rounded-xl p-4 text-red-400 text-sm backdrop-blur-xl">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-3.5 glass border-2 border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 relative group overflow-hidden rounded-xl p-[2px] transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 animate-gradient"></div>
              <div className="relative bg-black rounded-xl px-6 py-3.5 group-hover:bg-transparent transition-all duration-300">
                <span className="flex items-center justify-center gap-2 text-white font-semibold">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      {memory ? 'Update Memory' : 'Save Memory'}
                    </>
                  )}
                </span>
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
