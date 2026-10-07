import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const LAHORE_AREAS = [
  'Johar Town','Gulberg','DHA Phase 1','DHA Phase 2','DHA Phase 5','DHA Phase 6',
  'Model Town','Garden Town','Faisal Town','Allama Iqbal Town','Sabzazar',
  'Iqbal Town','Raiwind Road','Bahria Town','Lake City','Township',
  'Shadman','Wapda Town','Askari 10','Cantt','Samanabad','Shalimar',
];

export default function PostRidePage() {
  const navigate = useNavigate();
  const minDatetime = new Date(Date.now() + 5 * 60000).toISOString().slice(0, 16);
  const [form, setForm] = useState({
    origin_area: '', destination: 'UOL Main Campus',
    departure_time: '', total_seats: 2, cost_per_seat: 100,
  });

  const mutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/rides', {
      ...data, total_seats: Number(data.total_seats), cost_per_seat: Number(data.cost_per_seat),
    }).then((r) => r.data),
    onSuccess: (data) => { toast.success('Ride posted!'); navigate(`/rides/${data.id}`); },
    onError: (err: any) => toast.error(err.response?.data?.error ?? 'Failed to post ride'),
  });

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Offer a Ride</h1>
        <p className="text-slate-500 text-sm mt-1">Help fellow students commute to UOL</p>
      </div>

      <div className="card shadow-md">
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }} className="space-y-6">

          {/* Route section */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">🗺️ Route Details</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Pickup Area</label>
                <select name="origin_area" value={form.origin_area} onChange={handle}
                  required className="input">
                  <option value="">Select your area...</option>
                  {LAHORE_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Destination</label>
                <input name="destination" value={form.destination} onChange={handle}
                  required className="input" placeholder="UOL Main Campus" />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Schedule section */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">📅 Schedule</p>
            <div>
              <label className="label">Departure Date & Time</label>
              <input name="departure_time" type="datetime-local" value={form.departure_time}
                min={minDatetime} onChange={handle} required className="input" />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Seats & cost section */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">🪑 Seats & Cost</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Available Seats</label>
                <div className="flex gap-2">
                  {[1,2,3,4].map((n) => (
                    <button key={n} type="button"
                      onClick={() => setForm((f) => ({ ...f, total_seats: n }))}
                      className={`flex-1 h-10 rounded-xl text-sm font-bold transition-all
                        ${form.total_seats === n
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Cost per Seat (Rs.)</label>
                <input name="cost_per_seat" type="number" min={0} step={10}
                  value={form.cost_per_seat} onChange={handle} required className="input" />
              </div>
            </div>
          </div>

          {/* Info box */}
          <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <span className="text-xl flex-shrink-0">💡</span>
            <div>
              <p className="font-semibold mb-0.5">Cash payment only</p>
              <p className="text-amber-700">The suggested cost is informational. Passengers will pay you directly in cash during the ride.</p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1 py-3 text-base">
              {mutation.isPending ? '⏳ Posting ride...' : '🚗 Post Ride'}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary px-5">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
