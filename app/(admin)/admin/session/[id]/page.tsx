import { getSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import SessionRoster from '@/components/SessionRoster';
import SessionStatusToggle from '@/components/SessionStatusToggle';

export default async function SessionDetailPage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseServerClient();
  const { data: session } = await supabase
    .from('sessions')
    .select('id, title, start_time, end_time, status, class_id, classes(name)')
    .eq('id', params.id)
    .single();

  if (!session) {
    redirect('/admin/sessions');
  }

  const { data: classStudents } = await supabase
    .from('class_students')
    .select('students(id, full_name)')
    .eq('class_id', session.class_id);

  const students = (classStudents || [])
    .map((item) => item.students)
    .filter(Boolean) as { id: string; full_name: string }[];

  const { data: attendance } = await supabase
    .from('attendance')
    .select('student_id, scanned_at, method')
    .eq('session_id', session.id);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-panel md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-ink-400">Session</div>
          <h1 className="mt-2 font-display text-2xl">
            {session.title || session.classes?.name || 'Session'}
          </h1>
          <p className="text-sm text-ink-500">
            {new Date(session.start_time).toLocaleString()} - {new Date(session.end_time).toLocaleTimeString()}
          </p>
          <div className="mt-4">
            <SessionStatusToggle sessionId={session.id} status={session.status} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className="rounded-full bg-ink-900 px-4 py-2 text-xs text-white" href={`/admin/session/${session.id}/scan`}>
            Start scanning
          </Link>
          <Link className="rounded-full border border-ink-200 px-4 py-2 text-xs" href={`/admin/session/${session.id}/kiosk`}>
            Kiosk mode
          </Link>
        </div>
      </header>
      <SessionRoster sessionId={session.id} students={students} attendance={attendance || []} />
    </div>
  );
}
