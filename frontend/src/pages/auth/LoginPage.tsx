import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const { data: loginData } = await api.post('/auth/login', data);
      const { data: profile } = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${loginData.token}` },
      });
      return { token: loginData.token, user: profile };
    },
    onSuccess: ({ token, user }) => {
      setAuth(user, token);
      queryClient.clear();
      navigate('/dashboard');
    },
    onError: (err: any) => toast.error(err.response?.data?.error ?? 'Login failed'),
  });

  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

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
            Welcome back, UOL student!
          </h2>
          <p className="text-blue-200 text-sm leading-relaxed">
            Sign in to find rides, offer your car, and connect with your fellow students.
          </p>
        </div>

        <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <p className="text-blue-100 text-sm italic mb-3">
            "Saved Rs. 3,000 this month commuting from DHA to UOL!"
          </p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-300 flex items-center justify-center text-sm font-bold">S</div>
            <div>
              <p className="text-sm font-semibold">Sarah Ahmed</p>
              <p className="text-xs text-blue-200">CS Department</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center text-white">🚗</div>
            <span className="font-extrabold text-lg text-blue-800">UOL Ride Share</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">Sign in</h1>
          <p className="text-slate-500 text-sm mb-8">Use your UOL student credentials</p>

          <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }} className="space-y-4">
            <div>
              <label className="label">UOL Email</label>
              <input name="email" type="email" value={form.email} onChange={handle}
                required autoFocus className="input" placeholder="yourname@student.uol.edu.pk" />
            </div>
            <div>
              <label className="label">Password</label>
              <input name="password" type="password" value={form.password} onChange={handle}
                required className="input" placeholder="Your password" />
            </div>

            <button type="submit" disabled={mutation.isPending} className="btn-primary w-full py-3 text-base mt-2">
              {mutation.isPending
                ? <><span className="animate-spin">⏳</span> Signing in...</>
                : '🚀 Sign In'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
            <strong>Note:</strong> Only <code className="bg-blue-100 px-1 py-0.5 rounded">@student.uol.edu.pk</code> email addresses are allowed.
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-800 font-semibold">Sign up →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
