import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { newsletterSubscribers } from '../db/schema.js';

export async function listSubscribers() {
  return db.select().from(newsletterSubscribers);
}

export async function subscribe(email) {
  const [existing] = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.email, email.toLowerCase())).limit(1);
  if (existing) return existing;
  const [row] = await db.insert(newsletterSubscribers).values({ email: email.toLowerCase() }).returning();
  return row;
}
