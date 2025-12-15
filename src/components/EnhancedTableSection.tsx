import React, { useMemo, useState } from 'react';
import { ExpandableTableRow } from './ExpandableTableRow';
import { FilterIcon, DownloadIcon, PlusIcon } from 'lucide-react';
type Column = {
  key: string;
  label: string;
  primary?: boolean;
  filterable?: boolean;
};
type TableRow = {
  id: string | number;
  [key: string]: any;
};
type EnhancedTableSectionProps = {
  title: string;
  columns: Column[];
  data: TableRow[];
  rowsPerPage?: number;
  onAdd?: (newRow: Omit<TableRow, 'id'>) => void;
  onEdit?: (id: string | number, updatedRow: TableRow) => void;
  onDelete?: (id: string | number) => void;
  renderExpandedContent: (row: TableRow) => React.ReactNode;
  'data-id'?: string;
};
export const EnhancedTableSection: React.FC<EnhancedTableSectionProps> = ({
  title,
  columns,
  data,
  rowsPerPage = 10,
  onAdd,
  onEdit,
  onDelete,
  renderExpandedContent,
  'data-id': dataId
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  // Apply filters to data
  const filteredData = data.filter(row => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      const rowValue = String(row[key]).toLowerCase();
      return rowValue.includes(value.toLowerCase());
    });
  });
  // Apply sorting to filtered data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);
  // Pagination
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + rowsPerPage);
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }
    setSortConfig({
      key,
      direction
    });
  };
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  const clearFilters = () => {
    setFilters({});
  };
  const exportData = () => {
    alert('Exporting data to CSV...');
    // In a real implementation, you would generate a CSV here
  };
  const refreshData = () => {
    alert('Refreshing data...');
    // In a real implementation, you would fetch fresh data here
  };
  return <div className="bg-white rounded-lg shadow overflow-hidden" data-id={dataId}>
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <div className="flex items-center space-x-2 mt-3 sm:mt-0">
            <button onClick={() => setShowFilters(!showFilters)} className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 flex items-center">
              <FilterIcon className="w-4 h-4 mr-1.5" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <button onClick={refreshData} className="p-1.5 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50" title="Refresh Data">
              <div className="w-4 h-4" />
            </button>
            <button onClick={exportData} className="p-1.5 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50" title="Export Data">
              <DownloadIcon className="w-4 h-4" />
            </button>
            {onAdd && <button onClick={() => onAdd({} as any)} className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 flex items-center">
                <PlusIcon className="w-4 h-4 mr-1.5" />
                Add New
              </button>}
          </div>
        </div>
        {showFilters && <div className="bg-gray-50 p-3 rounded-md mb-4">
            <div className="flex flex-wrap gap-3 items-end">
              {columns.filter(col => col.filterable !== false).map(column => <div key={column.key} className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {column.label}
                    </label>
                    <input type="text" className="w-full p-2 border border-gray-300 rounded-md text-sm" placeholder={`Filter by ${column.label.toLowerCase()}`} value={filters[column.key] || ''} onChange={e => handleFilterChange(column.key, e.target.value)} />
                  </div>)}
              <div className="flex items-center">
                <button onClick={clearFilters} className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300">
                  Clear Filters
                </button>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Showing {filteredData.length} of {data.length} records
            </div>
          </div>}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(column => <th key={column.key} scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort(column.key)}>
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {sortConfig?.key === column.key && <span>
                        {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                      </span>}
                  </div>
                </th>)}
              <th scope="col" className="relative px-4 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length === 0 ? <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-gray-500">
                  No data available
                </td>
              </tr> : paginatedData.map(row => <ExpandableTableRow key={row.id} row={row} columns={columns} onEdit={onEdit} onDelete={onDelete} expandedContent={renderExpandedContent(row)} />)}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(startIndex + rowsPerPage, sortedData.length)}
                </span>{' '}
                of <span className="font-medium">{sortedData.length}</span>{' '}
                results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button onClick={() => handlePageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}>
                  Previous
                </button>
                {Array.from({
              length: totalPages
            }, (_, i) => i + 1).map(page => <button key={page} onClick={() => handlePageChange(page)} className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${currentPage === page ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                    {page}
                  </button>)}
                <button onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}>
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>}
    </div>;
};