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
    .filter(Boolean) as { id: string; full_name: string }[];

  const { data: attendance } = await supabase
    .from('attendance')
    .select('student_id, scanned_at, method')
    .eq('session_id', session.id);

  const attendanceMap = new Map(attendance?.map((item) => [item.student_id, item]) || []);
  const rows = [
    ['student_id', 'full_name', 'status', 'scanned_at', 'method'],
    ...students.map((student) => {
      const record = attendanceMap.get(student.id);
      return [
        student.id,
        student.full_name,
        record ? 'present' : 'absent',
        record?.scanned_at || '',
        record?.method || ''
      ];
    })
  ];

  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="session-${session.id}.csv"`
    }
  });
}
