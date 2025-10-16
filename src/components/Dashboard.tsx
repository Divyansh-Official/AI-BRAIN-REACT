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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex h-screen">
        <aside className="w-64 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700 flex flex-col">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold">AI Brain</h1>
                <p className="text-slate-400 text-xs">Digital Twin</p>
              </div>
            </div>

            <div className="mb-6 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <p className="text-white font-medium text-sm">{profile?.display_name}</p>
              <p className="text-slate-400 text-xs mt-1 capitalize">
                {profile?.user_type} • {profile?.communication_tone}
              </p>
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('memories')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'memories'
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                <span className="font-medium">Memories</span>
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'chat'
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                <span className="font-medium">Chat</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'settings'
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Settings</span>
              </button>
            </nav>
          </div>

          <div className="mt-auto p-6">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-hidden">
          {activeTab === 'memories' && <MemoryList />}
          {activeTab === 'chat' && <ChatInterface />}
          {activeTab === 'settings' && <ProfileSettings />}
        </main>
      </div>
    </div>
  );
}
