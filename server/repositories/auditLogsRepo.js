import { desc } from 'drizzle-orm';
import { db } from '../db/client.js';
import { auditLogs } from '../db/schema.js';

export async function listAuditLogs(limit = 500) {
  return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
}

// The single audit trail for the whole app — every route logs here now
// that the Postgres cutover is complete.
export async function logAudit({ actorId, actorName, action, entity, entityId, previousValue, newValue, ip, userAgent }) {
  await db.insert(auditLogs).values({
    actorId: actorId || null,
    actorName: actorName || null,
    action,
    entity: entity || null,
    entityId: entityId || null,
    previousValue: previousValue != null ? String(previousValue) : null,
    newValue: newValue != null ? String(newValue) : null,
    ip: ip || null,
    userAgent: userAgent || null
  });
}
