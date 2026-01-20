import { getSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import KioskScanner from '@/components/KioskScanner';

export default async function KioskPage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseServerClient();
  const { data: session } = await supabase
    .from('sessions')
    .select('id')
    .eq('id', params.id)
    .single();

  if (!session) {
    redirect('/admin/sessions');
  }

  return <KioskScanner sessionId={session.id} />;
}
