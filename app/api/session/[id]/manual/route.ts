import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = getSupabaseServerClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { studentId } = await request.json();
  if (!studentId) {
    return NextResponse.json({ error: 'Missing student' }, { status: 400 });
  }

  const { data: session } = await supabase
    .from('sessions')
    .select('id, org_id')
    .eq('id', params.id)
    .single();

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const { data: attendance, error } = await supabase
    .from('attendance')
    .insert({
      org_id: session.org_id,
      session_id: session.id,
      student_id: studentId,
      scanned_by: userData.user.id,
      method: 'manual'
    })
    .select('student_id, scanned_at, method')
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Already present' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ attendance });
}
