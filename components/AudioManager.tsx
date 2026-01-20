'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

type AudioContextValue = {
  beepEnabled: boolean;
  vibrationEnabled: boolean;
  setBeepEnabled: (value: boolean) => void;
  setVibrationEnabled: (value: boolean) => void;
  unlock: () => Promise<void>;
  playSuccess: () => void;
  playNeutral: () => void;
};

const AudioManagerContext = createContext<AudioContextValue | null>(null);

function useLocalStorageToggle(key: string, fallback: boolean) {
  const [value, setValue] = useState(fallback);

  useEffect(() => {
    const stored = window.localStorage.getItem(key);
    if (stored !== null) {
      setValue(stored === 'true');
    }
  }, [key]);

  useEffect(() => {
    window.localStorage.setItem(key, String(value));
  }, [key, value]);

  return [value, setValue] as const;
}

export function AudioManagerProvider({ children }: { children: React.ReactNode }) {
  const [beepEnabled, setBeepEnabled] = useLocalStorageToggle('mm_beep', true);
  const [vibrationEnabled, setVibrationEnabled] = useLocalStorageToggle('mm_vibrate', true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioReadyRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const ensureAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/beep.mp3');
      audioRef.current.preload = 'auto';
      audioRef.current.addEventListener('loadedmetadata', () => {
        if (audioRef.current && audioRef.current.duration > 0) {
          audioReadyRef.current = true;
        }
      });
    }
  };

  const unlock = async () => {
    ensureAudio();
    try {
      await audioRef.current?.play();
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.currentTime = 0;
    } catch (_) {
      // Fallback to WebAudio if the mp3 is blocked or invalid.
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      await audioContextRef.current.resume();
    }
  };

  const playTone = (frequency: number, duration = 0.12) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    const context = audioContextRef.current;
    if (context.state === 'suspended') {
      context.resume();
    }
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = frequency;
    gain.gain.value = 0.06;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  };

  const triggerVibration = () => {
    if (vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate(80);
    }
  };

  const playSuccess = () => {
    if (beepEnabled) {
      ensureAudio();
      if (audioReadyRef.current) {
        audioRef.current?.play().catch(() => playTone(880));
      } else {
        playTone(880);
      }
    }
    triggerVibration();
  };

  const playNeutral = () => {
    if (beepEnabled) {
      playTone(520, 0.08);
    }
  };

  const value = useMemo(
    () => ({
      beepEnabled,
      vibrationEnabled,
      setBeepEnabled,
      setVibrationEnabled,
      unlock,
      playSuccess,
      playNeutral
    }),
    [beepEnabled, vibrationEnabled]
  );

  return <AudioManagerContext.Provider value={value}>{children}</AudioManagerContext.Provider>;
}

export function useAudioManager() {
  const context = useContext(AudioManagerContext);
  if (!context) {
    throw new Error('AudioManagerProvider missing');
  }
  return context;
}
