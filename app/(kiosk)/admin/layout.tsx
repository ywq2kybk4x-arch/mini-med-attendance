import { ReactNode } from 'react';
import { getProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function KioskLayout({ children }: { children: ReactNode }) {
  const profile = await getProfile();
  if (!profile) {
    redirect('/login');
  }

  return <div className="min-h-screen bg-ink-900">{children}</div>;
}
