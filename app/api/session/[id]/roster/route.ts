import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const supabase = getSupabaseServerClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: session } = await supabase
    .from('sessions')
    .select('id, class_id')
    .eq('id', params.id)
    .single();
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const { data: classStudents } = await supabase
    .from('class_students')
    .select('students(id, full_name)')
    .eq('class_id', session.class_id);

  const students = (classStudents || [])
    .map((item) => item.students)
    .filter(Boolean);

  const { data: attendance } = await supabase
    .from('attendance')
    .select('student_id, scanned_at, method')
    .eq('session_id', session.id);

  return NextResponse.json({ students, attendance });
}
