import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Copy .env.example to .env and configure it.');
}

const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });
const db = drizzle(migrationClient);

console.log('Applying migrations to', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@'));
await migrate(db, { migrationsFolder: './server/db/migrations' });
console.log('Migrations applied successfully.');
await migrationClient.end();
