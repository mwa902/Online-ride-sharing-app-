import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import RideCard from '../components/RideCard';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: myRidesData } = useQuery({
    queryKey: ['my-rides-dash'],
    queryFn: () => api.get('/rides/mine').then((r) => r.data),
  });

  const { data: myBookingsData } = useQuery({
    queryKey: ['my-bookings-dash'],
    queryFn: () => api.get('/bookings/mine').then((r) => r.data),
  });

  const activeRide = myRidesData?.rides?.find((r: any) => r.status === 'active');
  const upcomingBooking = myBookingsData?.bookings?.find(
    (b: any) => b.status === 'confirmed' && b.ride_status === 'active'
  );

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl bg-hero-gradient p-8 md:p-10 text-white shadow-xl">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 right-16 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />

        <div className="relative">
          <p className="text-blue-200 text-sm font-medium mb-1">{greeting()},</p>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            {user?.full_name?.split(' ')[0]} 👋
          </h1>
          <p className="text-blue-100 text-sm mb-8 max-w-md">
            Ready to share a ride to UOL today? Find a seat or offer yours — every ride helps the community.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link to="/rides/search"
              className="flex items-center gap-2 bg-white text-blue-800 font-bold px-5 py-3 rounded-xl hover:bg-blue-50 transition-all shadow-lg shadow-black/10 hover:shadow-xl active:scale-95">
              🔍 Find a Ride
            </Link>
            <Link to="/rides/post"
              className="flex items-center gap-2 bg-blue-500/30 hover:bg-blue-500/50 text-white font-bold px-5 py-3 rounded-xl border border-white/20 transition-all active:scale-95">
              🚗 Offer a Ride
            </Link>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: '⭐', label: 'Your Rating', value: user?.average_rating ? `${user.average_rating}/5` : '—', color: 'from-amber-400 to-orange-500', bg: 'bg-amber-50' },
          { icon: '🚗', label: 'Rides Given',  value: user?.completed_rides ?? 0, color: 'from-blue-500 to-blue-700', bg: 'bg-blue-50' },
          { icon: '🎫', label: 'Total Ratings', value: user?.total_ratings ?? 0, color: 'from-purple-500 to-purple-700', bg: 'bg-purple-50' },
          { icon: '📱', label: 'Phone',         value: user?.phone ?? '—', color: 'from-emerald-400 to-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat) => (
          <div key={stat.label} className="card">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-xl mb-3 shadow-sm`}>
              {stat.icon}
            </div>
            <p className="text-xl font-bold text-slate-900">{String(stat.value)}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Active ride / upcoming booking */}
      {(activeRide || upcomingBooking) && (
        <div className="grid md:grid-cols-2 gap-4">
          {activeRide && (
            <div>
              <h2 className="text-base font-bold text-slate-700 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center text-sm">🟢</span>
                Your Active Ride
              </h2>
              <RideCard ride={activeRide} showDriver={false} />
            </div>
          )}
          {upcomingBooking && (
            <div>
              <h2 className="text-base font-bold text-slate-700 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center text-sm">🎫</span>
                Upcoming Booking
              </h2>
              <div className="card border-l-4 border-blue-500">
                <p className="font-semibold text-slate-900">
                  {upcomingBooking.origin_area} → {upcomingBooking.destination}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {new Date(upcomingBooking.departure_time).toLocaleString('en-PK', {
                    weekday: 'short', day: 'numeric', month: 'short',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
                <p className="text-sm text-slate-500 mt-1">Driver: {upcomingBooking.driver_name}</p>
                <Link to={`/rides/${upcomingBooking.ride_id}`}
                  className="text-blue-600 text-sm font-semibold hover:underline mt-2 inline-block">
                  View details →
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick action grid */}
      <div>
        <h2 className="text-base font-bold text-slate-700 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { to: '/rides/search',  icon: '🔍', label: 'Find Ride',     color: 'from-blue-500 to-blue-600' },
            { to: '/rides/post',    icon: '🚗', label: 'Post Ride',     color: 'from-emerald-500 to-emerald-600' },
            { to: '/my-rides',      icon: '🗺️', label: 'My Rides',      color: 'from-indigo-500 to-indigo-600' },
            { to: '/my-bookings',   icon: '🎫', label: 'Bookings',      color: 'from-purple-500 to-purple-600' },
            { to: '/profile',       icon: '👤', label: 'Profile',       color: 'from-amber-500 to-amber-600' },
            { to: '/notifications', icon: '🔔', label: 'Notifications', color: 'from-rose-500 to-rose-600' },
          ].map((link) => (
            <Link key={link.to} to={link.to}
              className="card-hover flex flex-col items-center justify-center py-5 gap-3 text-center">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${link.color} flex items-center justify-center text-2xl shadow-md`}>
                {link.icon}
              </div>
              <span className="text-xs font-semibold text-slate-600">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Popular routes */}
      <div className="card">
        <h2 className="text-base font-bold text-slate-700 mb-4">🔥 Popular Routes</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { from: 'Johar Town', to: 'UOL Main Campus' },
            { from: 'Gulberg',    to: 'UOL Main Campus' },
            { from: 'DHA Phase 5', to: 'UOL Main Campus' },
            { from: 'Bahria Town', to: 'UOL Main Campus' },
          ].map((r) => (
            <Link key={r.from}
              to={`/rides/search?origin_area=${encodeURIComponent(r.from)}&destination=${encodeURIComponent(r.to)}&date=${new Date().toISOString().split('T')[0]}`}
              className="flex flex-col gap-1 p-3 bg-slate-50 hover:bg-blue-50 rounded-xl border border-transparent hover:border-blue-200 transition-all text-sm">
              <span className="font-semibold text-slate-800 truncate">{r.from}</span>
              <span className="text-blue-500 text-xs">→ {r.to}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
