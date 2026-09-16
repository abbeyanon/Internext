import { eq, sql } from 'drizzle-orm';
import { invoices } from '../db/schema.js';

function invoiceNumberFor(seq) {
  const year = new Date().getFullYear();
  return `INV-${year}-${String(seq).padStart(6, '0')}`;
}

// Invoice numbers are never client-generated — always derived server-side
// from a DB sequence count, inside the same transaction as order creation.
export async function createInvoiceForOrder(tx, order) {
  const [{ count: existingCount }] = await tx.select({ count: sql`count(*)::int` }).from(invoices);
  const [invoice] = await tx
    .insert(invoices)
    .values({
      invoiceNumber: invoiceNumberFor(existingCount + 1),
      orderId: order.id,
      subtotal: String(order.subtotal),
      discountAmount: String(order.discountAmount),
      taxAmount: String(order.taxAmount),
      deliveryFee: String(order.deliveryFee),
      total: String(order.total),
      status: 'ISSUED'
    })
    .returning();
  return invoice;
}

export async function findInvoiceByOrderId(orderId, database) {
  const [row] = await database.select().from(invoices).where(eq(invoices.orderId, orderId)).limit(1);
  return row || null;
}
