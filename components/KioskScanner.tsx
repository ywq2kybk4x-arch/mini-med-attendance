'use client';

import { useCallback, useRef, useState } from 'react';
import Scanner from '@/components/Scanner';
import { AudioManagerProvider, useAudioManager } from '@/components/AudioManager';

function KioskInner({ sessionId }: { sessionId: string }) {
  const { unlock, playSuccess, playNeutral } = useAudioManager();
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'already' | 'error'>('idle');
  const [studentName, setStudentName] = useState('');
  const [message, setMessage] = useState('Ready');
  const [busy, setBusy] = useState(false);
  const lastScanRef = useRef<{ token: string; ts: number } | null>(null);

  const handleScan = useCallback(
    async (value: string) => {
      const now = Date.now();
      const last = lastScanRef.current;
      if (last && last.token === value && now - last.ts < 1500) return;
      lastScanRef.current = { token: value, ts: now };
      if (busy) return;
      setBusy(true);
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, badgeToken: value })
      });
      if (!response.ok) {
        setStatus('error');
        setMessage('Unauthorized');
        setBusy(false);
        return;
      }
      const data = await response.json();
      setStudentName(data.student?.full_name || 'Student');
      if (data.status === 'already_present') {
        setStatus('already');
        setMessage('Already present');
        playNeutral();
      } else {
        setStatus('success');
        setMessage('Present');
        playSuccess();
      }
      setBusy(false);
    },
    [busy, playNeutral, playSuccess, sessionId]
  );

  const start = async () => {
    await unlock();
    setActive(true);
  };

  return (
    <div className="min-h-screen bg-ink-900 text-white flex flex-col items-center justify-center px-4 py-6">
      <div className="w-full max-w-md space-y-4">
        <div className="rounded-3xl bg-white/10 p-5 text-center">
          <div className="text-xs uppercase tracking-wider text-ink-200">Kiosk</div>
          <div className="mt-2 font-display text-2xl">Scan badges</div>
          <button
            onClick={start}
            className="mt-4 w-full rounded-xl bg-mint-500 px-4 py-3 text-sm font-semibold text-ink-900"
          >
            Start scanning
          </button>
        </div>
        <Scanner active={active} onScan={handleScan} />
        <div
          className={`rounded-2xl p-4 text-center text-sm font-semibold ${
            status === 'success'
              ? 'bg-mint-500/20 text-mint-200'
              : status === 'already'
              ? 'bg-white/20 text-white'
              : status === 'error'
              ? 'bg-red-500/30 text-red-100'
              : 'bg-white/10 text-white'
          }`}
        >
          <div className="text-lg">{message}</div>
          {studentName ? <div className="mt-1 text-sm">{studentName}</div> : null}
        </div>
      </div>
    </div>
  );
}

export default function KioskScanner({ sessionId }: { sessionId: string }) {
  return (
    <AudioManagerProvider>
      <KioskInner sessionId={sessionId} />
    </AudioManagerProvider>
  );
}
