import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then((r) => r.data),
    refetchInterval: 30000,
  });

  const logoutMutation = useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSettled: () => { logout(); queryClient.clear(); navigate('/login'); },
  });

  const unread = notifData?.unread_count ?? 0;

  const navLinks = [
    { to: '/dashboard',    label: 'Home',      icon: '🏠' },
    { to: '/rides/search', label: 'Find Ride',  icon: '🔍' },
    { to: '/rides/post',   label: 'Offer Ride', icon: '🚗' },
    { to: '/my-rides',     label: 'My Rides',   icon: '🗺️' },
    { to: '/my-bookings',  label: 'Bookings',   icon: '🎫' },
  ];

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150
     ${isActive
       ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
       : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`;

  const initials = user?.full_name
    ?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() ?? '?';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <NavLink to="/dashboard" className="flex items-center gap-2.5 font-extrabold text-blue-800 text-lg">
              <span className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white text-sm">🚗</span>
              <span className="hidden sm:block">UOL Ride Share</span>
            </NavLink>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((l) => (
                <NavLink key={l.to} to={l.to} className={navClass}>
                  <span>{l.icon}</span>
                  <span>{l.label}</span>
                </NavLink>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <NavLink to="/notifications"
                className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-600 transition-colors">
                <span className="text-lg">🔔</span>
                {unread > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </NavLink>

              {/* Profile */}
              <NavLink to="/profile"
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-blue-200">
                  {user?.profile_photo
                    ? <img src={user.profile_photo} alt="" className="w-full h-full rounded-xl object-cover" />
                    : initials}
                </div>
                <span className="hidden md:block text-sm font-semibold text-slate-700">
                  {user?.full_name?.split(' ')[0]}
                </span>
              </NavLink>

              {/* Logout */}
              <button onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="hidden sm:flex btn-secondary text-sm py-2 px-3 rounded-xl">
                Logout
              </button>

              {/* Mobile hamburger */}
              <button onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-600">
                {mobileOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
            {navLinks.map((l) => (
              <NavLink key={l.to} to={l.to} onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                   ${isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                <span>{l.icon}</span><span>{l.label}</span>
              </NavLink>
            ))}
            <button onClick={() => logoutMutation.mutate()}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all">
              🚪 Logout
            </button>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 page-enter">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-16 py-6 text-center text-sm text-slate-400">
        🚗 UOL Ride Share · University of Lahore · Students only
      </footer>
    </div>
  );
}
