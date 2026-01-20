import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const demo = {
  owner: { email: 'owner@minimed.local', password: 'Password123!', full_name: 'Owner Admin' },
  admin1: { email: 'admin1@minimed.local', password: 'Password123!', full_name: 'Admin One' },
  admin2: { email: 'admin2@minimed.local', password: 'Password123!', full_name: 'Admin Two' }
};

const now = new Date();
const start = new Date(now.getTime() - 30 * 60000).toISOString();
const end = new Date(now.getTime() + 30 * 60000).toISOString();

async function createUser({ email, password, full_name }) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name }
  });
  if (error) throw error;
  return data.user;
}

async function run() {
  const { data: orgExisting } = await supabase.from('organizations').select('id').limit(1).maybeSingle();
  if (orgExisting) {
    console.log('Organization already exists, skipping seed.');
    return;
  }

  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({ name: 'Mini Med Demo' })
    .select('*')
    .single();
  if (orgError) throw orgError;

  const ownerUser = await createUser(demo.owner);
  const adminUser1 = await createUser(demo.admin1);
  const adminUser2 = await createUser(demo.admin2);

  await supabase.from('profiles').upsert([
    { id: ownerUser.id, org_id: org.id, role: 'owner', full_name: demo.owner.full_name },
    { id: adminUser1.id, org_id: org.id, role: 'admin', full_name: demo.admin1.full_name },
    { id: adminUser2.id, org_id: org.id, role: 'admin', full_name: demo.admin2.full_name }
  ]);

  const { data: classRow, error: classError } = await supabase
    .from('classes')
    .insert({ name: 'Cohort A', org_id: org.id })
    .select('*')
    .single();
  if (classError) throw classError;

  await supabase.from('class_admins').insert([
    { class_id: classRow.id, profile_id: adminUser1.id },
    { class_id: classRow.id, profile_id: adminUser2.id }
  ]);

  const students = Array.from({ length: 20 }).map((_, index) => ({
    org_id: org.id,
    full_name: `Student ${index + 1}`,
    badge_token: crypto.randomUUID(),
    external_student_id: `S-${1000 + index}`
  }));

  const { data: studentRows, error: studentError } = await supabase
    .from('students')
    .insert(students)
    .select('id');
  if (studentError) throw studentError;

  await supabase.from('class_students').insert(
    studentRows.map((student) => ({ class_id: classRow.id, student_id: student.id }))
  );

  const { data: sessionRow, error: sessionError } = await supabase
    .from('sessions')
    .insert({
      org_id: org.id,
      class_id: classRow.id,
      title: 'Today session',
      start_time: start,
      end_time: end,
      status: 'open',
      created_by: ownerUser.id
    })
    .select('*')
    .single();
  if (sessionError) throw sessionError;

  console.log('Seed complete.');
  console.log('Owner login:', demo.owner.email, demo.owner.password);
  console.log('Admin1 login:', demo.admin1.email, demo.admin1.password);
  console.log('Admin2 login:', demo.admin2.email, demo.admin2.password);
  console.log('Session id:', sessionRow.id);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
