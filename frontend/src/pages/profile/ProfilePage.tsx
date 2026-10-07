import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import StarRating from '../../components/StarRating';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile-me'],
    queryFn: () => api.get('/users/me').then((r) => r.data),
  });

  const { data: ratingsData } = useQuery({
    queryKey: ['my-ratings'],
    queryFn: () => api.get(`/ratings/user/${user?.id}`).then((r) => r.data),
    enabled: !!user?.id,
  });

  if (isLoading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  const p = profile ?? user;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="card text-center">
        <div className="w-20 h-20 rounded-full bg-uol-100 flex items-center justify-center text-uol-700 text-3xl font-bold mx-auto mb-3">
          {p?.profile_photo ? (
            <img src={p.profile_photo} alt="avatar" className="w-full h-full rounded-full object-cover" />
          ) : p?.full_name?.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-xl font-bold text-gray-900">{p?.full_name}</h1>
        <p className="text-gray-500 text-sm">{p?.email}</p>
        <p className="text-gray-500 text-sm">📞 {p?.phone}</p>

        <div className="flex justify-center mt-3">
          <StarRating rating={p?.average_rating ?? null} />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {p?.total_ratings ?? 0} ratings · {p?.completed_rides ?? 0} rides completed
        </p>

        <Link to="/profile/edit" className="btn-primary inline-block mt-4">Edit Profile</Link>
      </div>

      {ratingsData?.ratings?.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Reviews</h2>
          <div className="space-y-3">
            {ratingsData.ratings.slice(0, 5).map((r: any, i: number) => (
              <div key={i} className="border-b border-gray-100 pb-3 last:border-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{r.rater_name}</span>
                  <div className="flex">
                    {[1,2,3,4,5].map((s) => (
                      <span key={s} className={`text-sm ${s <= r.score ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                    ))}
                  </div>
                </div>
                {r.comment && <p className="text-sm text-gray-500 mt-1">"{r.comment}"</p>}
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(r.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
