import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import RideCard from '../../components/RideCard';

export default function MyRidesPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['my-rides'],
    queryFn: () => api.get('/rides/mine').then((r) => r.data),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/rides/${id}/cancel`),
    onSuccess: () => { toast.success('Ride cancelled'); queryClient.invalidateQueries({ queryKey: ['my-rides'] }); },
    onError: (err: any) => toast.error(err.response?.data?.error ?? 'Failed'),
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/rides/${id}/complete`),
    onSuccess: () => { toast.success('Ride marked as completed'); queryClient.invalidateQueries({ queryKey: ['my-rides'] }); },
    onError: (err: any) => toast.error(err.response?.data?.error ?? 'Failed'),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      Loading...
    </div>
  );

  const rides = data?.rides ?? [];
  const active    = rides.filter((r: any) => r.status === 'active');
  const past      = rides.filter((r: any) => r.status !== 'active');

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Posted Rides</h1>
          <p className="text-slate-500 text-sm mt-1">{rides.length} total rides</p>
        </div>
        <Link to="/rides/post" className="btn-primary">+ Post New Ride</Link>
      </div>

      {rides.length === 0 ? (
        <div className="card text-center py-20">
          <div className="text-6xl mb-4">🚗</div>
          <h3 className="font-semibold text-slate-700 mb-2">No rides posted yet</h3>
          <p className="text-slate-400 text-sm mb-6">Offer your first ride and help fellow students</p>
          <Link to="/rides/post" className="btn-primary inline-flex">Post Your First Ride</Link>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Active Rides
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {active.map((ride: any) => (
                  <RideCard key={ride.id} ride={ride} showDriver={false}
                    actions={
                      <div className="flex gap-2">
                        {ride.confirmed_bookings > 0 && (
                          <span className="badge badge-blue">{ride.confirmed_bookings} booked</span>
                        )}
                        <button onClick={() => completeMutation.mutate(ride.id)}
                          disabled={completeMutation.isPending}
                          className="btn-success text-xs py-1.5 px-3 rounded-lg">
                          ✅ Complete
                        </button>
                        <button onClick={() => { if (confirm('Cancel this ride and notify passengers?')) cancelMutation.mutate(ride.id); }}
                          disabled={cancelMutation.isPending}
                          className="btn-danger text-xs py-1.5 px-3 rounded-lg">
                          ❌ Cancel
                        </button>
                      </div>
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" /> Past Rides
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {past.map((ride: any) => (
                  <RideCard key={ride.id} ride={ride} showDriver={false} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
