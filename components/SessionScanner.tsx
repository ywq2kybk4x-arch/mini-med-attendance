'use client';

import { useCallback, useRef, useState } from 'react';
import Scanner from '@/components/Scanner';
import { AudioManagerProvider, useAudioManager } from '@/components/AudioManager';

function ScannerInner({ sessionId }: { sessionId: string }) {
  const { unlock, playSuccess, playNeutral } = useAudioManager();
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'already' | 'error'>('idle');
  const [message, setMessage] = useState('Ready to scan');
  const [studentName, setStudentName] = useState('');
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
        setMessage('Invalid or unauthorized scan');
        setBusy(false);
        return;
      }
      const data = await response.json();
      setStudentName(data.student?.full_name || 'Student');
      if (data.status === 'already_present') {
        setStatus('already');
        setMessage('Already marked present');
        playNeutral();
      } else {
        setStatus('success');
        setMessage('Marked present');
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
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-panel">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-ink-400">Session scan</div>
            <h1 className="mt-2 font-display text-2xl">Scan student badges</h1>
          </div>
          <button
            onClick={start}
            className="rounded-full bg-ink-900 px-5 py-2 text-sm font-semibold text-white"
          >
            Start scanning
          </button>
        </div>
      </div>
      <Scanner active={active} onScan={handleScan} />
      <div
        className={`rounded-2xl p-4 text-center text-sm font-semibold ${
          status === 'success'
            ? 'bg-mint-500/20 text-mint-600'
            : status === 'already'
            ? 'bg-ink-200 text-ink-600'
            : status === 'error'
            ? 'bg-red-100 text-red-600'
            : 'bg-white text-ink-600'
        }`}
      >
        <div className="text-lg">{message}</div>
        {studentName ? <div className="mt-1 text-sm">{studentName}</div> : null}
      </div>
    </div>
  );
}

export default function SessionScanner({ sessionId }: { sessionId: string }) {
  return (
    <AudioManagerProvider>
      <ScannerInner sessionId={sessionId} />
    </AudioManagerProvider>
  );
}
