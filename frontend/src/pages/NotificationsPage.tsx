import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const notifMessages: Record<string, (p: any) => string> = {
  booking_confirmed: (p) => `A passenger booked a seat on your ride`,
  ride_cancelled: (p) => `A ride you booked has been cancelled by the driver`,
  booking_cancelled: (p) => `A passenger cancelled their booking on your ride`,
  rate_prompt: (p) => `Your ride is complete — please rate your driver`,
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then((r) => r.data),
  });

  const markAllMutation = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markOneMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  if (isLoading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  const notifications = data?.notifications ?? [];
  const unread = data?.unread_count ?? 0;

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        {unread > 0 && (
          <button onClick={() => markAllMutation.mutate()} className="btn-secondary text-sm py-1.5 px-3">
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-3">🔔</div>
          <p className="text-gray-500">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n: any) => {
            const msgFn = notifMessages[n.type];
            const message = msgFn ? msgFn(n.payload) : n.type.replace(/_/g, ' ');
            const rideId = n.payload?.ride_id;

            return (
              <div key={n.id}
                className={`card py-4 flex items-start gap-3 cursor-pointer hover:shadow-md transition-shadow
                  ${!n.is_read ? 'border-l-4 border-uol-600' : ''}`}
                onClick={() => { if (!n.is_read) markOneMutation.mutate(n.id); }}
              >
                <span className="text-xl mt-0.5">
                  {n.type === 'booking_confirmed' ? '🎫' :
                   n.type === 'ride_cancelled' ? '❌' :
                   n.type === 'booking_cancelled' ? '↩️' : '⭐'}
                </span>
                <div className="flex-1">
                  <p className={`text-sm ${!n.is_read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                    {message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.created_at).toLocaleDateString('en-PK', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                  {rideId && (
                    <Link to={`/rides/${rideId}`} onClick={(e) => e.stopPropagation()}
                      className="text-xs text-uol-700 hover:underline mt-1 inline-block">
                      View ride →
                    </Link>
                  )}
                </div>
                {!n.is_read && (
                  <span className="w-2 h-2 rounded-full bg-uol-600 mt-2 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
