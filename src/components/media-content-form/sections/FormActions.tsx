import type React from 'react';

interface FormActionsProps {
  isSaving: boolean;
  isEditing: boolean;
  onCancel: () => void;
  onSubmitButtonClick?: () => void;
}

export const FormActions: React.FC<FormActionsProps> = ({ isSaving, isEditing, onCancel, onSubmitButtonClick }) => (
  <div className="flex justify-end gap-3">
    <button
      type="button"
      onClick={onCancel}
      className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={isSaving}
      onClick={onSubmitButtonClick}
      className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isSaving ? 'Saving...' : isEditing ? 'Update Content' : 'Create Content'}
    </button>
  </div>
);

export default FormActions;

