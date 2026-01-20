import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function requireUser() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    redirect('/login');
  }
  return data.user;
}

export async function getProfile() {
  const supabase = getSupabaseServerClient();
  const { data: userData, error } = await supabase.auth.getUser();
  if (error || !userData.user) {
    return null;
  }
  const { data } = await supabase
    .from('profiles')
    .select('id, org_id, role, full_name')
    .eq('id', userData.user.id)
    .maybeSingle();

  return data || null;
}
