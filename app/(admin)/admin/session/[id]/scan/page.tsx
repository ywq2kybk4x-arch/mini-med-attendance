import { getSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SessionScanner from '@/components/SessionScanner';

export default async function SessionScanPage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseServerClient();
  const { data: session } = await supabase
    .from('sessions')
    .select('id')
    .eq('id', params.id)
    .single();

  if (!session) {
    redirect('/admin/sessions');
  }

  return <SessionScanner sessionId={session.id} />;
}
