import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Shield, Users, FileText, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: loginError } = await login(email, password);
      if (loginError) {
        setError(loginError.message || 'Invalid login credentials');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl shadow-2xl overflow-hidden min-h-[600px]">
        {/* Left Side - Visuals */}
        <div className="hidden md:flex bg-blue-700 p-12 flex-col justify-between text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="h-12 w-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-8">
              <Shield className="text-white" size={28} />
            </div>
            <h1 className="text-4xl font-bold mb-4">DWS Admin</h1>
            <p className="text-blue-100 text-lg">
              Secure access to the Digital Workspace Services administration portal.
            </p>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center space-x-4 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
              <div className="bg-white/20 p-2 rounded-lg">
                <Users size={20} />
              </div>
              <div>
                <p className="font-semibold text-sm">Granular RBAC</p>
                <p className="text-xs text-blue-200">HR and Content specific permissions</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
              <div className="bg-white/20 p-2 rounded-lg">
                <FileText size={20} />
              </div>
              <div>
                <p className="font-semibold text-sm">Content Approval</p>
                <p className="text-xs text-blue-200">Multi-stage review workflows</p>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-50"></div>
        </div>

        {/* Right Side - Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-white">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Login</h2>
            <p className="text-slate-500">Enter your credentials to manage the platform</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm flex items-start gap-3">
              <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign in to Dashboard</span>
                  <LogIn size={20} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
