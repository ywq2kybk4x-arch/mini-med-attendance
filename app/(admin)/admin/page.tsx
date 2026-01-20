import { getOrganization, getDashboardStats } from '@/lib/data';
import { redirect } from 'next/navigation';
import StatCard from '@/components/StatCard';
import Link from 'next/link';

export default async function AdminDashboard() {
  const org = await getOrganization();
  if (!org) {
    redirect('/admin/setup');
  }
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      <header className="rounded-3xl bg-gradient-to-br from-ink-900 via-ink-800 to-ink-700 p-8 text-white shadow-panel">
        <p className="text-sm text-ink-200">Organization</p>
        <h1 className="mt-2 font-display text-3xl">{org.name}</h1>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link className="rounded-full bg-white/10 px-4 py-2" href="/admin/sessions">Manage sessions</Link>
          <Link className="rounded-full bg-white/10 px-4 py-2" href="/admin/students">Student badges</Link>
          <Link className="rounded-full bg-white/10 px-4 py-2" href="/admin/classes">Classes & cohorts</Link>
        </div>
      </header>
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Students" value={stats.students} />
        <StatCard label="Classes" value={stats.classes} />
        <StatCard label="Sessions" value={stats.sessions} />
      </section>
    </div>
  );
}
