import { getSupabaseServerClient } from '@/lib/supabase/server';
import QRCode from 'qrcode';
import { notFound } from 'next/navigation';

export default async function StudentPrintPage({ params }: { params: { token: string } }) {
  const supabase = getSupabaseServerClient();
  const { data: student } = await supabase
    .rpc('get_student_badge', { token: params.token })
    .single();

  if (!student) {
    notFound();
  }

  const qr = await QRCode.toDataURL(student.badge_token, { margin: 2, width: 512 });

  return (
    <div className="min-h-screen bg-white text-ink-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md border border-ink-200 p-8 text-center">
        <img src={qr} alt="Student QR" className="mx-auto w-72" />
        <h1 className="mt-6 font-display text-2xl">{student.full_name}</h1>
        <p className="mt-2 text-sm text-ink-500">Mini Med Attendance</p>
      </div>
      <style>{`@media print { body { background: white; } }`}</style>
    </div>
  );
}
