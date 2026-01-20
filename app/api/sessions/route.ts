import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = getSupabaseServerClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('id, title, start_time, end_time, status, class_id');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sessions });
}

export async function POST(request: Request) {
  const supabase = getSupabaseServerClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, org_id')
    .eq('id', userData.user.id)
    .single();

  if (!profile || profile.role !== 'owner') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { classId, title, startTime, endTime, status } = await request.json();
  if (!classId || !startTime || !endTime) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const { data: session, error } = await supabase
    .from('sessions')
    .insert({
      org_id: profile.org_id,
      class_id: classId,
      title: title || null,
      start_time: startTime,
      end_time: endTime,
      status: status || 'scheduled',
      created_by: userData.user.id
    })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ session });
}
