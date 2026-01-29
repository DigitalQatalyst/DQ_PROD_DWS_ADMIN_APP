import type React from 'react';

import RichTextEditor from '../../RichTextEditor';
import type { ValidationErrors } from '../types';

interface ArticleEditorSectionProps {
  editorHtml: string;
  onChange: (json: any, html: string) => void;
  errors: ValidationErrors;
}

export const ArticleEditorSection: React.FC<ArticleEditorSectionProps> = ({ editorHtml, onChange, errors }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">
      Body <span className="text-red-500">*</span>
    </label>
    <div id="content-editor" className={`mt-1 border rounded-md ${errors.content ? 'border-red-500' : 'border-gray-300'}`}>
      <RichTextEditor
        valueHtml={editorHtml}
        onChange={onChange}
        placeholder="Write your content…"
      />
    </div>
    {errors.content && <p className="mt-1 text-xs text-red-600">{errors.content}</p>}
  </div>
);

export default ArticleEditorSection;

