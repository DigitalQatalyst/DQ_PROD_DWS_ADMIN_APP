import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Lock, Shield, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Check if we have a session or recovery token
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                // If no session, they might have landed here without a valid link
                // We can check the URL for recovery/invite tokens but Supabase handles them automatically if configured
                console.warn('No active session found for password reset');
            }
        });
    }, []);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { error: resetError } = await supabase.auth.updateUser({
                password: password
            });

            if (resetError) {
                setError(resetError.message);
            } else {
                setSuccess(true);
                // Let user see success message before redirecting
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center border border-slate-100 italic">
                    <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="text-green-500" size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4">Password Set!</h2>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        Your account is now secure. Redirecting you to the dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="bg-blue-600 p-8 text-white text-center">
                    <div className="mx-auto w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4">
                        <Shield size={32} />
                    </div>
                    <h1 className="text-2xl font-bold">Secure Your Account</h1>
                    <p className="text-blue-100 text-sm mt-2 opacity-80">Please set a strong password to continue</p>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm flex items-start gap-3">
                            <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
                            <p className="font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleReset} className="space-y-6">
                        <div className="group">
                            <label className="block text-sm font-bold text-slate-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
                                    placeholder="At least 6 characters"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-sm font-bold text-slate-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
                                    placeholder="Repeat new password"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 disabled:opacity-70 active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Initialize Account</span>
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                        Digital Workspace Services Administration
                    </p>
                </div>
            </div>
        </div>
    );
}
