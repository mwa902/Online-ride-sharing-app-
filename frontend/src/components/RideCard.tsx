import { Link } from 'react-router-dom';
import StarRating from './StarRating';

interface Ride {
  id: string;
  origin_area: string;
  destination: string;
  departure_time: string;
  available_seats: number;
  total_seats: number;
  cost_per_seat: number;
  status: string;
  driver_name?: string;
  driver_photo?: string;
  driver_rating?: number | null;
  confirmed_bookings?: number;
}

interface Props {
  ride: Ride;
  showDriver?: boolean;
  actions?: React.ReactNode;
}

const statusStyles: Record<string, string> = {
  active:    'badge-green',
  cancelled: 'badge-red',
  completed: 'badge-purple',
};

export default function RideCard({ ride, showDriver = true, actions }: Props) {
  const dt = new Date(ride.departure_time);
  const dateStr = dt.toLocaleDateString('en-PK', { weekday: 'short', day: 'numeric', month: 'short' });
  const timeStr = dt.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
  const isFullyBooked = ride.available_seats === 0;

  return (
    <div className="card-hover group relative overflow-hidden">
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 w-full h-1 rounded-t-2xl
        ${ride.status === 'active' ? 'bg-gradient-to-r from-blue-500 to-emerald-500' :
          ride.status === 'completed' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
          'bg-slate-200'}`} />

      <div className="pt-2">
        {/* Route */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex flex-col items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-600 ring-2 ring-blue-100" />
              <div className="w-0.5 h-6 bg-gradient-to-b from-blue-300 to-emerald-300" />
              <div className="w-3 h-3 rounded-full bg-emerald-600 ring-2 ring-emerald-100" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 truncate">{ride.origin_area}</p>
              <p className="font-semibold text-slate-900 truncate">{ride.destination}</p>
            </div>
          </div>
          <span className={statusStyles[ride.status] ?? 'badge-gray'}>
            {ride.status}
          </span>
        </div>

        {/* Time & seats */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg px-3 py-1.5 text-sm text-slate-600">
            <span>📅</span>
            <span className="font-medium">{dateStr}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg px-3 py-1.5 text-sm text-slate-600">
            <span>🕐</span>
            <span className="font-medium">{timeStr}</span>
          </div>
          <div className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium
            ${isFullyBooked ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
            <span>🪑</span>
            <span>{isFullyBooked ? 'Full' : `${ride.available_seats} seats`}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-50 rounded-lg px-3 py-1.5 text-sm text-amber-700 font-medium">
            <span>💵</span>
            <span>Rs. {Number(ride.cost_per_seat).toLocaleString()}</span>
          </div>
        </div>

        {/* Driver */}
        {showDriver && ride.driver_name && (
          <div className="flex items-center gap-2.5 mb-4 p-3 bg-slate-50 rounded-xl">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
              {ride.driver_photo
                ? <img src={ride.driver_photo} alt="" className="w-full h-full rounded-xl object-cover" />
                : ride.driver_name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{ride.driver_name}</p>
              <StarRating rating={ride.driver_rating ?? null} size="sm" />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <Link to={`/rides/${ride.id}`}
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 group-hover:gap-2 transition-all">
            View details <span>→</span>
          </Link>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
