import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/index';
import ServiceManagementRoute from './pages/service-management';
import ContentManagementRoute from './pages/content-management';
import CourseManagementRoute from './pages/course-management';
import LearningPathFormRoute from './pages/learning-path-form';
import CourseFormRoute from './pages/course-form';
import ModuleFormRoute from './pages/module-form';
import LessonFormRoute from './pages/lesson-form';
import QuizFormRoute from './pages/quiz-form';
import BusinessDirectoryRoute from './pages/business-directory';
import ZonesClustersRoute from './pages/zones-clusters';
import GrowthAreasRoute from './pages/growth-areas';
import ServiceFormRoute from './pages/service-form';
import BusinessFormRoute from './pages/business-form';
import GrowthAreaFormRoute from './pages/growth-area-form';
import ZoneFormRoute from './pages/zone-form';
import ContentFormRoute from './pages/content-form';
import TaxonomyManagerRoute from './pages/taxonomy-manager';
import TaxonomyCollectionFormRoute from './pages/taxonomy-collection-form';
import TaxonomyFacetFormRoute from './pages/taxonomy-facet-form';
import TaxonomyTagFormRoute from './pages/taxonomy-tag-form';
import LoginPage from './pages/login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ContentSegmentGate } from './components/ContentSegmentGate';
import { AppLayout } from './components/AppLayout';
import EJPTransactionDashboard from './modules/ejp-transaction-dashboard';
export function AppRouter() {
  return <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes - Require Authentication */}
      <Route path="/" element={
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>
      } />

      <Route path="/service-management" element={
        <ProtectedRoute requiredRoles={['admin', 'approver', 'editor']}>
          <ServiceManagementRoute />
        </ProtectedRoute>
      } />

      <Route path="/content-management" element={
        <ProtectedRoute requiredRoles={['admin', 'approver', 'editor', 'viewer']}>
          <ContentManagementRoute />
        </ProtectedRoute>
      } />

      <Route path="/course-management" element={
        <ProtectedRoute requiredRoles={['admin', 'approver', 'editor', 'viewer']}>
          <ContentSegmentGate>
            <CourseManagementRoute />
          </ContentSegmentGate>
        </ProtectedRoute>
      } />

      <Route path="/course-management/learning-path/:id" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <ContentSegmentGate>
            <LearningPathFormRoute />
          </ContentSegmentGate>
        </ProtectedRoute>
      } />

      <Route path="/course-management/course/:id" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <ContentSegmentGate>
            <CourseFormRoute />
          </ContentSegmentGate>
        </ProtectedRoute>
      } />

      <Route path="/course-management/module/:id" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <ContentSegmentGate>
            <ModuleFormRoute />
          </ContentSegmentGate>
        </ProtectedRoute>
      } />

      <Route path="/course-management/lesson/:id" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <ContentSegmentGate>
            <LessonFormRoute />
          </ContentSegmentGate>
        </ProtectedRoute>
      } />

      <Route path="/course-management/quiz/:id" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <ContentSegmentGate>
            <QuizFormRoute />
          </ContentSegmentGate>
        </ProtectedRoute>
      } />

      <Route path="/business-directory" element={
        <ProtectedRoute requiredRoles={['admin', 'approver', 'editor', 'viewer']}>
          <BusinessDirectoryRoute />
        </ProtectedRoute>
      } />

      <Route path="/zones-clusters" element={
        <ProtectedRoute requiredRoles={['admin', 'approver', 'editor', 'viewer']}>
          <ZonesClustersRoute />
        </ProtectedRoute>
      } />

      <Route path="/growth-areas" element={
        <ProtectedRoute requiredRoles={['admin', 'approver', 'editor', 'viewer']}>
          <GrowthAreasRoute />
        </ProtectedRoute>
      } />

      {/* Form Routes - Require Write Permissions */}
      <Route path="/service-form" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <ServiceFormRoute />
        </ProtectedRoute>
      } />

      <Route path="/service-form/:id" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <ServiceFormRoute />
        </ProtectedRoute>
      } />

      <Route path="/business-form" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <BusinessFormRoute />
        </ProtectedRoute>
      } />

      <Route path="/business-form/:businessId" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <BusinessFormRoute />
        </ProtectedRoute>
      } />

      <Route path="/growth-area-form" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <GrowthAreaFormRoute />
        </ProtectedRoute>
      } />

      <Route path="/taxonomy-manager" element={
        <ProtectedRoute requiredRoles={['admin', 'approver', 'editor', 'viewer']}>
          <TaxonomyManagerRoute />
        </ProtectedRoute>
      } />

      {/* Taxonomy Form Routes */}
      <Route path="/taxonomy-manager/collection/new" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <TaxonomyCollectionFormRoute />
        </ProtectedRoute>
      } />

      <Route path="/taxonomy-manager/collection/:collectionId" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <TaxonomyCollectionFormRoute />
        </ProtectedRoute>
      } />

      <Route path="/taxonomy-manager/facet/new" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <TaxonomyFacetFormRoute />
        </ProtectedRoute>
      } />

      <Route path="/taxonomy-manager/facet/:facetId" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <TaxonomyFacetFormRoute />
        </ProtectedRoute>
      } />

      <Route path="/taxonomy-manager/tag/new" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <TaxonomyTagFormRoute />
        </ProtectedRoute>
      } />

      <Route path="/taxonomy-manager/tag/:tagId" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <TaxonomyTagFormRoute />
        </ProtectedRoute>
      } />

      <Route path="/growth-area-form/:areaId" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <GrowthAreaFormRoute />
        </ProtectedRoute>
      } />

      <Route path="/zone-form" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <ZoneFormRoute />
        </ProtectedRoute>
      } />

      <Route path="/zone-form/:zoneId" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <ZoneFormRoute />
        </ProtectedRoute>
      } />

      <Route path="/content-form" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <ContentSegmentGate>
            <ContentFormRoute />
          </ContentSegmentGate>
        </ProtectedRoute>
      } />

      <Route path="/content-form/:contentId" element={
        <ProtectedRoute requiredRoles={['admin', 'editor']}>
          <ContentSegmentGate>
            <ContentFormRoute />
          </ContentSegmentGate>
        </ProtectedRoute>
      } />

      <Route path="/ejp-transaction-dashboard" element={
        <ProtectedRoute requiredRoles={['admin', 'approver', 'editor', 'viewer']}>
          <AppLayout activeSection="experience-analytics">
            <EJPTransactionDashboard />
          </AppLayout>
        </ProtectedRoute>
      } />
    </Routes>
  </BrowserRouter>;
}