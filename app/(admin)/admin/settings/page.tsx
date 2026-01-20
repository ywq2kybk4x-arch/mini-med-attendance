'use client';

import { AudioManagerProvider, useAudioManager } from '@/components/AudioManager';

function SettingsInner() {
  const { beepEnabled, vibrationEnabled, setBeepEnabled, setVibrationEnabled } = useAudioManager();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl">Scanner settings</h1>
        <p className="text-sm text-ink-500">Audio + vibration are saved on this device.</p>
      </header>
      <div className="rounded-2xl bg-white p-6 shadow-panel space-y-4">
        <label className="flex items-center justify-between">
          <span className="text-sm text-ink-700">Beep sound</span>
          <input
            type="checkbox"
            checked={beepEnabled}
            onChange={(event) => setBeepEnabled(event.target.checked)}
            className="h-5 w-5"
          />
        </label>
        <label className="flex items-center justify-between">
          <span className="text-sm text-ink-700">Vibration feedback</span>
          <input
            type="checkbox"
            checked={vibrationEnabled}
            onChange={(event) => setVibrationEnabled(event.target.checked)}
            className="h-5 w-5"
          />
        </label>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AudioManagerProvider>
      <SettingsInner />
    </AudioManagerProvider>
  );
}
