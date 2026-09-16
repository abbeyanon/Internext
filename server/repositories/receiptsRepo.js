import { eq, sql } from 'drizzle-orm';
import { receipts, payments } from '../db/schema.js';

function receiptNumberFor(seq) {
  const year = new Date().getFullYear();
  return `RCT-${year}-${String(seq).padStart(6, '0')}`;
}

// Receipts are only ever created here — i.e. only when a payment is actually
// confirmed (see ordersRepo.confirmOrderPayment). Creating an order never
// implies payment was received.
export async function createReceiptForPayment(tx, order, { amount, paymentMethod, providerReference, rawPayload }) {
  const [payment] = await tx
    .insert(payments)
    .values({
      orderId: order.id,
      provider: paymentMethod || 'mpesa',
      amount: String(amount),
      status: 'COMPLETED',
      providerReference,
      rawPayload: rawPayload || null
    })
    .returning();

  const [{ count: existingCount }] = await tx.select({ count: sql`count(*)::int` }).from(receipts);
  const [receipt] = await tx
    .insert(receipts)
    .values({
      receiptNumber: receiptNumberFor(existingCount + 1),
      orderId: order.id,
      paymentId: payment.id,
      amount: String(amount),
      paymentMethod: paymentMethod || 'M-Pesa'
    })
    .returning();

  return { receipt, payment };
}

export async function findReceiptByOrderId(orderId, database) {
  const [row] = await database.select().from(receipts).where(eq(receipts.orderId, orderId)).limit(1);
  return row || null;
}
