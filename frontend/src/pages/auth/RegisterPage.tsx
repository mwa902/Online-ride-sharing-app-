import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function RegisterPage() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '' });
  const [done, setDone] = useState(false);
  const [devToken, setDevToken] = useState('');

  const mutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/auth/register', data).then((r) => r.data),
    onSuccess: (data) => {
      setDone(true);
      if (data.dev_token) setDevToken(data.dev_token);
    },
    onError: (err: any) => toast.error(err.response?.data?.error ?? 'Registration failed'),
  });

  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center shadow-xl border-0">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-5 shadow-lg shadow-emerald-200">
            📧
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Check your inbox!</h2>
          <p className="text-slate-500 mb-2">
            We sent a verification link to
          </p>
          <p className="font-semibold text-blue-700 mb-6 bg-blue-50 px-4 py-2 rounded-lg inline-block">
            {form.email}
          </p>
          <p className="text-slate-400 text-sm mb-6">Click the link in your email to activate your account. Check spam if not found.</p>

          {devToken && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
              <p className="text-xs font-bold text-amber-700 mb-1">🔧 DEV MODE — Verification Token:</p>
              <code className="text-xs text-amber-800 break-all">{devToken}</code>
              <button
                onClick={() => { window.location.href = `/verify-email?token=${devToken}`; }}
                className="mt-2 text-xs btn-primary py-1.5 px-3 w-full">
                Click to verify now (dev only)
              </button>
            </div>
          )}

          <Link to="/login" className="btn-primary w-full">Continue to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-96 bg-hero-gradient p-10 text-white">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">🚗</div>
            <span className="font-extrabold text-xl">UOL Ride Share</span>
          </div>
          <h2 className="text-3xl font-bold mb-4 leading-snug">
            Share rides, split costs, save time
          </h2>
          <p className="text-blue-200 text-sm leading-relaxed">
            Connect with fellow UOL students traveling the same route. Safe, affordable, and eco-friendly commuting.
          </p>
        </div>
        <div className="space-y-4">
          {[
            { icon: '🔒', text: 'Verified UOL students only' },
            { icon: '💵', text: 'Split fuel costs in cash' },
            { icon: '⭐', text: 'Community trust ratings' },
            { icon: '🌿', text: 'Reduce carbon footprint' },
          ].map((f) => (
            <div key={f.text} className="flex items-center gap-3 text-sm text-blue-100">
              <span className="text-lg">{f.icon}</span>
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center text-white">🚗</div>
            <span className="font-extrabold text-lg text-blue-800">UOL Ride Share</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">Create account</h1>
          <p className="text-slate-500 text-sm mb-8">UOL student email required</p>

          <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input name="full_name" value={form.full_name} onChange={handle}
                required className="input" placeholder="Ali Hassan" />
            </div>
            <div>
              <label className="label">UOL Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handle}
                required className="input" placeholder="yourname@student.uol.edu.pk" />
              <p className="text-xs text-slate-400 mt-1">Must end with @student.uol.edu.pk</p>
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input name="phone" value={form.phone} onChange={handle}
                required className="input" placeholder="03001234567" />
            </div>
            <div>
              <label className="label">Password</label>
              <input name="password" type="password" value={form.password} onChange={handle}
                required minLength={8} className="input" placeholder="At least 8 characters" />
            </div>

            <button type="submit" disabled={mutation.isPending} className="btn-primary w-full mt-2 py-3 text-base">
              {mutation.isPending
                ? <><span className="animate-spin">⏳</span> Creating account...</>
                : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-800 font-semibold">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
