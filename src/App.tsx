import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ApplicationsListPage } from '@/pages/ApplicationsListPage';
import { ApplicationDetailPage } from '@/pages/ApplicationDetailPage';
import { SelfDeclarationsListPage } from '@/pages/SelfDeclarationsListPage';
import { SelfDeclarationDetailPage } from '@/pages/SelfDeclarationDetailPage';
import { MembersListPage } from '@/pages/MembersListPage';
import { MemberDetailPage } from '@/pages/MemberDetailPage';
import { BloodDonorsListPage } from '@/pages/BloodDonorsListPage';
import { PaymentsListPage } from '@/pages/PaymentsListPage';
import { PaymentDetailPage } from '@/pages/PaymentDetailPage';
import { ConveningCommitteeListPage } from '@/pages/ConveningCommitteeListPage';
import { AdvisoryBodyListPage } from '@/pages/AdvisoryBodyListPage';
import { HonorBoardListPage } from '@/pages/HonorBoardListPage';
import { BatchRepresentativesListPage } from '@/pages/BatchRepresentativesListPage';
import { DownloadsListPage } from '@/pages/DownloadsListPage';
import { GalleryListPage } from '@/pages/GalleryListPage';
import { NoticesListPage } from '@/pages/NoticesListPage';
import { NewsListPage } from '@/pages/NewsListPage';
import { JobsListPage } from '@/pages/JobsListPage';
import { EventsListPage } from '@/pages/EventsListPage';
import { EventDetailPage } from '@/pages/EventDetailPage';
import { CreateEventPage } from '@/pages/CreateEventPage';
import { EditEventPage } from '@/pages/EditEventPage';
import { ScholarshipsListPage } from '@/pages/ScholarshipsListPage';
import { ScholarshipApplicationsListPage } from '@/pages/ScholarshipApplicationsListPage';
import { ScholarshipApplicationDetailPage } from '@/pages/ScholarshipApplicationDetailPage';
import { useAuthStore } from '@/stores/authStore';

function App() {
  const { isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    // Check authentication on app load
    checkAuth();
  }, [checkAuth]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="applications" element={<ApplicationsListPage />} />
            <Route path="applications/:id" element={<ApplicationDetailPage />} />
            <Route path="self-declarations" element={<SelfDeclarationsListPage />} />
            <Route path="self-declarations/:id" element={<SelfDeclarationDetailPage />} />
            <Route path="members" element={<MembersListPage />} />
            <Route path="members/:id" element={<MemberDetailPage />} />
            <Route path="blood-donors" element={<BloodDonorsListPage />} />
            <Route path="payments" element={<PaymentsListPage />} />
            <Route path="payments/:id" element={<PaymentDetailPage />} />
            <Route path="scholarships" element={<ScholarshipsListPage />} />
            <Route path="scholarship-applications" element={<ScholarshipApplicationsListPage />} />
            <Route path="scholarship-applications/:id" element={<ScholarshipApplicationDetailPage />} />
            <Route path="downloads" element={<DownloadsListPage />} />
            <Route path="gallery" element={<GalleryListPage />} />
            <Route path="notices" element={<NoticesListPage />} />
            <Route path="news" element={<NewsListPage />} />
            <Route path="jobs" element={<JobsListPage />} />
            <Route path="events" element={<EventsListPage />} />
            <Route path="events/new" element={<CreateEventPage />} />
            <Route path="events/:id" element={<EventDetailPage />} />
            <Route path="events/:id/edit" element={<EditEventPage />} />
            <Route path="about/convening-committee" element={<ConveningCommitteeListPage />} />
            <Route path="about/advisory-body" element={<AdvisoryBodyListPage />} />
            <Route path="about/honor-board" element={<HonorBoardListPage />} />
            <Route path="about/batch-representatives" element={<BatchRepresentativesListPage />} />
          </Route>
          <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
