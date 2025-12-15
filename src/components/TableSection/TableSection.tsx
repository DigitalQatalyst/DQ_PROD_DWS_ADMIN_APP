import React, { useMemo, useState } from 'react';
import { Plus, X, Save, Pencil, Trash2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
export interface Column {
  key: string;
  label: string;
  primary?: boolean; // For mobile view - primary columns show by default
}
export interface TableRow {
  id: string | number;
  [key: string]: any;
}
export interface TableSectionProps {
  title: string;
  columns: Column[];
  data: TableRow[];
  rowsPerPage?: number;
  onAdd?: (newRow: Omit<TableRow, 'id'>) => void;
  onEdit?: (id: string | number, updatedRow: TableRow) => void;
  onDelete?: (id: string | number) => void;
  'data-id'?: string;
}
export function TableSection({
  title,
  columns,
  data,
  rowsPerPage = 10,
  onAdd,
  onEdit,
  onDelete,
  'data-id': dataId
}: TableSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [newRow, setNewRow] = useState<Record<string, any>>({});
  const [editingRow, setEditingRow] = useState<TableRow | null>(null);
  const [expandedRows, setExpandedRows] = useState<(string | number)[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [tableData, setTableData] = useState<TableRow[]>(data);
  // Pagination calculations
  const totalPages = Math.ceil(tableData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = tableData.slice(startIndex, startIndex + rowsPerPage);
  // Helper functions for mobile view
  const getPrimaryColumns = () => columns.filter(col => col.primary !== false && col.key !== 'actions').slice(0, 2);
  const getSecondaryColumns = () => columns.filter(col => !getPrimaryColumns().includes(col) && col.key !== 'actions');
  const handleAddRow = () => {
    setNewRow({});
    setShowForm(true);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, isNewRow = false) => {
    const {
      name,
      value
    } = e.target;
    if (isNewRow) {
      setNewRow(prev => ({
        ...prev,
        [name]: value
      }));
    } else if (editingRow) {
      setEditingRow(prev => prev ? {
        ...prev,
        [name]: value
      } : null);
    }
  };
  const handleSaveNewRow = () => {
    const id = Date.now().toString(); // Simple ID generation
    const newRowWithId = {
      ...newRow,
      id
    };
    setTableData(prev => [...prev, newRowWithId]);
    onAdd?.(newRow);
    setNewRow({});
    setShowForm(false);
  };
  const handleEditRow = (row: TableRow) => {
    setEditingRow({
      ...row
    });
  };
  const handleSaveEditedRow = () => {
    if (!editingRow) return;
    setTableData(prev => prev.map(row => row.id === editingRow.id ? editingRow : row));
    onEdit?.(editingRow.id, editingRow);
    setEditingRow(null);
  };
  const handleDeleteRow = (id: string | number) => {
    setTableData(prev => prev.filter(row => row.id !== id));
    onDelete?.(id);
  };
  const toggleRowExpansion = (id: string | number) => {
    setExpandedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
  };
  const renderCellContent = (row: TableRow, column: Column) => {
    const value = row[column.key];
    if (column.key === 'status') {
      const statusClass = value === 'Active' ? 'bg-green-100 text-green-800' : value === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800';
      return <span className={`px-2 py-1 text-xs rounded-full ${statusClass}`}>
          {value}
        </span>;
    }
    if (column.key === 'percentage') {
      return `${value}%`;
    }
    return value;
  };
  return <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden" data-id={dataId}>
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
        <h3 className="font-medium text-gray-700">{title}</h3>
        <button className="px-3 py-2 text-xs font-medium text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50 flex items-center min-h-[44px]" onClick={handleAddRow}>
          <Plus size={14} className="mr-1" />
          <span>Add New</span>
        </button>
      </div>
      {/* Add New Form */}
      {showForm && <div className="p-4 bg-blue-50 border-b border-blue-200">
          <div className="grid grid-cols-1 gap-4">
            {columns.map(column => column.key !== 'actions' && <div key={column.key} className="flex flex-col">
                    <label className="text-xs font-medium text-gray-500 mb-1">
                      {column.label}
                    </label>
                    <input type="text" name={column.key} value={newRow[column.key] || ''} onChange={e => handleInputChange(e, true)} className="border border-gray-300 rounded px-3 py-2 text-sm min-h-[44px]" />
                  </div>)}
          </div>
          <div className="mt-4 flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
            <button className="px-3 py-2 text-sm font-medium text-gray-600 rounded border border-gray-300 hover:bg-gray-50 flex items-center justify-center min-h-[44px]" onClick={() => {
          setNewRow({});
          setShowForm(false);
        }}>
              <X size={16} className="mr-1" />
              Cancel
            </button>
            <button className="px-3 py-2 text-sm font-medium text-white rounded bg-blue-600 hover:bg-blue-700 flex items-center justify-center min-h-[44px]" onClick={handleSaveNewRow}>
              <Save size={16} className="mr-1" />
              Save
            </button>
          </div>
        </div>}
      {/* Table for desktop */}
      <div className="hidden md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(column => <th key={column.key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {column.label}
                </th>)}
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map(row => <tr key={row.id} className="hover:bg-gray-50">
                {editingRow && editingRow.id === row.id ?
            // Editing mode
            <>
                    {columns.map(column => column.key !== 'actions' && <td key={column.key} className="px-4 py-2">
                            <input type="text" name={column.key} value={editingRow[column.key] || ''} onChange={handleInputChange} className="border border-gray-300 rounded px-3 py-2 text-sm w-full min-h-[44px]" />
                          </td>)}
                    <td className="px-4 py-2 text-right">
                      <button className="text-gray-600 hover:text-gray-800 mr-2 p-2" onClick={() => setEditingRow(null)}>
                        <X size={16} />
                      </button>
                      <button className="text-blue-600 hover:text-blue-800 p-2" onClick={handleSaveEditedRow}>
                        <Save size={16} />
                      </button>
                    </td>
                  </> :
            // View mode
            <>
                    {columns.map(column => <td key={column.key} className="px-4 py-3 text-sm text-gray-700">
                        {renderCellContent(row, column)}
                      </td>)}
                    <td className="px-4 py-3 text-sm text-right">
                      <button className="text-gray-500 hover:text-blue-600 mr-2 p-2" onClick={() => handleEditRow(row)}>
                        <Pencil size={16} />
                      </button>
                      <button className="text-gray-500 hover:text-red-600 p-2" onClick={() => handleDeleteRow(row.id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </>}
              </tr>)}
          </tbody>
        </table>
      </div>
      {/* Cards for mobile */}
      <div className="md:hidden">
        {paginatedData.map(row => <div key={row.id} className="p-4 border-b border-gray-200">
            {editingRow && editingRow.id === row.id ?
        // Mobile editing mode
        <div className="space-y-3">
                {columns.map(column => column.key !== 'actions' && <div key={column.key} className="flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">
                          {column.label}:
                        </label>
                        <input type="text" name={column.key} value={editingRow[column.key] || ''} onChange={handleInputChange} className="border border-gray-300 rounded px-3 py-2 text-sm w-full min-h-[44px]" />
                      </div>)}
                <div className="mt-3 flex justify-end space-x-2">
                  <button className="p-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded" onClick={() => setEditingRow(null)}>
                    <X size={16} />
                  </button>
                  <button className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded" onClick={handleSaveEditedRow}>
                    <Save size={16} />
                  </button>
                </div>
              </div> :
        // Mobile view mode
        <div>
                <div className="flex justify-between items-center cursor-pointer min-h-[44px]" onClick={() => toggleRowExpansion(row.id)}>
                  <div className="flex-1">
                    {getPrimaryColumns().map(column => <div key={column.key} className="mb-1">
                        <span className="text-xs text-gray-500 mr-1">
                          {column.label}:
                        </span>
                        <span className="text-sm text-gray-800 font-medium">
                          {renderCellContent(row, column)}
                        </span>
                      </div>)}
                  </div>
                  <div className="ml-2">
                    {expandedRows.includes(row.id) ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                  </div>
                </div>
                {/* Show secondary columns when expanded */}
                {expandedRows.includes(row.id) && <div className="mt-2 pt-2 border-t border-gray-100">
                    {getSecondaryColumns().map(column => <div key={column.key} className="mb-2">
                        <span className="text-xs text-gray-500 mr-1">
                          {column.label}:
                        </span>
                        <span className="text-sm text-gray-800">
                          {renderCellContent(row, column)}
                        </span>
                      </div>)}
                  </div>}
                <div className="mt-3 flex justify-end space-x-2">
                  <button className="p-2 text-gray-500 hover:text-blue-600 min-h-[44px] min-w-[44px]" onClick={() => handleEditRow(row)}>
                    <Pencil size={16} />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-red-600 min-h-[44px] min-w-[44px]" onClick={() => handleDeleteRow(row.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>}
          </div>)}
      </div>
      {/* Pagination */}
      {totalPages > 1 && <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md min-h-[44px] ${currentPage === 1 ? 'text-gray-300 bg-white' : 'text-gray-700 bg-white hover:bg-gray-50'}`}>
              Previous
            </button>
            <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className={`relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium rounded-md min-h-[44px] ${currentPage === totalPages ? 'text-gray-300 bg-white' : 'text-gray-700 bg-white hover:bg-gray-50'}`}>
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(startIndex + rowsPerPage, tableData.length)}
                </span>{' '}
                of <span className="font-medium">{tableData.length}</span>{' '}
                results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium min-h-[44px] ${currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}>
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                {[...Array(totalPages)].map((_, i) => <button key={i} onClick={() => setCurrentPage(i + 1)} className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium min-h-[44px] min-w-[44px] ${currentPage === i + 1 ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                    {i + 1}
                  </button>)}
                <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium min-h-[44px] ${currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}>
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>}
    </div>;
}