import React, { useEffect, useState, useMemo, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    SearchIcon, ChevronLeftIcon, ChevronRightIcon,
    PlusIcon, BookIcon, EditIcon, CheckCircleIcon, ClockIcon,
    FileTextIcon, ListIcon, InfoIcon, FilterIcon, ChevronDownIcon,
    ArchiveIcon, CalendarIcon, EyeIcon, DownloadIcon, XCircleIcon
} from 'lucide-react';
import { useKnowledgeHub } from '../hooks/useKnowledgeHub';
import { useAuth } from '../context/AuthContext';
import { Content } from '../types';
import { Can } from './auth/Can';
import { ContentDetailsDrawer } from './ContentDetailsDrawer';
import { ApproveModal } from './ApproveModal';
import { RejectModal } from './RejectModal';
import { SendBackModal } from './SendBackModal';
import { Toast } from './ui/Toast';

export const KnowledgeHubManagementPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, role } = useAuth();
    const { data: guideData, loading, error, list } = useKnowledgeHub();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [domainFilter, setDomainFilter] = useState('All');
    const [sortOrder, setSortOrder] = useState('Newest First');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedContent, setSelectedContent] = useState<Content | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showSendBackModal, setShowSendBackModal] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

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

        return result.sort((a, b) => {
            const dateA = new Date(a.lastModified).getTime();
            const dateB = new Date(b.lastModified).getTime();
            return sortOrder === 'Newest First' ? dateB - dateA : dateA - dateB;
        });
    }, [guideData, searchQuery, statusFilter, domainFilter, sortOrder]);

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

    const handleEdit = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        navigate(`/content-form/${id}`);
    };

    const handleCreate = () => {
        navigate('/content-form', { state: { activeTab: 'Guide' } });
    };

    const handleRowClick = (content: Content) => {
        setSelectedContent(content);
        setIsDrawerOpen(true);
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setStatusFilter('All');
        setDomainFilter('All');
        setSortOrder('Newest First');
        setCurrentPage(1);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="px-4 sm:px-6 pt-4 pb-20 bg-gray-50 min-h-screen">
            {/* Page Header */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 text-center sm:text-left">
                            Knowledge Hub
                        </h1>
                        <div className="relative group hidden sm:block">
                            <InfoIcon className="w-5 h-5 text-gray-400 cursor-help" />
                            <div className="absolute left-0 top-full mt-2 w-72 bg-white p-3 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                <p className="text-sm text-gray-700">
                                    Manage institutional guides and instructional excellence.
                                </p>
                            </div>
                        </div>
                    </div>
                    <Can I="create" a="Content">
                        <button
                            onClick={handleCreate}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm flex items-center justify-center text-sm font-medium hidden sm:flex"
                        >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Create New
                        </button>
                    </Can>
                </div>
                <p className="text-sm text-gray-500 text-center sm:text-left">
                    Manage institutional guides and instructional excellence
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {summaryData.map(item => {
                    const isActive = statusFilter === item.status;
                    return (
                        <div
                            key={item.id}
                            onClick={() => setStatusFilter(isActive ? 'All' : item.status)}
                            className={`rounded-xl shadow-sm border bg-white px-3 py-4 hover:shadow-md transition-all duration-200 ease-in-out cursor-pointer ${isActive ? 'border-blue-300 bg-blue-50' : 'border-gray-100'
                                }`}
                        >
                            <div className="flex items-center">
                                <div className={`p-2.5 rounded-full ${item.color} mr-3`}>
                                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-[13px] text-gray-600 font-medium truncate">
                                        {item.title}
                                    </h3>
                                    <p className={`text-lg sm:text-xl font-semibold ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                                        {item.count}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Toolbar */}
            <div className="sticky top-0 bg-gray-50 z-20 pb-2">
                <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
                    <div className="flex flex-col gap-4">
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-xs"
                                placeholder="Search guides, authors, or topics..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex overflow-x-auto gap-3 px-1 pb-2 scrollbar-hide">
                            <div className="min-w-[140px] relative">
                                <select
                                    className="appearance-none w-full bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Published">Published</option>
                                    <option value="Draft">Draft</option>
                                    <option value="Submitted">Submitted</option>
                                    <option value="Approved">Approved</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <ChevronDownIcon className="h-4 w-4" />
                                </div>
                            </div>

                            <div className="min-w-[160px] relative">
                                <select
                                    className="appearance-none w-full bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                                    value={domainFilter}
                                    onChange={(e) => setDomainFilter(e.target.value)}
                                >
                                    <option value="All">All Domains</option>
                                    {domains.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <ChevronDownIcon className="h-4 w-4" />
                                </div>
                            </div>

                            <div className="min-w-[140px] relative">
                                <select
                                    className="appearance-none w-full bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                >
                                    <option value="Newest First">Newest First</option>
                                    <option value="Oldest First">Oldest First</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <ChevronDownIcon className="h-4 w-4" />
                                </div>
                            </div>

                            {(statusFilter !== 'All' || domainFilter !== 'All' || searchQuery !== '' || sortOrder !== 'Newest First') && (
                                <button
                                    onClick={handleClearFilters}
                                    className="flex-shrink-0 h-full inline-flex items-center px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-150"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 hidden md:block mt-2">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">Institutional Guides</h2>
                    <p className="text-sm text-gray-500">
                        {filteredData.length > 0 ? `Showing ${Math.min((currentPage - 1) * rowsPerPage + 1, filteredData.length)}-${Math.min(currentPage * rowsPerPage, filteredData.length)} of ${filteredData.length} items` : 'No items found'}
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title & Summary</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Author</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Domain</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Modified</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                                            <span>Loading guides...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <FilterIcon className="h-12 w-12 text-gray-300 mb-4" />
                                            <p className="text-lg font-medium text-gray-900">No guides found</p>
                                            <p className="mt-1">Try adjusting your filters or search query</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((guide) => (
                                    <tr
                                        key={guide.id}
                                        onClick={() => handleRowClick(guide)}
                                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center min-w-[300px]">
                                                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                                                    <BookIcon className="text-blue-600 w-5 h-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-gray-900 truncate">{guide.title}</p>
                                                    <p className="text-xs text-gray-500 truncate mt-0.5">{guide.summary || 'No summary provided.'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900">{guide.author || 'N/A'}</span>
                                                <span className="text-xs text-gray-500">{guide.authorInfo?.organization || 'Institutional'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                                {guide.category || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className={`w-1.5 h-1.5 rounded-full mr-2 ${guide.status === 'Published' ? 'bg-green-500' :
                                                    guide.status === 'Draft' ? 'bg-gray-400' : 'bg-amber-400'
                                                    }`}></div>
                                                <span className={`text-xs font-medium ${guide.status === 'Published' ? 'text-green-700' :
                                                    guide.status === 'Draft' ? 'text-gray-600' : 'text-amber-700'
                                                    }`}>
                                                    {guide.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(guide.lastModified)}
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Can I="update" a="Content">
                                                    <button
                                                        onClick={(e) => handleEdit(e, guide.id)}
                                                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                    >
                                                        <EditIcon className="w-4 h-4" />
                                                    </button>
                                                </Can>
                                                <EyeIcon className="w-4 h-4 text-gray-400" />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredData.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="text-sm text-gray-700">
                                Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages || 1}</span>
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Previous
                            </button>
                            <button
                                disabled={currentPage === totalPages || totalPages === 0}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-3 mt-2">
                {paginatedData.map(guide => (
                    <div
                        key={guide.id}
                        onClick={() => handleRowClick(guide)}
                        className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm active:scale-[0.98] transition-all"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-900 line-clamp-2 pr-4">{guide.title}</h3>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${guide.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                {guide.status}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{guide.summary}</p>
                        <div className="flex justify-between items-end border-t pt-3">
                            <div className="text-[10px] text-gray-400">
                                <p className="font-bold text-gray-600 uppercase tracking-wider">{guide.author}</p>
                                <p>{formatDate(guide.lastModified)}</p>
                            </div>
                            <div className="flex gap-2">
                                <Can I="update" a="Content">
                                    <button onClick={(e) => handleEdit(e, guide.id)} className="text-blue-600 text-xs font-bold">Edit</button>
                                </Can>
                                <button className="text-blue-600 text-xs font-bold">View</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Floating Action Button */}
            <Can I="create" a="Content">
                <div className="fixed bottom-16 right-5 sm:bottom-6 sm:right-6 z-30">
                    <button
                        onClick={handleCreate}
                        className="rounded-full w-14 h-14 bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all flex items-center justify-center animate-bounce-slow"
                        aria-label="Create new guide"
                    >
                        <PlusIcon className="h-6 w-6" />
                    </button>
                </div>
            </Can>

            {/* Content Details Drawer */}
            {selectedContent && (
                <ContentDetailsDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => {
                        setIsDrawerOpen(false);
                        setSelectedContent(null);
                    }}
                    content={selectedContent}
                    onApprove={() => setShowApproveModal(true)}
                    onReject={() => setShowRejectModal(true)}
                    onSendBack={() => setShowSendBackModal(true)}
                    onRefresh={() => list({ search: searchQuery, status: statusFilter, domain: domainFilter })}
                />
            )}

            {/* Modals */}
            {selectedContent && (
                <>
                    <ApproveModal
                        isOpen={showApproveModal}
                        onClose={() => setShowApproveModal(false)}
                        listing={selectedContent}
                        onConfirm={() => {
                            // Logic would be here to handle approval via KnowledgeHub service
                            setShowApproveModal(false);
                            setToast({ type: 'success', message: 'Guide approved successfully' });
                            list({ search: searchQuery, status: statusFilter, domain: domainFilter });
                        }}
                    />
                    <RejectModal
                        isOpen={showRejectModal}
                        onClose={() => setShowRejectModal(false)}
                        listing={selectedContent}
                        onConfirm={() => {
                            setShowRejectModal(false);
                            setToast({ type: 'success', message: 'Guide rejected' });
                            list({ search: searchQuery, status: statusFilter, domain: domainFilter });
                        }}
                    />
                    <SendBackModal
                        isOpen={showSendBackModal}
                        onClose={() => setShowSendBackModal(false)}
                        listing={selectedContent}
                        onConfirm={() => {
                            setShowSendBackModal(false);
                            setToast({ type: 'success', message: 'Guide sent back for revisions' });
                            list({ search: searchQuery, status: statusFilter, domain: domainFilter });
                        }}
                    />
                </>
            )}

            {/* Toast Notification */}
            {toast && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};
