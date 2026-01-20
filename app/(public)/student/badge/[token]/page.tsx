import { getSupabaseServerClient } from '@/lib/supabase/server';
import QRCode from 'qrcode';
import { notFound } from 'next/navigation';

export default async function StudentBadgePage({ params }: { params: { token: string } }) {
  const supabase = getSupabaseServerClient();
  const { data: student } = await supabase
    .rpc('get_student_badge', { token: params.token })
    .single();

  if (!student) {
    notFound();
  }

  const qr = await QRCode.toDataURL(student.badge_token, { margin: 2, width: 420 });

  return (
    <div className="min-h-screen bg-ink-900 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="rounded-3xl bg-white p-6 shadow-panel">
          <img src={qr} alt="Student QR" className="w-full" />
        </div>
        <h1 className="mt-6 font-display text-2xl">{student.full_name}</h1>
        <p className="mt-2 text-sm text-ink-200">Show this QR at check-in.</p>
      </div>
    </div>
  );
}
