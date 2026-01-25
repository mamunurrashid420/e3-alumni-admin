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
import { PaymentsListPage } from '@/pages/PaymentsListPage';
import { PaymentDetailPage } from '@/pages/PaymentDetailPage';
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
            <Route path="payments" element={<PaymentsListPage />} />
            <Route path="payments/:id" element={<PaymentDetailPage />} />
          </Route>
          <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
