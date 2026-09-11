import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema.js';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Copy .env.example to .env and configure it.');
}

// Reuse a single connection pool across hot-reloads / serverless warm invocations
// instead of opening a new one per import.
const globalForDb = globalThis;

const queryClient =
  globalForDb.__ibsPgClient ??
  postgres(process.env.DATABASE_URL, {
    max: process.env.VERCEL ? 1 : 5,
    idle_timeout: 20,
    connect_timeout: 10
  });

if (!globalForDb.__ibsPgClient) {
  globalForDb.__ibsPgClient = queryClient;
}

export const db = drizzle(queryClient, { schema });
export const rawSql = queryClient;
