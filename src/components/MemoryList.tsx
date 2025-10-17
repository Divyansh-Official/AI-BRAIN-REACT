import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Memory } from '../lib/supabase';
import { Plus, Search, BookOpen, Calendar, Tag, Trash2, Edit2 } from 'lucide-react';
import { AddMemoryModal } from './AddMemoryModal';

export function MemoryList() {
  const { user } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  useEffect(() => {
    if (user) {
      loadMemories();
    }
  }, [user]);

  const loadMemories = async () => {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMemories(data || []);
    } catch (error) {
      console.error('Error loading memories:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMemory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this memory?')) return;

    try {
      const { error } = await supabase.from('memories').delete().eq('id', id);
      if (error) throw error;
      setMemories(memories.filter((m) => m.id !== id));
    } catch (error) {
      console.error('Error deleting memory:', error);
    }
  };

  const filteredMemories = memories.filter(
    (memory) =>
      memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memory.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      <div className="glass-hover border-b border-white/10 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gradient mb-1">Your Memories</h2>
            <p className="text-gray-400 text-sm">Store and recall everything that matters</p>
          </div>
          <button
            onClick={() => {
              setSelectedMemory(null);
              setShowAddModal(true);
            }}
            className="relative group overflow-hidden rounded-xl p-[2px] transition-all duration-300 hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 animate-gradient"></div>
            <div className="relative bg-black rounded-xl px-5 py-3 group-hover:bg-transparent transition-all duration-300 flex items-center gap-2">
              <Plus className="w-5 h-5 text-white" />
              <span className="font-semibold text-white">Add Memory</span>
            </div>
          </button>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-cyan-400 transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search through your digital brain..."
            className="w-full glass border-2 border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all duration-300 hover:border-white/20"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
              <p className="text-gray-400 font-medium">Loading memories...</p>
            </div>
          </div>
        ) : filteredMemories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in-up">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur-xl opacity-50"></div>
              <div className="relative w-24 h-24 glass rounded-3xl flex items-center justify-center border-2 border-white/20">
                <BookOpen className="w-12 h-12 text-cyan-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {searchQuery ? 'No memories found' : 'No memories yet'}
            </h3>
            <p className="text-gray-400 mb-8 max-w-md">
              {searchQuery
                ? 'Try a different search term'
                : 'Start building your digital brain by adding your first memory'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowAddModal(true)}
                className="relative group overflow-hidden rounded-xl p-[2px] transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 animate-gradient"></div>
                <div className="relative bg-black rounded-xl px-6 py-3 group-hover:bg-transparent transition-all duration-300 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-white" />
                  <span className="font-semibold text-white">Add Your First Memory</span>
                </div>
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredMemories.map((memory, index) => (
              <div
                key={memory.id}
                className="perspective-card glass-hover border-2 border-white/10 rounded-2xl p-6 group transition-all duration-300 hover:border-cyan-500/30 stagger-item"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                      <div className="relative w-12 h-12 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-xl mb-2 group-hover:text-gradient transition-all">
                        {memory.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg">
                          <Calendar className="w-4 h-4 text-cyan-400" />
                          {new Date(memory.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg capitalize">
                          <Tag className="w-4 h-4 text-blue-400" />
                          {memory.memory_type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                      onClick={() => {
                        setSelectedMemory(memory);
                        setShowAddModal(true);
                      }}
                      className="p-2.5 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-xl transition-all duration-300 border border-white/10 hover:border-cyan-500/30"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteMemory(memory.id)}
                      className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300 border border-white/10 hover:border-red-500/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed line-clamp-3 pl-16">
                  {memory.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddMemoryModal
          memory={selectedMemory}
          onClose={() => {
            setShowAddModal(false);
            setSelectedMemory(null);
          }}
          onSave={loadMemories}
        />
      )}
    </div>
  );
}
