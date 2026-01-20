'use client';

import { useEffect, useId, useState } from 'react';

export default function Scanner({ active, onScan }: { active: boolean; onScan: (value: string) => void }) {
  const scannerId = useId().replace(/:/g, '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let html5Qrcode: any;
    let isMounted = true;

    const start = async () => {
      if (!active) return;
      const { Html5Qrcode } = await import('html5-qrcode');
      html5Qrcode = new Html5Qrcode(scannerId, { verbose: false });
      try {
        await html5Qrcode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText: string) => onScan(decodedText)
        );
      } catch (_err) {
        if (isMounted) {
          setError('Camera access denied. Please allow camera permissions.');
        }
      }
    };

    start();

    return () => {
      isMounted = false;
      if (html5Qrcode) {
        html5Qrcode.stop().then(() => html5Qrcode.clear()).catch(() => {});
      }
    };
  }, [active, onScan, scannerId]);

  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl bg-ink-900">
      <div id={scannerId} className="h-full w-full" />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-56 w-56 rounded-3xl border-4 border-mint-500/80 shadow-[0_0_0_2000px_rgba(0,0,0,0.35)]" />
      </div>
      {error ? (
        <div className="absolute inset-x-4 bottom-4 rounded-xl bg-white/90 p-3 text-sm text-ink-900">
          {error}
        </div>
      ) : null}
    </div>
  );
}
