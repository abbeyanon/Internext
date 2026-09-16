import { eq, and, isNull } from 'drizzle-orm';
import { db } from '../db/client.js';
import { sessions } from '../db/schema.js';
import { sessionCookieMaxAgeMs } from '../auth/tokens.js';

export async function createSession({ userId, userAgent, ip }) {
  const [row] = await db
    .insert(sessions)
    .values({
      userId,
      userAgent: userAgent || null,
      ip: ip || null,
      expiresAt: new Date(Date.now() + sessionCookieMaxAgeMs())
    })
    .returning();
  return row;
}

export async function getActiveSession(sessionId) {
  const [row] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.id, sessionId), isNull(sessions.revokedAt)))
    .limit(1);
  if (!row) return null;
  if (row.expiresAt < new Date()) return null;
  return row;
}

export async function revokeSession(sessionId) {
  await db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.id, sessionId));
}

export async function revokeAllSessionsForUser(userId) {
  await db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.userId, userId));
}

export async function listActiveSessionsForUser(userId) {
  return db
    .select()
    .from(sessions)
    .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)));
}
