'use client';

import { useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-ink-900 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-3xl bg-white/10 p-8 shadow-panel">
        <h1 className="font-display text-2xl">Admin sign in</h1>
        <p className="text-sm text-ink-200 mt-2">Use your Supabase email/password.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-ink-200">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-ink-200">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
              required
            />
          </div>
          {error ? <div className="text-sm text-red-200">{error}</div> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-mint-500 px-4 py-3 text-sm font-semibold text-ink-900"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
