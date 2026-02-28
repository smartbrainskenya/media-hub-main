import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function seedAdmin() {
  const args = process.argv.slice(2);
  const [email, password, displayName] = args;

  if (!email || !password || !displayName) {
    console.log('Usage: npx tsx scripts/seed-admin.ts <email> <password> <displayName>');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const { data, error } = await db_insert_admin_user(email, passwordHash, displayName);

  if (error) {
    console.error('Error seeding admin user:', error.message);
    process.exit(1);
  }

  console.log('Admin user seeded successfully:', data);
}

async function db_insert_admin_user(email: string, passwordHash: string, displayName: string) {
  return await supabase
    .from('admin_users')
    .insert([
      {
        email,
        password_hash: passwordHash,
        display_name: displayName,
      },
    ])
    .select()
    .single();
}

seedAdmin();
