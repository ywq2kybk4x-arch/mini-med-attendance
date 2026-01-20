import { getSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getOrganization } from '@/lib/data';
import { redirect } from 'next/navigation';
import QRCodeBadge from '@/components/QRCodeBadge';
import { getProfile } from '@/lib/auth';

export default async function StudentsPage() {
  const org = await getOrganization();
  if (!org) {
    redirect('/admin/setup');
  }
  const profile = await getProfile();
  const supabase = getSupabaseServerClient();
  const { data: students } = await supabase
    .from('students')
    .select('*')
    .order('created_at', { ascending: false });
  const { data: classes } = await supabase.from('classes').select('*').order('name');

  async function createStudent(formData: FormData) {
    'use server';
    const full_name = String(formData.get('full_name') || '').trim();
    const external_student_id = String(formData.get('external_student_id') || '').trim() || null;
    const class_id = String(formData.get('class_id') || '').trim();
    if (!full_name) return;

    const badge_token = crypto.randomUUID();
    const supabaseAction = getSupabaseServerClient();
    const { data: student } = await supabaseAction
      .from('students')
      .insert({ org_id: org.id, full_name, external_student_id, badge_token })
      .select('id')
      .single();

    if (student && class_id) {
      await supabaseAction.from('class_students').insert({ class_id, student_id: student.id });
    }

    revalidatePath('/admin/students');
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl">Students</h1>
        <p className="text-sm text-ink-500">Generate badges and assign students to classes.</p>
      </header>
      {profile?.role === 'owner' ? (
        <form action={createStudent} className="grid gap-3 rounded-2xl bg-white p-4 shadow-panel md:grid-cols-4">
          <input
            name="full_name"
            placeholder="Student full name"
            className="rounded-xl border border-ink-200 px-4 py-2 text-sm"
            required
          />
          <input
            name="external_student_id"
            placeholder="Student ID (optional)"
            className="rounded-xl border border-ink-200 px-4 py-2 text-sm"
          />
          <select name="class_id" className="rounded-xl border border-ink-200 px-4 py-2 text-sm">
            <option value="">Assign to class</option>
            {classes?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <button className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white">Add student</button>
        </form>
      ) : (
        <div className="rounded-2xl bg-ink-100 p-4 text-sm text-ink-600">
          Student management is owner-only. You can still view badges for assigned classes.
        </div>
      )}
      <div className="space-y-4">
        {students?.map((student) => (
          <div key={student.id} className="rounded-2xl bg-white p-5 shadow-panel">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-lg font-semibold text-ink-900">{student.full_name}</div>
                <div className="text-xs text-ink-400">Token {student.badge_token.slice(0, 8)}...</div>
              </div>
              <div className="space-y-2">
                <QRCodeBadge token={student.badge_token} name={student.full_name} />
                <div className="flex flex-wrap gap-2 text-xs text-ink-500">
                  <a className="underline" href={`/student/badge/${student.badge_token}`} target="_blank" rel="noreferrer">
                    Open badge
                  </a>
                  <a className="underline" href={`/student/print/${student.badge_token}`} target="_blank" rel="noreferrer">
                    Print view
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
