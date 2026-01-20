import { ReactNode } from 'react';
import { getProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/sessions', label: 'Sessions' },
  { href: '/admin/classes', label: 'Classes' },
  { href: '/admin/students', label: 'Students' },
  { href: '/admin/settings', label: 'Settings' }
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const profile = await getProfile();
  if (!profile) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-ink-50 text-ink-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-col bg-ink-900 text-white lg:flex">
          <div className="px-6 py-6">
            <div className="text-lg font-display">Mini Med</div>
            <div className="text-xs text-ink-200">Attendance</div>
          </div>
          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-sm text-ink-100 hover:bg-ink-800"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="px-6 py-6 text-xs text-ink-300">
            Signed in as {profile.full_name || 'Admin'}
          </div>
        </aside>
        <main className="flex-1">
          <div className="sticky top-0 z-10 bg-ink-50/95 backdrop-blur lg:hidden">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="text-sm font-display text-ink-900">Mini Med</div>
              <div className="text-xs text-ink-500">{profile.full_name || 'Admin'}</div>
            </div>
            <nav className="flex gap-2 overflow-x-auto px-4 pb-4 text-xs">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap rounded-full bg-white px-3 py-1 shadow"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="px-4 py-6 lg:px-10 lg:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
