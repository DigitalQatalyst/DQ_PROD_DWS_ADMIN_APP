import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import {
    Users, UserPlus, Mail, Shield, Trash2, Search, Filter,
    MoreVertical, Edit2, CheckCircle, XCircle, AlertCircle, X, ChevronDown
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { UserRole } from '../types';

interface ManagedUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: 'Active' | 'Pending' | 'Disabled';
    last_login?: string;
}

export default function UsersPage() {
    const { role: currentUserRole } = useAuth();
    const [users, setUsers] = useState<ManagedUser[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'viewer' as UserRole
    });

    // Mock initial data - In real app, this comes from a 'profiles' view or RPC
    useEffect(() => {
        const fetchUsers = async () => {
            // Simulation of a fetch
            setTimeout(() => {
                setUsers([
                    { id: '1', name: 'Super Admin', email: 'admin@test.com', role: 'admin', status: 'Active' },
                    { id: '2', name: 'HR Lead', email: 'hr.admin@test.com', role: 'hr_admin', status: 'Active' },
                    { id: '3', name: 'New Staff', email: 'new.member@test.com', role: 'content_member', status: 'Pending' },
                    { id: '4', name: 'Inactive User', email: 'old@test.com', role: 'viewer', status: 'Disabled' },
                ]);
                setIsLoading(false);
            }, 500);
        };
        fetchUsers();
    }, []);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // In a real app, you'd use a Supabase Edge Function to invite:
        // supabase.functions.invoke('invite-user', { body: formData })

        const newUser: ManagedUser = {
            id: Math.random().toString(36).substr(2, 9),
            name: formData.name,
            email: formData.email,
            role: formData.role,
            status: 'Pending'
        };

        setUsers([newUser, ...users]);
        setShowInviteModal(false);
        setFormData({ name: '', email: '', role: 'viewer' });
        setIsLoading(false);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        const updatedUsers = users.map(u =>
            u.id === editingUser.id
                ? { ...u, name: formData.name, role: formData.role }
                : u
        );

        setUsers(updatedUsers);
        setEditingUser(null);
        setFormData({ name: '', email: '', role: 'viewer' });
    };

    const onApprove = (id: string) => {
        setUsers(users.map(u => u.id === id ? { ...u, status: 'Active' } : u));
    };

    const onDelete = (id: string) => {
        if (window.confirm('Are you sure you want to remove this user?')) {
            setUsers(users.filter(u => u.id !== id));
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
                        <p className="text-slate-500 font-medium">Configure team permissions and active administrative roles.</p>
                    </div>

                    {canManage && (
                        <button
                            onClick={() => {
                                setFormData({ name: '', email: '', role: 'viewer' });
                                setShowInviteModal(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-blue-100 active:scale-95"
                        >
                            <UserPlus size={20} />
                            Invite New User
                        </button>
                    )}
                </div>

                {/* Stats/Filters */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name, email or role..."
                                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.1em] border-b border-slate-50">
                                    <th className="px-8 py-5">User Identity</th>
                                    <th className="px-8 py-5">Assigned Role</th>
                                    <th className="px-8 py-5">Current Status</th>
                                    <th className="px-8 py-5 text-right">Administrative Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {isLoading ? (
                                    Array(3).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={4} className="px-8 py-8 h-20 bg-slate-50/50" />
                                        </tr>
                                    ))
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-medium font-italic">
                                            No users found matching your search.
                                        </td>
                                    </tr>
                                ) : filteredUsers.map((u) => (
                                    <tr key={u.id} className="group hover:bg-blue-50/30 transition-all duration-200">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 flex items-center justify-center font-bold text-lg border border-white shadow-sm">
                                                    {u.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm">{u.name}</p>
                                                    <p className="text-slate-400 text-[11px] font-medium uppercase tracking-wide">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                                                <Shield size={14} />
                                                <span className="text-xs font-bold capitalize">{u.role.replace('_', ' ')}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${u.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                                                    u.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
                                                }`}>
                                                {u.status === 'Pending' && <AlertCircle size={12} />}
                                                {u.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {u.status === 'Pending' && (
                                                    <button
                                                        onClick={() => onApprove(u.id)}
                                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors title='Approve User'"
                                                    >
                                                        <CheckCircle size={20} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        setEditingUser(u);
                                                        setFormData({ name: u.name, email: u.email, role: u.role });
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                {currentUserRole === 'admin' && (
                                                    <button
                                                        onClick={() => onDelete(u.id)}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
                        <div className="p-10">
                            <div className="flex justify-between items-center mb-10">
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                                    {editingUser ? 'Edit Permissions' : 'Invite Member'}
                                </h2>
                                <button onClick={() => { setShowInviteModal(false); setEditingUser(null); }} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors">
                                    <X size={24} className="text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={editingUser ? handleUpdate : handleInvite} className="space-y-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Full Identity Name</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. Alexander Pierce"
                                            className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold text-slate-800"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Professional Email</label>
                                        <input
                                            required
                                            disabled={!!editingUser}
                                            type="email"
                                            placeholder="alex.p@company.com"
                                            className={`w-full px-5 py-4 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold text-slate-800 ${editingUser ? 'bg-slate-100 cursor-not-allowed text-slate-400' : 'bg-slate-50'}`}
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Assign Access Role</label>
                                        <div className="relative">
                                            <select
                                                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold text-slate-800 appearance-none"
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
                                            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => { setShowInviteModal(false); setEditingUser(null); }}
                                        className="flex-1 py-4 px-6 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition-all border border-slate-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-3 bg-blue-600 hover:bg-blue-700 text-white py-4 px-10 rounded-2xl font-black transition-all shadow-xl shadow-blue-100 active:scale-95"
                                    >
                                        {editingUser ? 'Apply Changes' : 'Send Invitation'}
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
