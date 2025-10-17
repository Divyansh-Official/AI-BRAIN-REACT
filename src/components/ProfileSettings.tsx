import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile } from '../lib/supabase';
import { Save, User, MessageCircle, Zap, Briefcase, Sparkles } from 'lucide-react';

export function ProfileSettings() {
  const { profile, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [communicationTone, setCommunicationTone] = useState<UserProfile['communication_tone']>('friendly');
  const [learningPace, setLearningPace] = useState<UserProfile['learning_pace']>('medium');
  const [userType, setUserType] = useState<UserProfile['user_type']>('general');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name);
      setCommunicationTone(profile.communication_tone);
      setLearningPace(profile.learning_pace);
      setUserType(profile.user_type);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      await updateProfile({
        display_name: displayName,
        communication_tone: communicationTone,
        learning_pace: learningPace,
        user_type: userType,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="glass-hover border-b border-white/10 p-6 backdrop-blur-xl">
        <h2 className="text-3xl font-bold text-gradient mb-1">Profile Settings</h2>
        <p className="text-gray-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Customize how your AI Brain learns and communicates with you
        </p>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
          <div className="glass-hover border-2 border-white/10 rounded-2xl p-6 stagger-item">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl blur opacity-50"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Personal Information</h3>
                <p className="text-gray-400 text-sm">Basic details about you</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full glass border-2 border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all duration-300 hover:border-white/20"
                placeholder="Your name"
                required
              />
            </div>
          </div>

          <div className="glass-hover border-2 border-white/10 rounded-2xl p-6 stagger-item" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl blur opacity-50"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Communication Style</h3>
                <p className="text-gray-400 text-sm">How the AI should talk to you</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-4">
                Tone
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['friendly', 'formal', 'technical'] as const).map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setCommunicationTone(tone)}
                    className={`p-5 rounded-xl border-2 transition-all duration-300 group ${
                      communicationTone === tone
                        ? 'border-cyan-500 bg-cyan-500/10 scale-105'
                        : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <p className="text-white font-bold capitalize mb-1">{tone}</p>
                    <p className="text-gray-400 text-xs">
                      {tone === 'friendly' && 'Casual and warm'}
                      {tone === 'formal' && 'Professional'}
                      {tone === 'technical' && 'Detailed and precise'}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-hover border-2 border-white/10 rounded-2xl p-6 stagger-item" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl blur opacity-50"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Learning Preferences</h3>
                <p className="text-gray-400 text-sm">How you prefer to learn</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-4">
                Learning Pace
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['slow', 'medium', 'fast'] as const).map((pace) => (
                  <button
                    key={pace}
                    type="button"
                    onClick={() => setLearningPace(pace)}
                    className={`p-5 rounded-xl border-2 transition-all duration-300 group ${
                      learningPace === pace
                        ? 'border-blue-500 bg-blue-500/10 scale-105'
                        : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <p className="text-white font-bold capitalize mb-1">{pace}</p>
                    <p className="text-gray-400 text-xs">
                      {pace === 'slow' && 'Detailed explanations'}
                      {pace === 'medium' && 'Balanced approach'}
                      {pace === 'fast' && 'Quick summaries'}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-hover border-2 border-white/10 rounded-2xl p-6 stagger-item" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 rounded-xl blur opacity-50"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 rounded-xl flex items-center justify-center animate-gradient">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">User Type</h3>
                <p className="text-gray-400 text-sm">Your primary use case</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-4">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['student', 'developer', 'professional', 'general'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setUserType(type)}
                    className={`p-5 rounded-xl border-2 transition-all duration-300 group ${
                      userType === type
                        ? 'border-purple-500 bg-purple-500/10 scale-105'
                        : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <p className="text-white font-bold capitalize mb-1">{type}</p>
                    <p className="text-gray-400 text-xs">
                      {type === 'student' && 'Learning & studying'}
                      {type === 'developer' && 'Coding & building'}
                      {type === 'professional' && 'Work & projects'}
                      {type === 'general' && 'Personal use'}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {success && (
            <div className="animate-fade-in glass border-2 border-green-500/50 rounded-2xl p-5 text-green-400 text-center font-semibold backdrop-blur-xl">
              Profile updated successfully!
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="stagger-item w-full relative group overflow-hidden rounded-2xl p-[2px] transition-all duration-300 hover:scale-105"
            style={{ animationDelay: '0.4s' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 animate-gradient"></div>
            <div className="relative bg-black rounded-2xl px-6 py-4 group-hover:bg-transparent transition-all duration-300">
              <span className="flex items-center justify-center gap-2 text-white font-semibold text-lg">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </span>
            </div>
          </button>
        </form>
      </div>
    </div>
  );
}
