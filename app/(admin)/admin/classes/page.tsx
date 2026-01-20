import { getSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getOrganization } from '@/lib/data';
import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/auth';

export default async function ClassesPage() {
  const org = await getOrganization();
  if (!org) {
    redirect('/admin/setup');
  }
  const profile = await getProfile();
  const supabase = getSupabaseServerClient();
  const { data: classes } = await supabase.from('classes').select('*').order('created_at', { ascending: false });

  async function createClass(formData: FormData) {
    'use server';
    const name = String(formData.get('name') || '').trim();
    if (!name) return;
    const supabaseAction = getSupabaseServerClient();
    await supabaseAction.from('classes').insert({ name, org_id: org.id });
    revalidatePath('/admin/classes');
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl">Classes</h1>
        <p className="text-sm text-ink-500">Create cohorts and assign admins in Supabase or SQL.</p>
      </header>
      {profile?.role === 'owner' ? (
        <form action={createClass} className="flex flex-wrap gap-3 rounded-2xl bg-white p-4 shadow-panel">
          <input
            name="name"
            placeholder="New class name"
            className="flex-1 rounded-xl border border-ink-200 px-4 py-2 text-sm"
          />
          <button className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white">Add class</button>
        </form>
      ) : (
        <div className="rounded-2xl bg-ink-100 p-4 text-sm text-ink-600">
          You have view-only access to assigned classes.
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {classes?.map((item) => (
          <div key={item.id} className="rounded-2xl bg-white p-5 shadow-panel">
            <div className="text-lg font-semibold text-ink-900">{item.name}</div>
            <div className="text-xs text-ink-400">Created {new Date(item.created_at).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
