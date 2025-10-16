import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile } from '../lib/supabase';
import { Save, User, MessageCircle, Zap, Briefcase } from 'lucide-react';

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
    <div className="h-full overflow-y-auto">
      <div className="bg-slate-800/30 backdrop-blur-sm border-b border-slate-700 p-6">
        <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
        <p className="text-slate-400 mt-1">
          Customize how your AI Brain learns and communicates with you
        </p>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Personal Information</h3>
                <p className="text-slate-400 text-sm">Basic details about you</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your name"
                required
              />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Communication Style</h3>
                <p className="text-slate-400 text-sm">How the AI should talk to you</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Tone
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['friendly', 'formal', 'technical'] as const).map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setCommunicationTone(tone)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      communicationTone === tone
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <p className="text-white font-medium capitalize">{tone}</p>
                    <p className="text-slate-400 text-xs mt-1">
                      {tone === 'friendly' && 'Casual and warm'}
                      {tone === 'formal' && 'Professional'}
                      {tone === 'technical' && 'Detailed and precise'}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Learning Preferences</h3>
                <p className="text-slate-400 text-sm">How you prefer to learn</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Learning Pace
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['slow', 'medium', 'fast'] as const).map((pace) => (
                  <button
                    key={pace}
                    type="button"
                    onClick={() => setLearningPace(pace)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      learningPace === pace
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <p className="text-white font-medium capitalize">{pace}</p>
                    <p className="text-slate-400 text-xs mt-1">
                      {pace === 'slow' && 'Detailed explanations'}
                      {pace === 'medium' && 'Balanced approach'}
                      {pace === 'fast' && 'Quick summaries'}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">User Type</h3>
                <p className="text-slate-400 text-sm">Your primary use case</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['student', 'developer', 'professional', 'general'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setUserType(type)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      userType === type
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <p className="text-white font-medium capitalize">{type}</p>
                    <p className="text-slate-400 text-xs mt-1">
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
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 text-green-400 text-center">
              Profile updated successfully!
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium py-3 px-4 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
