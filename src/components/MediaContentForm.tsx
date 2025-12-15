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
    if (['Article', 'News', 'Guide'].includes(formData.activeTab)) {
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

  const handleCancel = () => {
    navigate('/content-management');
  };

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

      <div className="bg-gray-50 py-6 px-4 sm:px-6 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Content' : 'Create New Content'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">Publish new content</p>
            {crudError && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{crudError.message}</p>
              </div>
            )}
            {!isEditing && draftRestored && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-center justify-between gap-3">
                <p className="text-sm text-amber-800">Draft restored. You can continue where you left off.</p>
                <button
                  type="button"
                  onClick={clearDraftAndReset}
                  className="text-sm text-amber-900 px-2 py-1 border border-amber-300 rounded hover:bg-amber-100"
                >
                  Discard draft
                </button>
              </div>
            )}
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

            <AuthorDetailsSection
              formData={formData}
              errors={errors}
              onChange={handleFieldChange}
            />

            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  {tabIcons[formData.activeTab]} {typeLabelMap[formData.activeTab]}
                </h2>
                {/* <p className="mt-1 text-sm text-gray-500">
                  Fields mirror the parent UI. Only supported columns are persisted.
                </p> */}
              </div>
              <div className="p-6 space-y-6">{renderTypeSpecificSection()}</div>
            </div>

            <FormActions
              isSaving={isSaving}
              isEditing={isEditing}
              onCancel={handleCancel}
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

