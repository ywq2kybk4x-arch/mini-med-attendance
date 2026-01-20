'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function QRCodeBadge({ token, name }: { token: string; name: string }) {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(token, { margin: 1, width: 256 })
      .then((url) => {
        if (active) setDataUrl(url);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [token]);

  const download = () => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${name || 'student'}-badge.png`;
    link.click();
  };

  return (
    <div className="flex items-center gap-4">
      <div className="h-20 w-20 rounded-xl bg-ink-100 p-2">
        {dataUrl ? <img src={dataUrl} alt="QR" className="h-full w-full" /> : null}
      </div>
      <button
        onClick={download}
        className="rounded-full border border-ink-200 px-3 py-1 text-xs text-ink-600"
        type="button"
      >
        Download PNG
      </button>
    </div>
  );
}
