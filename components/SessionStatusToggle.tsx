'use client';

import { useState } from 'react';

type Status = 'scheduled' | 'open' | 'closed';

export default function SessionStatusToggle({ sessionId, status }: { sessionId: string; status: Status }) {
  const [current, setCurrent] = useState<Status>(status);
  const [loading, setLoading] = useState(false);

  const updateStatus = async (next: Status) => {
    setLoading(true);
    const response = await fetch(`/api/session/${sessionId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next })
    });
    setLoading(false);
    if (response.ok) {
      setCurrent(next);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 text-xs">
      {(['scheduled', 'open', 'closed'] as Status[]).map((item) => (
        <button
          key={item}
          onClick={() => updateStatus(item)}
          disabled={loading}
          className={`rounded-full px-3 py-1 ${
            current === item ? 'bg-ink-900 text-white' : 'border border-ink-200 text-ink-600'
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
