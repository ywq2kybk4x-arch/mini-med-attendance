import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = getSupabaseServerClient();
  const { data: userData, error } = await supabase.auth.getUser();
  if (error || !userData.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name } = await request.json();
  if (!name) {
    return NextResponse.json({ error: 'Organization name required' }, { status: 400 });
  }

  const { data: orgExisting } = await supabase.from('organizations').select('id').limit(1).maybeSingle();
  if (orgExisting) {
    return NextResponse.json({ error: 'Organization already exists' }, { status: 400 });
  }

  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({ name })
    .select('*')
    .single();

  if (orgError || !org) {
    return NextResponse.json({ error: orgError?.message || 'Failed to create org' }, { status: 500 });
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ org_id: org.id, role: 'owner' })
    .eq('id', userData.user.id);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, org });
}
