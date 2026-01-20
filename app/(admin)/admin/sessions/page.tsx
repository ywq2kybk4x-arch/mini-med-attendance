import { getSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getOrganization } from '@/lib/data';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getProfile } from '@/lib/auth';

export default async function SessionsPage() {
  const org = await getOrganization();
  if (!org) {
    redirect('/admin/setup');
  }
  const profile = await getProfile();
  const supabase = getSupabaseServerClient();
  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, title, start_time, end_time, status, class_id, classes(name)')
    .order('start_time', { ascending: false });
  const { data: classes } = await supabase.from('classes').select('*').order('name');

  async function createSession(formData: FormData) {
    'use server';
    const class_id = String(formData.get('class_id') || '').trim();
    const title = String(formData.get('title') || '').trim();
    const start_time = String(formData.get('start_time') || '').trim();
    const end_time = String(formData.get('end_time') || '').trim();
    if (!class_id || !start_time || !end_time) return;

    const supabaseAction = getSupabaseServerClient();
    await supabaseAction.from('sessions').insert({
      org_id: org.id,
      class_id,
      title: title || null,
      start_time,
      end_time,
      status: 'scheduled'
    });
    revalidatePath('/admin/sessions');
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl">Sessions</h1>
        <p className="text-sm text-ink-500">Manage attendance events and open scanning.</p>
      </header>
      {profile?.role === 'owner' ? (
        <form action={createSession} className="grid gap-3 rounded-2xl bg-white p-4 shadow-panel lg:grid-cols-5">
          <select name="class_id" className="rounded-xl border border-ink-200 px-4 py-2 text-sm" required>
            <option value="">Select class</option>
            {classes?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <input name="title" placeholder="Optional title" className="rounded-xl border border-ink-200 px-4 py-2 text-sm" />
          <input name="start_time" type="datetime-local" className="rounded-xl border border-ink-200 px-4 py-2 text-sm" required />
          <input name="end_time" type="datetime-local" className="rounded-xl border border-ink-200 px-4 py-2 text-sm" required />
          <button className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white">Create session</button>
        </form>
      ) : (
        <div className="rounded-2xl bg-ink-100 p-4 text-sm text-ink-600">
          You can view sessions assigned to your classes and scan attendance.
        </div>
      )}
      <div className="space-y-4">
        {sessions?.map((session) => (
          <div key={session.id} className="rounded-2xl bg-white p-5 shadow-panel">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-lg font-semibold text-ink-900">
                  {session.title || session.classes?.name || 'Session'}
                </div>
                <div className="text-xs text-ink-400">
                  {new Date(session.start_time).toLocaleString()} - {new Date(session.end_time).toLocaleTimeString()}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-ink-100 px-3 py-1 text-xs">{session.status}</span>
                <Link
                  className="rounded-full bg-ink-900 px-3 py-1 text-xs text-white"
                  href={`/admin/session/${session.id}`}
                >
                  Open
                </Link>
                <Link
                  className="rounded-full border border-ink-200 px-3 py-1 text-xs"
                  href={`/admin/session/${session.id}/scan`}
                >
                  Scan
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
