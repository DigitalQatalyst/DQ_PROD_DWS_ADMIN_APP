import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  FileText as FileTextIcon,
  Folder as FolderIcon,
  Mic as MicIcon,
  Video as VideoIcon,
} from 'lucide-react';

import { SuccessAnimation } from './SuccessAnimation';
import { useMediaContentFormController } from './media-content-form/hooks/useMediaContentFormController';
import TypeTabs from './media-content-form/sections/TypeTabs';
import { BasicInformationSection } from './media-content-form/sections/BasicInformationSection';
import { ThumbnailClassificationSection } from './media-content-form/sections/ThumbnailClassificationSection';
import { AuthorDetailsSection } from './media-content-form/sections/AuthorDetailsSection';
import { ArticleEditorSection } from './media-content-form/sections/ArticleEditorSection';
import { VideoFieldsSection } from './media-content-form/sections/VideoFieldsSection';
import { PodcastFieldsSection } from './media-content-form/sections/PodcastFieldsSection';
import { DocumentFieldsSection } from './media-content-form/sections/DocumentFieldsSection';
import { GuideFieldsSection } from './media-content-form/sections/GuideFieldsSection';
import { ToolkitFieldsSection } from './media-content-form/sections/ToolkitFieldsSection';
import { BreadcrumbHeader } from './media-content-form/sections/BreadcrumbHeader';
import { ErrorModal } from './media-content-form/sections/ErrorModal';
import { FormActions } from './media-content-form/sections/FormActions';
import type { TabKey } from './media-content-form/types';

const tabIcons: Record<TabKey, React.ReactNode> = {
  Article: <FileTextIcon className="w-5 h-5" />,
  News: <FileTextIcon className="w-5 h-5" />,
  Guide: <FileTextIcon className="w-5 h-5" />,
  Video: <VideoIcon className="w-5 h-5" />,
  Podcast: <MicIcon className="w-5 h-5" />,
  Report: <FolderIcon className="w-5 h-5" />,
  Toolkit: <FolderIcon className="w-5 h-5" />,
};

const typeLabelMap: Record<TabKey, string> = {
  Article: 'Article',
  News: 'News',
  Guide: 'Guide',
  Video: 'Video',
  Podcast: 'Podcast',
  Report: 'Report',
  Toolkit: 'Toolkit',
};

