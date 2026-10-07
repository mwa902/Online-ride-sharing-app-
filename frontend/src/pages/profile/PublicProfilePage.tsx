import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import StarRating from '../../components/StarRating';

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['public-profile', id],
    queryFn: () => api.get(`/users/${id}`).then((r) => r.data),
  });

  const { data: ratingsData } = useQuery({
    queryKey: ['ratings', id],
    queryFn: () => api.get(`/ratings/user/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  if (isLoading) return <div className="text-center py-20 text-gray-400">Loading...</div>;
  if (!profile) return <div className="card text-center py-12">User not found</div>;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="card text-center">
        <div className="w-20 h-20 rounded-full bg-uol-100 flex items-center justify-center text-uol-700 text-3xl font-bold mx-auto mb-3">
          {profile.profile_photo ? (
            <img src={profile.profile_photo} alt="avatar" className="w-full h-full rounded-full object-cover" />
          ) : profile.full_name?.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-xl font-bold text-gray-900">{profile.full_name}</h1>
        <div className="flex justify-center mt-2">
          <StarRating rating={profile.average_rating ?? null} />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {profile.total_ratings ?? 0} ratings · {profile.completed_rides ?? 0} rides completed
        </p>
      </div>

      {ratingsData?.ratings?.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Reviews</h2>
          <div className="space-y-3">
            {ratingsData.ratings.map((r: any, i: number) => (
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
              </div>
            ))}
          </div>
        </div>
      )}

      {ratingsData?.total_ratings === 0 && (
        <div className="card text-center py-8 text-gray-400">No reviews yet</div>
      )}
    </div>
  );
}
