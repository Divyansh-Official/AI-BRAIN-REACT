import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MemoryList } from './MemoryList';
import { ChatInterface } from './ChatInterface';
import { ProfileSettings } from './ProfileSettings';
import { Brain, MessageSquare, BookOpen, Settings, LogOut } from 'lucide-react';

type Tab = 'memories' | 'chat' | 'settings';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('memories');
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      <div className="absolute inset-0 bg-mesh opacity-30"></div>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-cyan-500/20 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="relative z-10 flex h-screen">
        <aside className="w-72 glass border-r border-white/10 flex flex-col animate-slide-in-left">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl blur opacity-75 animate-pulse-glow"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 rounded-2xl flex items-center justify-center animate-gradient shadow-xl">
                  <Brain className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-white font-bold text-lg"><span className="text-gradient">AI Brain</span></h1>
                <p className="text-gray-400 text-xs">Digital Twin</p>
              </div>
            </div>

            <div className="mb-6 p-4 glass-hover rounded-xl border-2 border-white/10 group transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                  {profile?.display_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">{profile?.display_name}</p>
                  <p className="text-gray-400 text-xs mt-0.5 capitalize flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    {profile?.user_type} • {profile?.communication_tone}
                  </p>
                </div>
              </div>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('memories')}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  activeTab === 'memories'
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {activeTab === 'memories' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 animate-gradient"></div>
                )}
                <BookOpen className={`w-5 h-5 relative z-10 transition-transform duration-300 ${
                  activeTab === 'memories' ? 'scale-110' : 'group-hover:scale-110'
                }`} />
                <span className="font-semibold relative z-10">Memories</span>
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  activeTab === 'chat'
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {activeTab === 'chat' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 animate-gradient"></div>
                )}
                <MessageSquare className={`w-5 h-5 relative z-10 transition-transform duration-300 ${
                  activeTab === 'chat' ? 'scale-110' : 'group-hover:scale-110'
                }`} />
                <span className="font-semibold relative z-10">Chat</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  activeTab === 'settings'
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {activeTab === 'settings' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 animate-gradient"></div>
                )}
                <Settings className={`w-5 h-5 relative z-10 transition-transform duration-300 ${
                  activeTab === 'settings' ? 'scale-110 rotate-90' : 'group-hover:scale-110 group-hover:rotate-90'
                }`} />
                <span className="font-semibold relative z-10">Settings</span>
              </button>
            </nav>
          </div>

          <div className="mt-auto p-6">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300 group border border-white/5 hover:border-red-500/30"
            >
              <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-hidden">
          <div className="h-full animate-fade-in">
            {activeTab === 'memories' && <MemoryList />}
            {activeTab === 'chat' && <ChatInterface />}
            {activeTab === 'settings' && <ProfileSettings />}
          </div>
        </main>
      </div>
    </div>
  );
}
