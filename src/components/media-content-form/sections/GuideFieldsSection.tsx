import type React from 'react';
import RichTextEditor from '../../RichTextEditor';
import type { MediaFormData, UploadState, ValidationErrors } from '../types';

interface GuideFieldsSectionProps {
    formData: MediaFormData;
    errors: ValidationErrors;
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    editorHtml: string;
    onEditorChange: (json: any, html: string) => void;
    uploadState: UploadState;
    onUpload: (file: File | null | undefined) => Promise<void>;
    onRemove: () => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    thumbnailUpload: UploadState;
    onThumbnailUpload: (file: File | null | undefined) => Promise<void>;
    onThumbnailRemove: () => void;
    thumbnailFileInputRef: React.RefObject<HTMLInputElement>;
}

export const GuideFieldsSection: React.FC<GuideFieldsSectionProps> = ({
    formData,
    errors,
    onChange,
    editorHtml,
    onEditorChange,
    uploadState,
    onUpload,
    onRemove,
    fileInputRef,
    thumbnailUpload,
    onThumbnailUpload,
    onThumbnailRemove,
    thumbnailFileInputRef,
}) => {
    const downloadUrl = formData.downloadUrl || uploadState.uploadedUrl;

    return (
        <div className="space-y-8">
            {/* Guide Metadata Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Guide Type</label>
                    <select
                        name="guide_type"
                        value={formData.guide_type}
                        onChange={onChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Select Type</option>
                        <option value="Strategy">Strategy</option>
                        <option value="Guideline">Guideline</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Function Area</label>
                    <input
                        name="function_area"
                        value={formData.function_area}
                        onChange={onChange}
                        placeholder="e.g. HR, Operations"
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Guide Metadata Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Complexity Level</label>
                    <select
                        name="complexity_level"
                        value={formData.complexity_level}
                        onChange={onChange}
                        className="mt-1 block w-full border border-gray-300 rounded-lg py-2.5 px-3.5 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
                    >
                        <option value="">Select Level</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Unit</label>
                    <select
                        name="unit"
                        value={formData.unit}
                        onChange={onChange}
                        className="mt-1 block w-full border border-gray-300 rounded-lg py-2.5 px-3.5 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
                    >
                        <option value="">Select Unit</option>
                        <option value="Stories">Stories</option>
                        <option value="DQ Delivery (Designs)">DQ Delivery (Designs)</option>
                        <option value="DQ Delivery (Deploys)">DQ Delivery (Deploys)</option>
                        <option value="Solutions">Solutions</option>
                        <option value="DQ Ops">DQ Ops</option>
                        <option value="Finance">Finance</option>
                        <option value="Products">Products</option>
                        <option value="Intelligence">Intelligence</option>
                        <option value="HRA">HRA</option>
                    </select>
                </div>
            </div>

            {/* Guide Metadata Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Sub-Domain</label>
                    <input
                        name="sub_domain"
                        value={formData.sub_domain}
                        onChange={onChange}
                        placeholder="e.g. Talent Management"
                        className="mt-1 block w-full border border-gray-300 rounded-lg py-2.5 px-3.5 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                    <select
                        name="location"
                        value={formData.location}
                        onChange={onChange}
                        className="mt-1 block w-full border border-gray-300 rounded-lg py-2.5 px-3.5 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
                    >
                        <option value="">Select Location</option>
                        <option value="NBO">NBO</option>
                        <option value="DXB">DXB</option>
                    </select>
                </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50 transition-all hover:bg-blue-50">
                <input
                    type="checkbox"
                    id="isEditorsPick"
                    name="isEditorsPick"
                    checked={formData.isEditorsPick}
                    onChange={onChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-lg transition-all"
                />
                <label htmlFor="isEditorsPick" className="text-sm font-semibold text-gray-700 cursor-pointer">
                    Editor's Pick
                </label>
            </div>

            {/* Featured Image Section */}
            <div className="border-t border-gray-100 pt-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Featured Image URL <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 flex flex-col md:flex-row items-stretch gap-4">
                    <div className="flex-1 relative">
                        <input
                            id="featuredImage"
                            name="featuredImage"
                            value={formData.featuredImage}
                            onChange={onChange}
                            placeholder="https://images.unsplash.com/..."
                            className={`block w-full border rounded-xl py-3 px-4 shadow-sm transition-all ${errors.featuredImage ? 'border-red-500 bg-red-50' : 'border-gray-300'} hover:border-blue-300`}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            ref={thumbnailFileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={async (event) => {
                                const file = event.target.files?.[0] || null;
                                await onThumbnailUpload(file);
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => thumbnailFileInputRef.current?.click()}
                            className="px-6 py-3 bg-white border border-gray-300 hover:border-blue-500 hover:text-blue-600 text-gray-700 rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            Upload Image
                        </button>
                    </div>
                </div>
                {thumbnailUpload.uploading && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-blue-600 font-medium animate-pulse">
                        <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                        Uploading image…
                    </div>
                )}
                {thumbnailUpload.uploadedUrl && (
                    <div className="mt-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 group">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs text-blue-700 font-bold uppercase tracking-widest">Asset Uploaded</span>
                            <span className="text-sm text-blue-600 truncate">{thumbnailUpload.uploadedUrl}</span>
                        </div>
                        <button type="button" className="text-xs text-red-600 font-bold hover:text-red-700 px-2 py-1 transition-colors" onClick={onThumbnailRemove}>
                            Remove
                        </button>
                    </div>
                )}
                {formData.featuredImage && (
                    <div className="mt-4 w-full max-w-xs aspect-video rounded-xl overflow-hidden border border-gray-200">
                        <img src={formData.featuredImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                )}
            </div>

            {/* Document Upload Part (similar to DocumentFieldsSection) */}
            <div className="border-t border-gray-100 pt-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Document Resource <span className="text-xs font-normal text-gray-400 ml-2">(Optional for written guides)</span>
                </label>
                <div className="mt-1 flex flex-col md:flex-row items-stretch gap-4">
                    <div className="flex-1 relative">
                        <input
                            id="downloadUrl"
                            name="downloadUrl"
                            value={downloadUrl}
                            onChange={onChange}
                            disabled={!!uploadState.uploadedUrl}
                            placeholder="https://cloud.storage.com/guide.pdf"
                            className={`block w-full border rounded-xl py-3 px-4 shadow-sm transition-all ${errors.downloadUrl ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                } ${uploadState.uploadedUrl ? 'bg-gray-50 cursor-not-allowed opacity-75' : 'hover:border-blue-300'}`}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            onChange={async (event) => {
                                const file = event.target.files?.[0] || null;
                                await onUpload(file);
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-6 py-3 bg-white border border-gray-300 hover:border-blue-500 hover:text-blue-600 text-gray-700 rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            Upload Document
                        </button>
                    </div>
                </div>
                {uploadState.uploading && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-blue-600 font-medium animate-pulse">
                        <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                        Uploading resource…
                    </div>
                )}
                {uploadState.uploadedUrl && (
                    <div className="mt-4 flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3 group">
                        <div className="flex items-center gap-2 min-w-0">
                            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            <span className="text-sm text-green-700 font-medium truncate">{uploadState.uploadedUrl}</span>
                        </div>
                        <button type="button" className="text-xs text-red-600 font-bold hover:text-red-700 px-2 py-1 transition-colors" onClick={onRemove}>
                            Remove
                        </button>
                    </div>
                )}
            </div>

            {/* Body Part (similar to ArticleEditorSection) */}
            <div className="border-t border-gray-100 pt-8">
                <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-semibold text-gray-700">
                        Guide Content <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase bg-gray-100 px-2 py-0.5 rounded">Rich Text Mode</span>
                </div>
                <div id="content-editor" className={`rounded-xl overflow-hidden transition-all ${errors.content ? 'ring-2 ring-red-500' : 'ring-1 ring-gray-200 shadow-lg'}`}>
                    <RichTextEditor
                        valueHtml={editorHtml}
                        onChange={onEditorChange}
                        placeholder="Step-by-step instructions go here…"
                        className="!border-none"
                    />
                </div>
                {errors.content && <p className="mt-2 text-sm text-red-600 font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    {errors.content}
                </p>}
            </div>
        </div>
    );
};

export default GuideFieldsSection;
