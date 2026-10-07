import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from '../../api/axios';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMsg, setErrorMsg] = useState('');

  const mutation = useMutation({
    mutationFn: (t: string) => api.post('/auth/verify-email', { token: t }),
    onSuccess: () => setStatus('success'),
    onError: (err: any) => {
      setStatus('error');
      setErrorMsg(err.response?.data?.error ?? 'Verification failed');
    },
  });

  useEffect(() => {
    if (token) mutation.mutate(token);
    else setStatus('error');
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="card max-w-md w-full text-center">
        {status === 'verifying' && (
          <>
            <div className="text-4xl mb-4 animate-spin inline-block">⏳</div>
            <h2 className="text-xl font-semibold">Verifying your email...</h2>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email verified!</h2>
            <p className="text-gray-600 mb-6">Your account is now active. You can sign in.</p>
            <Link to="/login" className="btn-primary inline-block">Sign In</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification failed</h2>
            <p className="text-gray-600 mb-6">{errorMsg || 'Invalid or missing token.'}</p>
            <Link to="/login" className="btn-secondary inline-block">Back to Login</Link>
          </>
        )}
      </div>
    </div>
  );
}
