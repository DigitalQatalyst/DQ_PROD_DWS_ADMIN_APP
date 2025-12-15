import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, EditIcon, TrashIcon } from 'lucide-react';
type ExpandableTableRowProps = {
  row: any;
  columns: {
    key: string;
    label: string;
    primary?: boolean;
  }[];
  onEdit?: (id: string | number, updatedRow: any) => void;
  onDelete?: (id: string | number) => void;
  expandedContent: React.ReactNode;
};
export const ExpandableTableRow: React.FC<ExpandableTableRowProps> = ({
  row,
  columns,
  onEdit,
  onDelete,
  expandedContent
}) => {
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  return <>
      <tr className="border-b hover:bg-gray-50 transition-colors">
        {columns.map(column => <td key={column.key} className={`px-4 py-3 ${column.primary ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
            {row[column.key]}
          </td>)}
        <td className="px-4 py-3 text-right whitespace-nowrap">
          <div className="flex items-center justify-end space-x-2">
            {onEdit && <button onClick={() => onEdit(row.id, row)} className="p-1 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50" title="Edit">
                <EditIcon className="w-4 h-4" />
              </button>}
            {onDelete && <button onClick={() => onDelete(row.id)} className="p-1 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50" title="Delete">
                <TrashIcon className="w-4 h-4" />
              </button>}
            <button onClick={toggleExpanded} className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100" title={expanded ? 'Collapse' : 'Expand'}>
              {expanded ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
            </button>
          </div>
        </td>
      </tr>
      {expanded && <tr className="bg-gray-50">
          <td colSpan={columns.length + 1} className="px-4 py-3">
            <div className="border-t border-gray-200 pt-3">
              {expandedContent}
            </div>
          </td>
        </tr>}
    </>;
};