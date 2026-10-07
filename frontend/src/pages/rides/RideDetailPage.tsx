import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import StarRating from '../../components/StarRating';
import { useState } from 'react';

export default function RideDetailPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [ratingForm, setRatingForm] = useState({ ratee_id: '', score: 5, comment: '' });
  const [showRatingFor, setShowRatingFor] = useState<string | null>(null);

  const { data: ride, isLoading, error } = useQuery({
    queryKey: ['ride', id],
    queryFn: () => api.get(`/rides/${id}`).then((r) => r.data),
  });

  const bookMutation = useMutation({
    mutationFn: () => api.post('/bookings', { ride_id: id }),
    onSuccess: () => { toast.success('Seat booked!'); queryClient.invalidateQueries({ queryKey: ['ride', id] }); },
    onError: (err: any) => toast.error(err.response?.data?.error ?? 'Booking failed'),
  });

  const cancelRideMutation = useMutation({
    mutationFn: () => api.patch(`/rides/${id}/cancel`),
    onSuccess: () => { toast.success('Ride cancelled'); queryClient.invalidateQueries({ queryKey: ['ride', id] }); },
    onError: (err: any) => toast.error(err.response?.data?.error ?? 'Failed to cancel'),
  });

  const completeRideMutation = useMutation({
    mutationFn: () => api.patch(`/rides/${id}/complete`),
    onSuccess: () => { toast.success('Ride marked as completed!'); queryClient.invalidateQueries({ queryKey: ['ride', id] }); },
    onError: (err: any) => toast.error(err.response?.data?.error ?? 'Failed to complete'),
  });

  const ratingMutation = useMutation({
    mutationFn: (data: typeof ratingForm) => api.post('/ratings', { ...data, ride_id: id }),
    onSuccess: () => { toast.success('Rating submitted!'); setShowRatingFor(null); },
    onError: (err: any) => toast.error(err.response?.data?.error ?? 'Failed to submit rating'),
  });

  if (isLoading) return <div className="text-center py-20 text-gray-400">Loading ride details...</div>;
  if (error || !ride) return <div className="card text-center py-12 text-red-500">Ride not found</div>;

  const isDriver = ride.driver_id === user?.id;
  const dt = new Date(ride.departure_time);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="card">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {ride.origin_area} → {ride.destination}
            </h1>
            <p className="text-gray-500 mt-1">
              {dt.toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long' })} at{' '}
              {dt.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize
            ${ride.status === 'active' ? 'bg-green-100 text-green-700' :
              ride.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
            {ride.status}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center bg-gray-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-uol-700">{ride.available_seats}</div>
            <div className="text-xs text-gray-500">Seats Left</div>
          </div>
          <div className="text-center bg-gray-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-uol-700">Rs. {Number(ride.cost_per_seat).toLocaleString()}</div>
            <div className="text-xs text-gray-500">Per Seat</div>
          </div>
          <div className="text-center bg-gray-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-uol-700">{ride.total_seats}</div>
            <div className="text-xs text-gray-500">Total Seats</div>
          </div>
        </div>

        {/* Driver info */}
        <div className="border-t border-gray-100 pt-4 mb-4">
          <p className="text-sm text-gray-500 mb-2">Driver</p>
          <Link to={`/profile/${ride.driver_id}`} className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 -mx-2">
            <span className="w-10 h-10 rounded-full bg-uol-100 flex items-center justify-center text-uol-700 font-bold">
              {ride.driver_name?.charAt(0)}
            </span>
            <div>
              <p className="font-medium text-gray-900">{ride.driver_name}</p>
              <StarRating rating={ride.driver_rating ?? null} size="sm" />
            </div>
          </Link>
          {isDriver && (
            <p className="text-sm text-gray-500 mt-1">📞 {ride.driver_phone}</p>
          )}
        </div>

        {/* Actions */}
        {ride.status === 'active' && !isDriver && (
          <button onClick={() => bookMutation.mutate()} disabled={bookMutation.isPending || ride.available_seats === 0}
            className="btn-primary w-full">
            {ride.available_seats === 0 ? 'Fully Booked' : bookMutation.isPending ? 'Booking...' : '🎫 Book a Seat'}
          </button>
        )}

        {isDriver && ride.status === 'active' && (
          <div className="flex gap-3">
            <button onClick={() => completeRideMutation.mutate()} disabled={completeRideMutation.isPending}
              className="btn-primary flex-1">
              ✅ Mark Complete
            </button>
            <button onClick={() => { if (confirm('Cancel this ride?')) cancelRideMutation.mutate(); }}
              disabled={cancelRideMutation.isPending} className="btn-danger flex-1">
              ❌ Cancel Ride
            </button>
          </div>
        )}
      </div>

      {/* Bookings (driver view) */}
      {isDriver && ride.bookings?.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Passengers ({ride.bookings.length})</h2>
          <div className="space-y-3">
            {ride.bookings.map((b: any) => (
              <div key={b.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-uol-100 flex items-center justify-center text-uol-700 font-bold text-sm">
                    {b.passenger_name?.charAt(0)}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{b.passenger_name}</p>
                    <p className="text-xs text-gray-500">📞 {b.passenger_phone}</p>
                  </div>
                </div>
                {ride.status === 'completed' && (
                  <button onClick={() => { setShowRatingFor(b.passenger_id); setRatingForm((f) => ({ ...f, ratee_id: b.passenger_id })); }}
                    className="text-xs btn-secondary py-1 px-2">
                    Rate
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rating modal */}
      {showRatingFor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="font-semibold text-gray-900 mb-4">Submit Rating</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Score (1–5)</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map((s) => (
                    <button key={s} type="button"
                      onClick={() => setRatingForm((f) => ({ ...f, score: s }))}
                      className={`w-10 h-10 rounded-full text-lg ${ratingForm.score >= s ? 'text-yellow-400' : 'text-gray-300'}`}>
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Comment (optional)</label>
                <textarea value={ratingForm.comment} maxLength={500}
                  onChange={(e) => setRatingForm((f) => ({ ...f, comment: e.target.value }))}
                  className="input" rows={3} placeholder="Leave a comment..." />
              </div>
              <div className="flex gap-3">
                <button onClick={() => ratingMutation.mutate(ratingForm)}
                  disabled={ratingMutation.isPending} className="btn-primary flex-1">
                  {ratingMutation.isPending ? 'Submitting...' : 'Submit'}
                </button>
                <button onClick={() => setShowRatingFor(null)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
