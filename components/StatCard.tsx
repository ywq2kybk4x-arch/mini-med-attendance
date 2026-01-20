export default function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-panel">
      <div className="text-xs uppercase tracking-wider text-ink-400">{label}</div>
      <div className="mt-3 text-3xl font-display text-ink-900">{value}</div>
    </div>
  );
}
