import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import RideCard from '../../components/RideCard';

const LAHORE_AREAS = [
  'Johar Town','Gulberg','DHA Phase 1','DHA Phase 2','DHA Phase 5','DHA Phase 6',
  'Model Town','Garden Town','Faisal Town','Allama Iqbal Town','Sabzazar',
  'Iqbal Town','Raiwind Road','Bahria Town','Lake City','Township',
  'Shadman','Wapda Town','Askari 10','Cantt','Samanabad','Shalimar',
];

export default function SearchRidesPage() {
  const [urlParams] = useSearchParams();
  const today = new Date().toISOString().split('T')[0];
  const [query, setQuery] = useState({
    origin_area:  urlParams.get('origin_area')  ?? '',
    destination:  urlParams.get('destination')  ?? 'UOL Main Campus',
    date:         urlParams.get('date')          ?? today,
  });
  const [submitted, setSubmitted] = useState(false);

  // Auto-search if URL has params
  useEffect(() => {
    if (urlParams.get('origin_area')) setSubmitted(true);
  }, []);

  const { data, isFetching, refetch } = useQuery({
    queryKey: ['search-rides', query],
    queryFn: () => api.get('/rides/search', { params: query }).then((r) => r.data),
    enabled: submitted,
  });

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setQuery((q) => ({ ...q, [e.target.name]: e.target.value }));

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    refetch();
  };

  const rides = data?.rides ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Find a Ride</h1>
        <p className="text-slate-500 text-sm mt-1">Search for available rides to UOL</p>
      </div>

      {/* Search card */}
      <div className="card shadow-md border-0 bg-gradient-to-br from-blue-700 to-blue-900 text-white">
        <form onSubmit={search} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-blue-200 text-xs font-semibold mb-1.5">📍 Pickup Area</label>
              <select name="origin_area" value={query.origin_area} onChange={handle}
                required className="w-full rounded-xl px-3 py-2.5 text-sm text-slate-800 bg-white border-0 shadow-sm focus:ring-2 focus:ring-blue-300 focus:outline-none">
                <option value="">Select your area...</option>
                {LAHORE_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-blue-200 text-xs font-semibold mb-1.5">🏫 Destination</label>
              <input name="destination" value={query.destination} onChange={handle}
                required className="w-full rounded-xl px-3 py-2.5 text-sm text-slate-800 bg-white border-0 shadow-sm focus:ring-2 focus:ring-blue-300 focus:outline-none" />
            </div>
            <div>
              <label className="block text-blue-200 text-xs font-semibold mb-1.5">📅 Travel Date</label>
              <input name="date" type="date" value={query.date} onChange={handle}
                required min={today}
                className="w-full rounded-xl px-3 py-2.5 text-sm text-slate-800 bg-white border-0 shadow-sm focus:ring-2 focus:ring-blue-300 focus:outline-none" />
            </div>
          </div>
          <button type="submit" disabled={isFetching}
            className="w-full md:w-auto px-8 py-3 bg-white text-blue-800 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-md active:scale-95 disabled:opacity-70">
            {isFetching ? '🔍 Searching...' : '🔍 Search Rides'}
          </button>
        </form>
      </div>

      {/* Results */}
      {submitted && (
        <>
          {isFetching && (
            <div className="flex flex-col items-center py-20 text-slate-400 gap-3">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <p>Searching for rides...</p>
            </div>
          )}

          {!isFetching && rides.length === 0 && (
            <div className="card text-center py-20">
              <div className="text-6xl mb-4">🚗</div>
              <h3 className="font-semibold text-slate-700 mb-2">No rides found</h3>
              <p className="text-slate-400 text-sm">{data?.message ?? 'Try a different date or area'}</p>
            </div>
          )}

          {!isFetching && rides.length > 0 && (
            <div>
              <p className="text-sm text-slate-500 mb-4 font-medium">
                {rides.length} ride{rides.length > 1 ? 's' : ''} available
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {rides.map((ride: any) => <RideCard key={ride.id} ride={ride} />)}
              </div>
            </div>
          )}
        </>
      )}

      {!submitted && (
        <div className="card text-center py-20 border-dashed">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-slate-500">Enter your pickup area and date to find rides</p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {['Johar Town', 'Gulberg', 'DHA Phase 5', 'Bahria Town'].map((area) => (
              <button key={area}
                onClick={() => { setQuery((q) => ({ ...q, origin_area: area })); }}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors">
                {area}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
