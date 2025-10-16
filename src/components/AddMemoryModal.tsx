import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Memory } from '../lib/supabase';
import { X, Loader } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">
            {memory ? 'Edit Memory' : 'Add New Memory'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Give this memory a title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Type
            </label>
            <select
              value={memoryType}
              onChange={(e) => setMemoryType(e.target.value as Memory['memory_type'])}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="note">Note</option>
              <option value="document">Document</option>
              <option value="goal">Goal</option>
              <option value="reminder">Reminder</option>
              <option value="conversation">Conversation</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Write your memory content here..."
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader className="w-5 h-5 animate-spin" />}
              {loading ? 'Saving...' : memory ? 'Update Memory' : 'Save Memory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
