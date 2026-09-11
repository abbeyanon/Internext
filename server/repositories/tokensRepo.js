import { eq, and, isNull } from 'drizzle-orm';
import { db } from '../db/client.js';
import { emailVerificationTokens, passwordResetTokens } from '../db/schema.js';

const TABLES = {
  verify: emailVerificationTokens,
  reset: passwordResetTokens
};

export async function createToken(kind, { userId, tokenHash, ttlMs }) {
  const table = TABLES[kind];
  const [row] = await db
    .insert(table)
    .values({ userId, tokenHash, expiresAt: new Date(Date.now() + ttlMs) })
    .returning();
  return row;
}

export async function consumeToken(kind, tokenHash) {
  const table = TABLES[kind];
  const [row] = await db
    .select()
    .from(table)
    .where(and(eq(table.tokenHash, tokenHash), isNull(table.usedAt)))
    .limit(1);

  if (!row) return null;
  if (row.expiresAt < new Date()) return null;

  await db.update(table).set({ usedAt: new Date() }).where(eq(table.id, row.id));
  return row;
}
