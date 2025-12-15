import React, { useState } from 'react';
import { CornerUpLeftIcon, XIcon } from 'lucide-react';
type SendBackModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, comments: string) => void;
  listing: any;
};
export const SendBackModal: React.FC<SendBackModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  listing
}) => {
  const [reason, setReason] = useState('');
  const [comments, setComments] = useState('');
  if (!isOpen) return null;
  const reasons = ['Missing information', 'Unclear description', 'Poor quality images', 'Pricing issues', 'Category mismatch', 'Policy violation', 'Other'];
  const handleSubmit = () => {
    if (!reason) {
      alert('Please select a reason');
      return;
    }
    onConfirm(reason, comments);
  };
  return <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button type="button" className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none" onClick={onClose}>
              <span className="sr-only">Close</span>
              <XIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
              <CornerUpLeftIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Send Back for Revision
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  You are sending "{listing.title}" back to the partner for
                  revisions. Please select a reason and provide additional
                  comments to help them make the necessary changes.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
              Reason for revision
            </label>
            <select id="reason" name="reason" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" value={reason} onChange={e => setReason(e.target.value)}>
              <option value="">Select a reason</option>
              {reasons.map(r => <option key={r} value={r}>
                  {r}
                </option>)}
            </select>
          </div>
          <div className="mt-5">
            <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
              Additional comments
            </label>
            <textarea id="comments" name="comments" rows={4} className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md" placeholder="Provide specific feedback for improvements..." value={comments} onChange={e => setComments(e.target.value)}></textarea>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm" onClick={handleSubmit}>
              Send Back
            </button>
            <button type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>;
};