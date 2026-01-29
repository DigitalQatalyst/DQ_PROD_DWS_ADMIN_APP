import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import {
    Users, UserPlus, Mail, Shield, Trash2, Search, Filter,
    Edit2, CheckCircle, AlertCircle, X, ChevronDown, RefreshCcw
} from 'lucide-react';
import { supabaseAdmin } from '../lib/supabase';
import { UserRole } from '../types';

interface ManagedUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: 'Active' | 'Pending' | 'Disabled';
    last_login?: string;
    created_at: string;
}

export default function UsersPage() {
    const { role: currentUserRole } = useAuth();
    const [users, setUsers] = useState<ManagedUser[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'viewer' as UserRole
    });

    const fetchUsers = async () => {
        setIsLoading(true);
        setActionError(null);
        try {
            const { data, error } = await supabaseAdmin.auth.admin.listUsers();

            if (error) throw error;

            const mappedUsers: ManagedUser[] = data.users.map(u => ({
                id: u.id,
                name: u.user_metadata?.display_name || u.user_metadata?.full_name || 'Unnamed User',
                email: u.email || '',
                role: (u.user_metadata?.role as UserRole) || 'viewer',
                status: u.email_confirmed_at ? 'Active' : 'Pending',
                created_at: u.created_at,
                last_login: u.last_sign_in_at
            }));

            // Sort by creation date
            setUsers(mappedUsers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        } catch (err: any) {
            console.error('Error fetching users:', err);
            setActionError('Failed to fetch users. Ensure your Service Role Key is valid.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setActionError(null);

        try {
            const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
                formData.email,
                {
                    redirectTo: import.meta.env.VITE_SITE_URL || 'https://dq-prod-dws-admin-app.vercel.app/',
                    data: {
                        display_name: formData.name,
                        role: formData.role,
                        user_segment: 'internal'
                    }
                }
            );

            if (error) throw error;

            setShowInviteModal(false);
            setFormData({ name: '', email: '', role: 'viewer' });
            fetchUsers(); // Refresh list
        } catch (err: any) {
            console.error('Invite error:', err);
            setActionError(err.message || 'Failed to send invitation.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        setIsLoading(true);

        try {
            const { error } = await supabaseAdmin.auth.admin.updateUserById(
                editingUser.id,
                {
                    user_metadata: {
                        display_name: formData.name,
                        role: formData.role
                    }
                }
            );

            if (error) throw error;

            setEditingUser(null);
            setFormData({ name: '', email: '', role: 'viewer' });
            fetchUsers();
        } catch (err: any) {
            setActionError(err.message || 'Failed to update user.');
        } finally {
            setIsLoading(false);
        }
    };

    const onApprove = async (id: string) => {
        if (!window.confirm('Manually approve and verify this user?')) return;

        try {
            const { error } = await supabaseAdmin.auth.admin.updateUserById(id, {
                email_confirm: true
            });
            if (error) throw error;
            fetchUsers();
        } catch (err: any) {
            setActionError(err.message || 'Failed to approve user.');
        }
    };

    const onDelete = async (id: string) => {
        if (!window.confirm('PERMANENTLY remove this user from the system? This cannot be undone.')) return;

        try {
            const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
            if (error) throw error;
            fetchUsers();
        } catch (err: any) {
            setActionError(err.message || 'Failed to delete user.');
        }
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const canManage = ['admin', 'hr_admin', 'content_admin'].includes(currentUserRole);

    return (
        <AppLayout activeSection="users">
            <div className="p-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-xl">
                                <Users className="text-blue-600" size={28} />
                            </div>
                            User Management
                        </h1>
                        <p className="text-slate-500 font-medium">Live control panel for the platform administration team.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchUsers}
                            className="p-3 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all border border-slate-100 bg-slate-50 shadow-sm"
                            title="Refresh Users"
                        >
                            <RefreshCcw size={20} className={isLoading ? 'animate-spin' : ''} />
                        </button>

                        {canManage && (
                            <button
                                onClick={() => {
                                    setFormData({ name: '', email: '', role: 'viewer' });
                                    setShowInviteModal(true);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-blue-100 active:scale-95"
                            >
                                <UserPlus size={20} />
                                Invite New Staff
                            </button>
                        )}
                    </div>
                </div>

                {actionError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 flex items-center gap-3 text-sm font-bold">
                        <AlertCircle size={20} />
                        {actionError}
                    </div>
                )}

                {/* User Table Card */}
                <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/20">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search staff by identity or role..."
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-semibold"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] bg-slate-50/50">
                                    <th className="px-8 py-5 border-b border-slate-100">Identity Details</th>
                                    <th className="px-8 py-5 border-b border-slate-100">Access Role</th>
                                    <th className="px-8 py-5 border-b border-slate-100">Session Status</th>
                                    <th className="px-8 py-5 border-b border-slate-100 text-right">Settings</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {isLoading && users.length === 0 ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={4} className="px-8 py-8 h-24 bg-slate-50/20" />
                                        </tr>
                                    ))
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-24 text-center">
                                            <div className="flex flex-col items-center gap-2 text-slate-400">
                                                <Users size={48} className="opacity-20 mb-2" />
                                                <p className="font-black text-xs uppercase tracking-widest">No matching staff members found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.map((u) => (
                                    <tr key={u.id} className="group hover:bg-blue-50/40 transition-all duration-300">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 text-blue-600 flex items-center justify-center font-black text-xl shadow-sm group-hover:scale-105 transition-transform">
                                                    {u.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-extrabold text-slate-800 text-[15px]">{u.name}</p>
                                                    <p className="text-slate-400 text-[11px] font-bold tracking-tight">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-100 shadow-sm text-blue-700">
                                                <Shield size={14} className="opacity-60" />
                                                <span className="text-[11px] font-black uppercase tracking-wider">{u.role.replace('_', ' ')}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] ${u.status === 'Active'
                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                : 'bg-amber-50 text-amber-600 border border-amber-100'
                                                }`}>
                                                <div className={`h-1.5 w-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                                                {u.status}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                                                {u.status === 'Pending' && (
                                                    <button
                                                        onClick={() => onApprove(u.id)}
                                                        className="p-3 bg-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-2xl transition-all shadow-lg shadow-emerald-100"
                                                        title="Verify Identity"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        setEditingUser(u);
                                                        setFormData({ name: u.name, email: u.email, role: u.role });
                                                    }}
                                                    className="p-3 bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white rounded-2xl transition-all shadow-lg shadow-blue-100"
                                                    title="Modify Permissions"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                {currentUserRole === 'admin' && (
                                                    <button
                                                        onClick={() => onDelete(u.id)}
                                                        className="p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-lg shadow-red-100"
                                                        title="Revoke Access"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Invite/Edit Modal */}
            {(showInviteModal || editingUser) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
                        <div className="p-12 relative">
                            <button
                                onClick={() => { setShowInviteModal(false); setEditingUser(null); }}
                                className="absolute top-8 right-8 p-4 hover:bg-slate-100 rounded-3xl transition-all group"
                            >
                                <X size={28} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                            </button>

                            <div className="mb-12">
                                <div className="inline-flex p-4 bg-blue-50 text-blue-600 rounded-3xl mb-6">
                                    {editingUser ? <Edit2 size={32} /> : <UserPlus size={32} />}
                                </div>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
                                    {editingUser ? 'Edit Staff Identity' : 'Invite New Staff'}
                                </h2>
                                <p className="text-slate-400 font-bold mt-2">
                                    {editingUser ? 'Modify administrative permissions and identifiers.' : 'The user will receive a Supabase invitation link to set their password.'}
                                </p>
                            </div>

                            <form onSubmit={editingUser ? handleUpdate : handleInvite} className="space-y-8">
                                <div className="space-y-7">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2">Display Name</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. Michael Chen"
                                            className="w-full px-7 py-5 bg-slate-50 rounded-[1.5rem] border-none ring-1 ring-slate-200 focus:ring-4 focus:ring-blue-600/10 focus:bg-white outline-none transition-all font-bold text-lg text-slate-800"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>

                                    {!editingUser && (
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2">Email Address</label>
                                            <input
                                                required
                                                type="email"
                                                placeholder="m.chen@digitalqatalyst.com"
                                                className="w-full px-7 py-5 bg-slate-50 rounded-[1.5rem] border-none ring-1 ring-slate-200 focus:ring-4 focus:ring-blue-600/10 focus:bg-white outline-none transition-all font-bold text-lg text-slate-800"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2">Assign Platform Role</label>
                                        <div className="relative">
                                            <select
                                                className="w-full px-7 py-5 bg-slate-50 rounded-[1.5rem] border-none ring-1 ring-slate-200 focus:ring-4 focus:ring-blue-600/10 focus:bg-white outline-none transition-all font-extrabold text-lg text-slate-800 appearance-none cursor-pointer"
                                                value={formData.role}
                                                onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                                            >
                                                <option value="hr_admin">HR Administrator</option>
                                                <option value="hr_member">HR Team Member</option>
                                                <option value="content_admin">Content Administrator</option>
                                                <option value="content_member">Content Team Member</option>
                                                <option value="viewer">Guest Viewer</option>
                                                {currentUserRole === 'admin' && <option value="admin">Platform Super Admin</option>}
                                            </select>
                                            <ChevronDown className="absolute right-7 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={24} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-[1.5rem] font-black text-xl transition-all shadow-2xl shadow-blue-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        {isLoading ? (
                                            <div className="h-6 w-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <span>{editingUser ? 'Commit Changes' : 'Send Activation Link'}</span>
                                                <Mail size={24} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
