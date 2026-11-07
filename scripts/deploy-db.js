const { execSync } = require('child_process');

if (process.env.DATABASE_URL) {
  console.log('🔄 DATABASE_URL detected. Pushing schema to Supabase database...');
  try {
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('✅ Supabase database schema synchronized successfully!');
  } catch (error) {
    console.error('❌ Failed to push schema to Supabase:', error);
    process.exit(1);
  }
} else {
  console.log('ℹ️ No DATABASE_URL found. Skipping db push.');
}