export const MediaContentForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const routeContentId = (params as any)?.contentId as string | undefined;

  const {
    isEditing,
    formData,
    editorJson,
    editorHtml,
    setEditorState,
    selectedStages,
    toggleStage,
    selectedFormat,
    toggleFormat,
    availableFormats,
    categories,
    catError,
    draftRestored,
    clearDraftAndReset,
    handleFieldChange,
    setActiveTab,
    videoUpload,
    handleVideoFileUpload,
    clearVideoUpload,
    podcastUpload,
    handlePodcastFileUpload,
    clearPodcastUpload,
    documentUpload,
    handleDocumentUpload,
    clearDocumentUpload,
    videoFileInputRef,
    podcastFileInputRef,
    docFileInputRef,
    thumbnailUpload,
    handleThumbnailUpload,
    clearThumbnailUpload,
    thumbnailFileInputRef,
    errors,
    handleSubmit,
    submitting,
    crudLoading,
    crudError,
    showSuccess,
    errorModal,
    setErrorModal,
    handleNavigateBack,
    tabs,
    STAGE_TAGS,
    detectMediaTypeFromUrl,
    getEmbedUrl,
    isEmbeddableUrl,
    isDirectVideoUrl,
    isDev,
    logSaveFlow,
    handleSlugChange,
    regenerateSlug,
    setTags,
    setSelectedCategories,
    setToolkitToc,
    setToolkitRequirements,
    setToolkitHighlights,
    setToolkitAttachments,
    setToolkitAuthors,
    setToolkitChangelog,
    lastSavedContentId,
  } = useMediaContentFormController({ routeContentId, location, navigate });

  const isSaving = crudLoading || submitting;
  const isToolkit = formData.activeTab === 'Toolkit';
  const selectedCategories = formData.categories && formData.categories.length
    ? formData.categories
    : formData.category
      ? [formData.category]
      : [];
  const formTags = formData.tags || [];

  const renderTypeSpecificSection = () => {
    if (['Article', 'News'].includes(formData.activeTab)) {
      return (
        <ArticleEditorSection
          editorJson={editorJson}
          editorHtml={editorHtml}
          onChange={(json, html) => {
            setEditorState(json, html);
          }}
          errors={errors}
        />
      );
    }

    if (formData.activeTab === 'Guide') {
      return (
        <GuideFieldsSection
          formData={formData}
          errors={errors}
          onChange={handleFieldChange}
          editorJson={editorJson}
          editorHtml={editorHtml}
          onEditorChange={(json, html) => {
            setEditorState(json, html);
          }}
          uploadState={documentUpload}
          onUpload={handleDocumentUpload}
          onRemove={clearDocumentUpload}
          fileInputRef={docFileInputRef}
        />
      );
    }

    if (formData.activeTab === 'Video') {
      return (
        <VideoFieldsSection
          formData={formData}
          errors={errors}
          onChange={handleFieldChange}
          uploadState={videoUpload}
          onUpload={handleVideoFileUpload}
          onRemove={clearVideoUpload}
          fileInputRef={videoFileInputRef}
          getEmbedUrl={getEmbedUrl}
          isEmbeddableUrl={isEmbeddableUrl}
          isDirectVideoUrl={isDirectVideoUrl}
        />
      );
    }

    if (formData.activeTab === 'Podcast') {
      return (
        <PodcastFieldsSection
          formData={formData}
          errors={errors}
          onChange={handleFieldChange}
          uploadState={podcastUpload}
          onUpload={handlePodcastFileUpload}
          onRemove={clearPodcastUpload}
          fileInputRef={podcastFileInputRef}
          detectMediaTypeFromUrl={detectMediaTypeFromUrl}
          getEmbedUrl={getEmbedUrl}
          isEmbeddableUrl={isEmbeddableUrl}
          isDirectVideoUrl={isDirectVideoUrl}
        />
      );
    }

    if (formData.activeTab === 'Toolkit') {
      return (
        <ToolkitFieldsSection
          formData={formData}
          errors={errors}
          editorJson={editorJson}
          editorHtml={editorHtml}
          onEditorChange={(json, html) => {
            setEditorState(json, html);
          }}
          onChange={handleFieldChange}
          documentUpload={documentUpload}
          onDocumentUpload={handleDocumentUpload}
          onDocumentRemove={clearDocumentUpload}
          docFileInputRef={docFileInputRef}
          setToolkitToc={setToolkitToc}
          setToolkitRequirements={setToolkitRequirements}
          setToolkitHighlights={setToolkitHighlights}
          setToolkitAttachments={setToolkitAttachments}
          setToolkitAuthors={setToolkitAuthors}
          setToolkitChangelog={setToolkitChangelog}
        />
      );
    }

    return (
      <DocumentFieldsSection
        formData={formData}
        errors={errors}
        onChange={handleFieldChange}
        uploadState={documentUpload}
        onUpload={handleDocumentUpload}
        onRemove={clearDocumentUpload}
        fileInputRef={docFileInputRef}
        title={formData.activeTab === 'Report' ? 'Report' : 'Toolkit'}
      />
    );
  };

  // After success animation completes, navigate back and notify list to show a toast
  const handleSuccessAndNavigate = () => {
    // Log navigation completion for the save flow with minimal context
    logSaveFlow('NAVIGATE_BACK', {
      contentId: routeContentId,
      environment: import.meta.env.MODE,
      userId: (window as any).__USER_ID__ || 'unknown',
      tenantId: (window as any).__TENANT_ID__ || 'unknown',
    });

    try {
      const message = isEditing ? 'Content updated successfully!' : 'Content created successfully!';
      sessionStorage.setItem('content-save-success', JSON.stringify({ message, type: 'success' }));
    } catch (e) {
      // ignore
    }
    handleNavigateBack();
  };

  // Unicode-safe base64 encoding helper
  // btoa() only supports Latin1, so we need to convert UTF-8 to bytes first
  const base64Encode = (str: string): string => {
    try {
      // Modern approach: use TextEncoder for UTF-8 encoding
      const utf8Bytes = new TextEncoder().encode(str);
      let binary = '';
      utf8Bytes.forEach(byte => {
        binary += String.fromCharCode(byte);
      });
      return btoa(binary);
    } catch (e) {
      // Fallback: use encodeURIComponent + unescape (works in all browsers)
      return btoa(unescape(encodeURIComponent(str)));
    }
  };

  // Use controller-provided submit handler which manages submitting state
  // and saves/updates content. This prevents local state mismatches
  // (e.g. calling `setSubmitting` which is not exposed here).



  return (
    <>
      {showSuccess && (
        <SuccessAnimation
          message={isEditing ? 'Content updated successfully!' : 'Content created successfully!'}
          onComplete={handleSuccessAndNavigate}
        />
      )}

      <ErrorModal
        show={errorModal.show}
        message={errorModal.message}
        error={errorModal.error}
        onClose={() => setErrorModal({ show: false, message: '' })}
        isDev={isDev}
      />

      <BreadcrumbHeader
        onNavigateBack={() => navigate('/content-management')}
        isEditing={isEditing}
      />

      <div className="bg-[#f8fafc] py-10 px-4 sm:px-8 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <nav className="flex mb-4 text-xs font-bold tracking-widest text-blue-600 uppercase" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2">
                  <li><span className="opacity-50">Content Console</span></li>
                  <li><span className="mx-2 opacity-30">/</span></li>
                  <li className="text-blue-700">Editor</li>
                </ol>
              </nav>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                {isEditing ? 'Refine Content' : 'Compose New'}
              </h1>
              <p className="mt-2 text-slate-500 font-medium">Craft and publish across the DigitalQatalyst ecosystem</p>
            </div>

            <div className="flex items-center gap-3">
              {crudError && (
                <div className="px-4 py-2 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                  <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                  <p className="text-xs font-bold text-red-600 truncate max-w-[200px]">{crudError.message}</p>
                </div>
              )}
              {!isEditing && draftRestored && (
                <div className="flex items-center gap-2 p-1 bg-amber-50 border border-amber-100 rounded-xl shadow-sm animate-in zoom-in-95">
                  <span className="pl-3 py-1 text-xs font-bold text-amber-700">Draft Restored</span>
                  <button
                    type="button"
                    onClick={clearDraftAndReset}
                    className="p-1 px-3 bg-white text-amber-800 text-xs font-bold border border-amber-200 rounded-lg hover:bg-amber-100 transition-all active:scale-95"
                  >
                    Discard
                  </button>
                </div>
              )}
            </div>
          </div>

          {!isEditing && (
            <TypeTabs
              tabs={tabs}
              activeTab={formData.activeTab}
              onTabSelect={setActiveTab}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <BasicInformationSection
              formData={formData}
              errors={errors}
              onChange={handleFieldChange}
              onSlugChange={handleSlugChange}
              onSlugRegenerate={regenerateSlug}
            />

            <AuthorDetailsSection
              formData={formData}
              errors={errors}
              onChange={handleFieldChange}
            />

            <ThumbnailClassificationSection
              formData={formData}
              errors={errors}
              categories={categories}
              catError={catError}
              selectedBusinessStages={selectedStages}
              onBusinessStageToggle={toggleStage}
              selectedFormat={selectedFormat}
              onFormatSelect={toggleFormat}
              availableFormats={availableFormats}
              stageTags={STAGE_TAGS}
              onFieldChange={handleFieldChange}
              isEditing={isEditing}
              isToolkit={isToolkit}
              selectedCategories={selectedCategories}
              onCategoriesChange={setSelectedCategories}
              tags={formTags}
              onTagsChange={setTags}
              thumbnailUpload={thumbnailUpload}
              onThumbnailUpload={handleThumbnailUpload}
              onThumbnailRemove={clearThumbnailUpload}
              thumbnailFileInputRef={thumbnailFileInputRef}
            />

            <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] overflow-hidden border border-slate-100/80 transition-all hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)]">
              <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
                      {tabIcons[formData.activeTab]}
                    </div>
                    {typeLabelMap[formData.activeTab]} Content
                  </h2>
                  <p className="mt-1 text-sm text-slate-400 font-medium ml-12">Configure type-specific parameters</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-300 uppercase">
                  <span>Step 04</span>
                  <div className="h-1 w-8 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-blue-500"></div>
                  </div>
                </div>
              </div>
              <div className="p-8 space-y-8 bg-white/50 backdrop-blur-sm">{renderTypeSpecificSection()}</div>
            </div>

            <FormActions
              isSaving={isSaving}
              isEditing={isEditing}
              onCancel={handleNavigateBack}
              onSubmitButtonClick={() => {
                console.log('Update button clicked!', {
                  crudLoading,
                  submitting,
                  routeContentId,
                  formData: { title: formData.title, authorName: formData.authorName },
                });
              }}
            />
          </form>
        </div>
      </div>
    </>
  );
};

export default MediaContentForm;

