'use client';

import { useMemo, useState } from 'react';

type Student = {
  id: string;
  full_name: string;
};

type Attendance = {
  student_id: string;
  scanned_at: string;
  method: 'scan' | 'manual';
};

export default function SessionRoster({
  sessionId,
  students,
  attendance
}: {
  sessionId: string;
  students: Student[];
  attendance: Attendance[];
}) {
  const [query, setQuery] = useState('');
  const [currentAttendance, setCurrentAttendance] = useState(attendance);
  const presentIds = useMemo(
    () => new Set(currentAttendance.map((item) => item.student_id)),
    [currentAttendance]
  );

  const filtered = students.filter((student) =>
    student.full_name.toLowerCase().includes(query.toLowerCase())
  );

  const present = filtered.filter((student) => presentIds.has(student.id));
  const absent = filtered.filter((student) => !presentIds.has(student.id));

  const markPresent = async (studentId: string) => {
    const response = await fetch(`/api/session/${sessionId}/manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId })
    });

    if (response.ok) {
      const data = await response.json();
      setCurrentAttendance((prev) => [...prev, data.attendance]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search students"
          className="flex-1 rounded-xl border border-ink-200 px-4 py-2 text-sm"
        />
        <a
          href={`/api/session/${sessionId}/export.csv`}
          className="rounded-xl border border-ink-200 px-4 py-2 text-sm"
        >
          Export CSV
        </a>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 shadow-panel">
          <div className="text-sm font-semibold text-ink-900">Present ({present.length})</div>
          <div className="mt-3 space-y-2">
            {present.map((student) => (
              <div key={student.id} className="flex items-center justify-between text-sm">
                <span>{student.full_name}</span>
                <span className="rounded-full bg-mint-500/15 px-2 py-1 text-xs text-mint-600">Present</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-panel">
          <div className="text-sm font-semibold text-ink-900">Absent ({absent.length})</div>
          <div className="mt-3 space-y-2">
            {absent.map((student) => (
              <div key={student.id} className="flex items-center justify-between text-sm">
                <span>{student.full_name}</span>
                <button
                  onClick={() => markPresent(student.id)}
                  className="rounded-full border border-ink-200 px-2 py-1 text-xs"
                >
                  Mark present
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
