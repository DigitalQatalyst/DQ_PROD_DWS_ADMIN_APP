import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    SearchIcon, ChevronLeftIcon, ChevronRightIcon,
    PlusIcon, BookIcon, EditIcon, CheckCircleIcon, ClockIcon,
    FileTextIcon, ListIcon
} from 'lucide-react';
import { useKnowledgeHub } from '../hooks/useKnowledgeHub';
import { useAuth } from '../context/AuthContext';
import { Content } from '../types';
import { AppLayout } from './AppLayout';

export const KnowledgeHubManagementPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, role } = useAuth();
    const { data: guideData, loading, error, list } = useKnowledgeHub();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [domainFilter, setDomainFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        list({ search: searchQuery, status: statusFilter, domain: domainFilter });
    }, [list, searchQuery, statusFilter, domainFilter]);

    const filteredData = useMemo(() => {
        let result = [...guideData];
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(item =>
                item.title.toLowerCase().includes(q) ||
                item.summary?.toLowerCase().includes(q) ||
                item.author?.toLowerCase().includes(q)
            );
        }
        if (statusFilter !== 'All') {
            result = result.filter(item => item.status === statusFilter);
        }
        if (domainFilter !== 'All') {
            result = result.filter(item => item.category === domainFilter);
        }
        return result;
    }, [guideData, searchQuery, statusFilter, domainFilter]);

    const summaryData = useMemo(() => [
        {
            id: 'draft',
            title: 'Drafts',
            count: guideData.filter(g => g.status === 'Draft').length,
            icon: FileTextIcon,
            color: 'bg-gray-100 text-gray-600',
            status: 'Draft'
        },
        {
            id: 'submitted',
            title: 'Submitted',
            count: guideData.filter(g => g.status === 'Submitted').length,
            icon: ClockIcon,
            color: 'bg-amber-100 text-amber-600',
            status: 'Submitted'
        },
        {
            id: 'approved',
            title: 'Approved',
            count: guideData.filter(g => g.status === 'Approved').length,
            icon: CheckCircleIcon,
            color: 'bg-green-100 text-green-600',
            status: 'Approved'
        },
        {
            id: 'published',
            title: 'Published',
            count: guideData.filter(g => g.status === 'Published').length,
            icon: ListIcon,
            color: 'bg-blue-100 text-blue-600',
            status: 'Published'
        }
    ], [guideData]);

    const domains = useMemo(() => {
        const d = new Set<string>();
        guideData.forEach(g => {
            if (g.category) d.add(g.category);
        });
        return Array.from(d).sort();
    }, [guideData]);

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const handleEdit = (id: string) => {
        navigate(`/content-form/${id}`);
    };

    const handleCreate = () => {
        navigate('/content-form', { state: { activeTab: 'Guide' } });
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Knowledge Hub</h1>
                    <p className="mt-2 text-slate-500 font-medium">Manage institutional guides and instructional excellence</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 translate-y-[-4px]"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Create New
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {summaryData.map(item => {
                    const isActive = statusFilter === item.status;
                    return (
                        <div
                            key={item.id}
                            onClick={() => setStatusFilter(isActive ? 'All' : item.status)}
                            className={`rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border px-4 py-5 hover:shadow-[0_15px_35px_rgb(0,0,0,0.06)] transition-all duration-300 cursor-pointer ${isActive ? 'border-blue-400 bg-blue-50/50 ring-2 ring-blue-500/10' : 'border-slate-100 bg-white'
                                }`}
                        >
                            <div className="flex items-center">
                                <div className={`p-3 rounded-xl ${item.color} mr-4 shadow-sm`}>
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm text-slate-500 font-bold uppercase tracking-wider">
                                        {item.title}
                                    </h3>
                                    <p className={`text-2xl font-black ${isActive ? 'text-blue-900' : 'text-slate-900'}`}>
                                        {item.count}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex flex-wrap gap-4 items-center justify-between">
                    <div className="relative flex-1 max-w-md group">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search guides, authors, or topics..."
                            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium bg-white/80"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                            <span className="pl-3 text-[10px] font-black uppercase text-slate-400 tracking-widest">Filter By</span>
                            <div className="h-4 w-[1px] bg-slate-100 mx-1"></div>
                            <select
                                className="border-none bg-transparent rounded-lg px-3 py-2 outline-none text-sm font-bold text-slate-700 cursor-pointer min-w-[140px]"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">All Statuses</option>
                                <option value="Published">Published</option>
                                <option value="Draft">Draft</option>
                                <option value="Submitted">Submitted</option>
                                <option value="Approved">Approved</option>
                            </select>
                            <div className="h-4 w-[1px] bg-slate-100 mx-1"></div>
                            <select
                                className="border-none bg-transparent rounded-lg px-3 py-2 outline-none text-sm font-bold text-slate-700 cursor-pointer min-w-[160px]"
                                value={domainFilter}
                                onChange={(e) => setDomainFilter(e.target.value)}
                            >
                                <option value="All">All Domains</option>
                                {domains.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-left">Title & Summary</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-left">Author</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-left">Domain</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-left">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-left">Last Modified</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right px-8">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                        Loading guides...
                                    </td>
                                </tr>
                            ) : paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                        No guides found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((guide) => (
                                    <tr key={guide.id} className="hover:bg-blue-50/30 transition-all group/row border-b border-slate-50 last:border-0">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center">
                                                <div className="w-12 h-12 bg-blue-100/50 rounded-2xl flex items-center justify-center mr-4 shadow-sm group-hover/row:scale-110 transition-transform duration-300">
                                                    <BookIcon className="text-blue-600 w-6 h-6" />
                                                </div>
                                                <div className="max-w-md">
                                                    <p className="font-extrabold text-slate-900 leading-tight group-hover/row:text-blue-600 transition-colors uppercase tracking-tight text-sm">{guide.title}</p>
                                                    <p className="text-[11px] text-slate-400 font-medium mt-1 line-clamp-2 leading-relaxed">{guide.summary || 'No summary provided.'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-700">{guide.author}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{guide.authorInfo?.organization || 'Institutional'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200/50 shadow-sm">
                                                {guide.category || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center">
                                                <div className={`w-2 h-2 rounded-full mr-2 shadow-sm ${guide.status === 'Published' ? 'bg-emerald-500 animate-pulse' :
                                                    guide.status === 'Draft' ? 'bg-slate-300' : 'bg-amber-400'
                                                    }`}></div>
                                                <span className={`text-[11px] font-black uppercase tracking-wider ${guide.status === 'Published' ? 'text-emerald-700' :
                                                    guide.status === 'Draft' ? 'text-slate-500' : 'text-amber-700'
                                                    }`}>
                                                    {guide.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                                {new Date(guide.lastModified).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right px-8">
                                            <button
                                                onClick={() => handleEdit(guide.id)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm active:scale-95"
                                            >
                                                <EditIcon className="w-3.5 h-3.5" />
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                    <p className="text-sm text-slate-500 font-bold tracking-tight">
                        Showing <span className="text-slate-900">{(currentPage - 1) * rowsPerPage + 1}</span> to <span className="text-slate-900">{Math.min(currentPage * rowsPerPage, filteredData.length)}</span> of <span className="text-slate-900 px-1 font-black bg-blue-50 rounded text-blue-600">{filteredData.length}</span> results
                    </p>
                    <div className="flex items-center gap-3">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-90"
                        >
                            <ChevronLeftIcon className="w-5 h-5 text-slate-600" />
                        </button>
                        <div className="flex items-center px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Page</span>
                            <span className="mx-2 text-sm font-black text-blue-600">{currentPage}</span>
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest mx-1">of</span>
                            <span className="ml-1 text-sm font-black text-slate-900">{totalPages || 1}</span>
                        </div>
                        <button
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-90"
                        >
                            <ChevronRightIcon className="w-5 h-5 text-slate-600" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
