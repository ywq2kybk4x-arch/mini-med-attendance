'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SetupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const response = await fetch('/api/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    setLoading(false);
    if (!response.ok) {
      const data = await response.json();
      setError(data.error || 'Failed to create organization');
      return;
    }
    router.push('/admin');
  };

  return (
    <div className="max-w-xl rounded-3xl bg-white p-8 shadow-panel">
      <h1 className="font-display text-3xl">Create your organization</h1>
      <p className="mt-2 text-sm text-ink-500">
        This is a one-time setup step for the owner account.
      </p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="text-xs uppercase tracking-wider text-ink-400">Organization name</label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full rounded-xl border border-ink-200 px-4 py-3 text-sm"
            required
          />
        </div>
        {error ? <div className="text-sm text-red-500">{error}</div> : null}
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-ink-900 px-5 py-3 text-sm font-semibold text-white"
        >
          {loading ? 'Creating...' : 'Create organization'}
        </button>
      </form>
    </div>
  );
}
