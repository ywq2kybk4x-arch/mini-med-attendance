import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function getOrganization() {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.from('organizations').select('*').limit(1).maybeSingle();
  return data || null;
}

export async function getDashboardStats() {
  const supabase = getSupabaseServerClient();
  const [{ count: students }, { count: classes }, { count: sessions }] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }),
    supabase.from('classes').select('*', { count: 'exact', head: true }),
    supabase.from('sessions').select('*', { count: 'exact', head: true })
  ]);

  return {
    students: students ?? 0,
    classes: classes ?? 0,
    sessions: sessions ?? 0
  };
}
