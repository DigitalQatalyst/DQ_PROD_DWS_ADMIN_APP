import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Shield, Users, FileText, ChevronRight } from 'lucide-react';

export const DummyLogin: React.FC = () => {
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

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        if (password !== 'test123') {
            setError('Invalid password. Please use "test123"');
            setIsLoading(false);
            return;
        }

        const dummyUser = {
            id: 'dummy-id',
            email: email,
            name: email.split('@')[0].toUpperCase(),
            role: 'viewer' as any,
            user_segment: 'internal' as any,
        };

        try {
            await login(dummyUser);
            navigate('/');
        } catch (err) {
            setError('Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const quickLogin = async (userEmail: string) => {
        setEmail(userEmail);
        setPassword('test123');
        setIsLoading(true);
        setError(null);

        await new Promise(resolve => setTimeout(resolve, 600));

        const dummyUser = {
            id: 'dummy-id',
            email: userEmail,
            name: userEmail.split('@')[0].toUpperCase(),
            role: 'viewer' as any,
            user_segment: 'internal' as any,
        };

        try {
            await login(dummyUser);
            navigate('/');
        } catch (err) {
            setError('Login failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Left Side - Visuals */}
                <div className="hidden md:flex bg-blue-700 p-12 flex-col justify-between text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="h-12 w-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-8">
                            <Shield className="text-white" size={28} />
                        </div>
                        <h1 className="text-4xl font-bold mb-4">Platform Admin</h1>
                        <p className="text-blue-100 text-lg">
                            Manage your ecosystem with precision and security. Access tools for content, services, and growth.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center space-x-4 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <Users size={20} />
                            </div>
                            <div>
                                <p className="font-semibold text-sm">Role-Based Access</p>
                                <p className="text-xs text-blue-200">Granular permissions for every staff member</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <FileText size={20} />
                            </div>
                            <div>
                                <p className="font-semibold text-sm">Content lifecycle</p>
                                <p className="text-xs text-blue-200">Full audit trails for all data changes</p>
                            </div>
                        </div>
                    </div>

                    {/* Abstract background elements */}
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-50"></div>
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
                </div>

                {/* Right Side - Form */}
                <div className="p-8 md:p-12 flex flex-col justify-center bg-white">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                        <p className="text-gray-500">Please enter your credentials to access the portal</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm flex items-center">
                            <Shield className="mr-3 flex-shrink-0" size={18} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="admin@test.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center space-x-2 disabled:opacity-70"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <LogIn size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10">
                        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Quick Access Profiles</p>
                        <div className="space-y-3">
                            {[
                                { email: 'admin@test.com', label: 'Super Admin', color: 'blue' },
                                { email: 'hr@test.com', label: 'HR Manager', color: 'emerald' },
                                { email: 'content@test.com', label: 'Content Manager', color: 'purple' },
                            ].map((profile) => (
                                <button
                                    key={profile.email}
                                    onClick={() => quickLogin(profile.email)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md hover:border-blue-200 transition-all group`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-lg bg-${profile.color}-100 text-${profile.color}-600`}>
                                            <User size={18} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-semibold text-gray-900">{profile.label}</p>
                                            <p className="text-xs text-gray-500">{profile.email}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const User = ({ size, className }: { size: number; className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);
