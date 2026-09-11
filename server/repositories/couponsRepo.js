import { eq, sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { coupons } from '../db/schema.js';

export async function listCoupons() {
  return db.select().from(coupons).orderBy(coupons.code);
}

export async function findCouponByCode(code) {
  const [row] = await db.select().from(coupons).where(eq(coupons.code, code.toUpperCase().trim())).limit(1);
  return row || null;
}

export async function createCoupon(data) {
  const [row] = await db.insert(coupons).values({ ...data, code: data.code.toUpperCase().trim() }).returning();
  return row;
}

export async function deleteCouponByCode(code) {
  const [row] = await db.delete(coupons).where(eq(coupons.code, code.toUpperCase().trim())).returning();
  return row || null;
}

export async function incrementCouponUsage(code) {
  await db.update(coupons).set({ usedCount: sql`${coupons.usedCount} + 1` }).where(eq(coupons.code, code.toUpperCase().trim()));
}
