import { eq, and, isNull } from 'drizzle-orm';
import { db } from '../db/client.js';
import { invites } from '../db/schema.js';

const INVITE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export async function createInvite({ email, invitedBy, tokenHash }) {
  const [row] = await db
    .insert(invites)
    .values({
      email: email.toLowerCase(),
      role: 'SALES_MANAGER',
      tokenHash,
      invitedBy,
      expiresAt: new Date(Date.now() + INVITE_TTL_MS)
    })
    .returning();
  return row;
}

export async function findInviteByTokenHash(tokenHash) {
  const [row] = await db
    .select()
    .from(invites)
    .where(and(eq(invites.tokenHash, tokenHash), isNull(invites.acceptedAt), isNull(invites.revokedAt)))
    .limit(1);
  if (!row) return null;
  if (row.expiresAt < new Date()) return null;
  return row;
}

export async function markInviteAccepted(id) {
  await db.update(invites).set({ acceptedAt: new Date() }).where(eq(invites.id, id));
}

export async function revokeInvite(id) {
  await db.update(invites).set({ revokedAt: new Date() }).where(eq(invites.id, id));
}

export async function listInvites() {
  return db.select().from(invites);
}
