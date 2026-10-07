import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

import Layout from './components/Layout';
import RegisterPage from './pages/auth/RegisterPage';
import LoginPage from './pages/auth/LoginPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import DashboardPage from './pages/DashboardPage';
import PostRidePage from './pages/rides/PostRidePage';
import SearchRidesPage from './pages/rides/SearchRidesPage';
import RideDetailPage from './pages/rides/RideDetailPage';
import MyRidesPage from './pages/rides/MyRidesPage';
import MyBookingsPage from './pages/bookings/MyBookingsPage';
import ProfilePage from './pages/profile/ProfilePage';
import EditProfilePage from './pages/profile/EditProfilePage';
import PublicProfilePage from './pages/profile/PublicProfilePage';
import NotificationsPage from './pages/NotificationsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/rides/post" element={<PostRidePage />} />
          <Route path="/rides/search" element={<SearchRidesPage />} />
          <Route path="/rides/:id" element={<RideDetailPage />} />
          <Route path="/my-rides" element={<MyRidesPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />
          <Route path="/profile/:id" element={<PublicProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
