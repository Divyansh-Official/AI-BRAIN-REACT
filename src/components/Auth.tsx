import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Brain, Mail, Lock, User, Sparkles, Zap } from 'lucide-react';

export function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!displayName.trim()) {
          throw new Error('Please enter your name');
        }
        await signUp(email, password, displayName);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      <div className="absolute inset-0 bg-mesh opacity-50"></div>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/30 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full animate-fade-in-up">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-3xl blur-xl opacity-75 animate-pulse-glow"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 rounded-3xl flex items-center justify-center animate-gradient shadow-2xl">
                <Brain className="w-10 h-10 text-white animate-pulse" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-3">
              <span className="text-gradient">AI Brain</span>
            </h1>
            <p className="text-gray-400 text-lg flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              Your Digital Twin Experience
              <Sparkles className="w-4 h-4" />
            </p>
          </div>

          <div className="glass rounded-3xl p-8 border-2 animate-border-flow backdrop-blur-2xl shadow-2xl">
            <div className="flex gap-2 mb-8">
              <button
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                  !isSignUp
                    ? 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/50 scale-105'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                  isSignUp
                    ? 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/50 scale-105'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <div className="stagger-item">
                  <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-cyan-400" />
                    Your Name
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="relative w-full glass border-2 border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all duration-300 hover:border-white/20"
                      placeholder="Enter your name"
                      required={isSignUp}
                    />
                  </div>
                </div>
              )}

              <div className="stagger-item" style={{ animationDelay: isSignUp ? '0.1s' : '0s' }}>
                <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-400" />
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="relative w-full glass border-2 border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all duration-300 hover:border-white/20"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="stagger-item" style={{ animationDelay: isSignUp ? '0.2s' : '0.1s' }}>
                <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-400" />
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="relative w-full glass border-2 border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all duration-300 hover:border-white/20"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="animate-fade-in bg-red-500/10 border-2 border-red-500/50 rounded-xl p-4 text-red-400 text-sm backdrop-blur-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="stagger-item w-full relative group overflow-hidden rounded-xl p-[2px] transition-all duration-300 hover:scale-105"
                style={{ animationDelay: isSignUp ? '0.3s' : '0.2s' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 animate-gradient"></div>
                <div className="relative bg-black rounded-xl px-6 py-4 group-hover:bg-transparent transition-all duration-300">
                  <span className="flex items-center justify-center gap-2 text-white font-semibold text-lg">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        {isSignUp ? 'Create Your Digital Twin' : 'Enter Your AI Brain'}
                      </>
                    )}
                  </span>
                </div>
              </button>
            </form>
          </div>

          <div className="mt-8 text-center space-y-2 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Secure, Private, Personalized
            </p>
            <p className="text-gray-600 text-xs max-w-sm mx-auto">
              An AI that remembers everything you learn and helps you think better
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
