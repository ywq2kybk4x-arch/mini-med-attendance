import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = getSupabaseServerClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { status } = await request.json();
  if (!['scheduled', 'open', 'closed'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const { data: session, error } = await supabase
    .from('sessions')
    .update({ status })
    .eq('id', params.id)
    .select('id, status')
    .single();

  if (error || !session) {
    return NextResponse.json({ error: error?.message || 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ session });
}
