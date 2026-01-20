import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

const GRACE_MINUTES = 10;

export async function POST(request: Request) {
  const supabase = getSupabaseServerClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { sessionId, badgeToken } = await request.json();
  if (!sessionId || !badgeToken) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('id, org_id, class_id, status, start_time, end_time')
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const now = new Date();
  const start = new Date(session.start_time);
  const end = new Date(session.end_time);
  const graceStart = new Date(start.getTime() - GRACE_MINUTES * 60000);
  const graceEnd = new Date(end.getTime() + GRACE_MINUTES * 60000);

  if (session.status !== 'open' || now < graceStart || now > graceEnd) {
    return NextResponse.json({ error: 'Session closed' }, { status: 403 });
  }

  const { data: student } = await supabase
    .from('students')
    .select('id, full_name, org_id')
    .eq('badge_token', badgeToken)
    .single();

  if (!student || student.org_id !== session.org_id) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  const { data: attendance, error: attendanceError } = await supabase
    .from('attendance')
    .insert({
      org_id: session.org_id,
      session_id: session.id,
      student_id: student.id,
      scanned_by: userData.user.id,
      method: 'scan'
    })
    .select('scanned_at')
    .single();

  if (attendanceError) {
    if (attendanceError.code === '23505') {
      return NextResponse.json({
        status: 'already_present',
        student: { id: student.id, full_name: student.full_name },
        scannedAt: new Date().toISOString()
      });
    }
    return NextResponse.json({ error: attendanceError.message }, { status: 500 });
  }

  return NextResponse.json({
    status: 'ok',
    student: { id: student.id, full_name: student.full_name },
    scannedAt: attendance?.scanned_at
  });
}
