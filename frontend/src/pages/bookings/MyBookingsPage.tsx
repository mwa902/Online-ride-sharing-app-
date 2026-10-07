import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import StarRating from '../../components/StarRating';
import { useState } from 'react';

export default function MyBookingsPage() {
  const queryClient = useQueryClient();
  const [showRatingFor, setShowRatingFor] = useState<{ rideId: string; rateeId: string; rateeName: string } | null>(null);
  const [ratingForm, setRatingForm] = useState({ score: 5, comment: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => api.get('/bookings/mine').then((r) => r.data),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/bookings/${id}/cancel`),
    onSuccess: () => { toast.success('Booking cancelled'); queryClient.invalidateQueries({ queryKey: ['my-bookings'] }); },
    onError: (err: any) => toast.error(err.response?.data?.error ?? 'Failed'),
  });

  const ratingMutation = useMutation({
    mutationFn: (data: { ride_id: string; ratee_id: string; score: number; comment: string }) =>
      api.post('/ratings', data),
    onSuccess: () => { toast.success('Rating submitted!'); setShowRatingFor(null); },
    onError: (err: any) => toast.error(err.response?.data?.error ?? 'Failed'),
  });

  if (isLoading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  const bookings = data?.bookings ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-3">🎫</div>
          <p className="text-gray-500 mb-4">No bookings yet</p>
          <Link to="/rides/search" className="btn-primary inline-block">Find a Ride</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b: any) => {
            const dt = new Date(b.departure_time);
            const canCancel = b.status === 'confirmed' &&
              new Date(b.departure_time) > new Date(Date.now() + 60 * 60 * 1000);

            return (
              <div key={b.id} className="card">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {b.origin_area} → {b.destination}
                    </p>
                    <p className="text-sm text-gray-500">
                      {dt.toLocaleDateString('en-PK', { weekday: 'short', day: 'numeric', month: 'short' })} at{' '}
                      {dt.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      b.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>{b.status}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      b.ride_status === 'active' ? 'bg-blue-100 text-blue-700' :
                      b.ride_status === 'completed' ? 'bg-purple-100 text-purple-700' : 'bg-red-100 text-red-700'
                    }`}>Ride: {b.ride_status}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                  <span>Driver: {b.driver_name}</span>
                  <StarRating rating={b.driver_rating ?? null} size="sm" />
                  <span>📞 {b.driver_phone}</span>
                </div>

                <div className="text-sm text-gray-500 mb-3">
                  Rs. {Number(b.cost_per_seat).toLocaleString()} / seat (cash)
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Link to={`/rides/${b.ride_id}`} className="btn-secondary text-xs py-1 px-3">View Ride</Link>

                  {canCancel && (
                    <button onClick={() => { if (confirm('Cancel this booking?')) cancelMutation.mutate(b.id); }}
                      className="btn-danger text-xs py-1 px-3">
                      Cancel
                    </button>
                  )}

                  {b.ride_status === 'completed' && b.status === 'confirmed' && (
                    <button onClick={() => setShowRatingFor({ rideId: b.ride_id, rateeId: b.driver_id, rateeName: b.driver_name })}
                      className="btn-secondary text-xs py-1 px-3 border-yellow-300 text-yellow-700 hover:bg-yellow-50">
                      ⭐ Rate Driver
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rating modal */}
      {showRatingFor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="font-semibold text-gray-900 mb-1">Rate {showRatingFor.rateeName}</h3>
            <p className="text-sm text-gray-500 mb-4">How was your experience?</p>
            <div className="space-y-4">
              <div>
                <label className="label">Score</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map((s) => (
                    <button key={s} type="button"
                      onClick={() => setRatingForm((f) => ({ ...f, score: s }))}
                      className={`w-10 h-10 rounded-full text-2xl ${ratingForm.score >= s ? 'text-yellow-400' : 'text-gray-300'}`}>
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Comment (optional)</label>
                <textarea value={ratingForm.comment} maxLength={500}
                  onChange={(e) => setRatingForm((f) => ({ ...f, comment: e.target.value }))}
                  className="input" rows={3} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => ratingMutation.mutate({ ride_id: showRatingFor.rideId, ratee_id: showRatingFor.rateeId, ...ratingForm })}
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
