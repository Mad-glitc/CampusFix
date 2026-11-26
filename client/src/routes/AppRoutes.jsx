import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from './ProtectedRoute';
import { LoadingScreen } from '../components/common/Spinner';
import { useAuthStore } from '../store/authStore';

// Unit V: Lazy loading and route-based code splitting
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const StudentDashboard = lazy(() => import('../pages/student/StudentDashboard'));
const SubmitComplaintPage = lazy(() => import('../pages/student/SubmitComplaintPage'));
const MyComplaintsPage = lazy(() => import('../pages/student/MyComplaintsPage'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminComplaintsPage = lazy(() => import('../pages/admin/AdminComplaintsPage'));
const AnalyticsPage = lazy(() => import('../pages/admin/AnalyticsPage'));
const StaffDirectoryPage = lazy(() => import('../pages/admin/StaffDirectoryPage'));
const CategoryManagementPage = lazy(() => import('../pages/admin/CategoryManagementPage'));
const StaffDashboard = lazy(() => import('../pages/staff/StaffDashboard'));
const StaffQueuePage = lazy(() => import('../pages/staff/StaffQueuePage'));
const TrackComplaintPage = lazy(() => import('../pages/shared/TrackComplaintPage'));
const AnnouncementCenterPage = lazy(() => import('../pages/shared/AnnouncementCenterPage'));
const LostAndFoundPage = lazy(() => import('../pages/shared/LostAndFoundPage'));
const UnauthorizedPage = lazy(() => import('../pages/shared/UnauthorizedPage'));
const NotFoundPage = lazy(() => import('../pages/shared/NotFoundPage'));

/**
 * Root Index Redirector based on user role
 */
const RootRedirect = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'staff') return <Navigate to="/staff/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

export const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingScreen message="Loading CampusFix Portal..." />}>
      <Routes>
        {/* Public Authentication Shell */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Main Authenticated Application Shell */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<RootRedirect />} />

          {/* Student Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/report"
            element={
              <ProtectedRoute allowedRoles={['student', 'staff', 'admin']}>
                <SubmitComplaintPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/complaints"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <MyComplaintsPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/complaints"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminComplaintsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/staff"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <StaffDirectoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/staff-directory"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <StaffDirectoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CategoryManagementPage />
              </ProtectedRoute>
            }
          />

          {/* Staff Routes */}
          <Route
            path="/staff/dashboard"
            element={
              <ProtectedRoute allowedRoles={['staff', 'admin']}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/queue"
            element={
              <ProtectedRoute allowedRoles={['staff', 'admin']}>
                <StaffQueuePage />
              </ProtectedRoute>
            }
          />

          {/* Universal Features */}
          <Route path="/track" element={<TrackComplaintPage />} />
          <Route path="/announcements" element={<AnnouncementCenterPage />} />
          <Route path="/lost-found" element={<LostAndFoundPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
