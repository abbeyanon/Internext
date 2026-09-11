import { eq, or, and, ilike, desc, sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { orders, orderItems, orderStatusHistory, products, productVariants, coupons, deliveryZones } from '../db/schema.js';
import { createInvoiceForOrder } from './invoicesRepo.js';
import { createReceiptForPayment } from './receiptsRepo.js';
import { isUuid } from '../db/util.js';

// Postgres errors on `uuid_col = $1` when $1 isn't a valid UUID, even in an
// unmatched OR branch — order numbers ("ORD-2026-000001") are the common
// case (public tracking), so this must never blindly OR against orders.id.
function orderIdentifierCondition(identifier) {
  return isUuid(identifier) ? or(eq(orders.id, identifier), eq(orders.orderNumber, identifier)) : eq(orders.orderNumber, identifier);
}

export class OrderError extends Error {
  constructor(message, status = 400, extra = {}) {
    super(message);
    this.status = status;
    Object.assign(this, extra);
  }
}

function orderNumberFor(seq) {
  const year = new Date().getFullYear();
  return `ORD-${year}-${String(seq).padStart(6, '0')}`;
}

function trackingNumberFor() {
  return `NEX-${Math.floor(100000 + Math.random() * 900000)}`;
}

// Reshapes DB rows into the exact JSON contract the frontend already speaks
// (src/types/index.ts Order) — items[].price not unitPrice, thumbnail not
// thumbnailUrl, customer/deliveryAddress nested objects, timeline[].
async function toApiOrder(orderRow, tx = db) {
  const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderRow.id));
  const history = await tx
    .select()
    .from(orderStatusHistory)
    .where(eq(orderStatusHistory.orderId, orderRow.id))
    .orderBy(orderStatusHistory.createdAt);

  return {
    id: orderRow.id,
    orderNumber: orderRow.orderNumber,
    customer: { name: orderRow.customerName, email: orderRow.customerEmail, phone: orderRow.customerPhone },
    items: items.map((it) => ({
      productId: it.productId,
      variantId: it.variantId,
      name: it.name,
      variantName: it.variantName,
      sku: it.sku,
      price: Number(it.unitPrice),
      quantity: it.quantity,
      thumbnail: it.thumbnailUrl
    })),
    subtotal: Number(orderRow.subtotal),
    discountAmount: Number(orderRow.discountAmount),
    couponCode: orderRow.couponCode,
    deliveryFee: Number(orderRow.deliveryFee),
    taxAmount: Number(orderRow.taxAmount),
    total: Number(orderRow.total),
    currency: orderRow.currency,
    status: orderRow.status,
    paymentStatus: orderRow.paymentStatus,
    paymentMethod: orderRow.paymentMethod,
    paymentReference: orderRow.paymentReference,
    deliveryMethod: orderRow.deliveryMethod,
    deliveryAddress: orderRow.deliveryAddress,
    trackingNumber: orderRow.trackingNumber,
    timeline: history.map((h) => ({ status: h.status, timestamp: h.createdAt, note: h.note })),
    createdAt: orderRow.createdAt,
    userId: orderRow.userId
  };
}

export async function createOrder({ customer, items, couponCode, deliveryZoneId, deliveryAddress, deliveryMethod, paymentMethod, userId }) {
  if (!items || !items.length) {
    throw new OrderError('Order must contain at least 1 item', 400);
  }

  const result = await db.transaction(async (tx) => {
    let subtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const [product] = await tx.select().from(products).where(eq(products.id, item.productId)).limit(1);
      if (!product || !product.isActive) {
        throw new OrderError(`Product ${item.name || item.productId} not found in catalog`, 400);
      }

      let unitPrice = Number(product.price);
      let variantId = null;
      let variantName = null;
      let sku = product.sku;
      let available = product.stock - product.reservedStock;

      if (item.variantId) {
        const [variant] = await tx.select().from(productVariants).where(eq(productVariants.id, item.variantId)).limit(1);
        if (variant) {
          unitPrice = Number(variant.price);
          variantId = variant.id;
          variantName = variant.name;
          sku = variant.sku;
          available = variant.stock;
        }
      }

      if (available < item.quantity) {
        throw new OrderError(`Insufficient stock for ${product.name}. Only ${Math.max(0, available)} available.`, 409, {
          productId: product.id,
          available: Math.max(0, available)
        });
      }

      subtotal += unitPrice * item.quantity;
      verifiedItems.push({
        productId: product.id,
        variantId,
        name: product.name,
        variantName,
        sku,
        unitPrice,
        quantity: item.quantity,
        thumbnailUrl: product.thumbnailUrl
      });
    }

    let deliveryFee = 350;
    if (deliveryZoneId) {
      const [zone] = await tx.select().from(deliveryZones).where(eq(deliveryZones.id, deliveryZoneId)).limit(1);
      if (zone) {
        deliveryFee = zone.freeThreshold && subtotal >= Number(zone.freeThreshold) ? 0 : Number(zone.fee);
      }
    }

    let discountAmount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const [coupon] = await tx.select().from(coupons).where(eq(coupons.code, couponCode.toUpperCase())).limit(1);
      if (coupon && coupon.isActive && subtotal >= Number(coupon.minOrderAmount || 0)) {
        appliedCoupon = coupon.code;
        if (coupon.discountType === 'percentage') {
          discountAmount = (subtotal * Number(coupon.discountValue)) / 100;
          if (coupon.maxDiscountAmount) discountAmount = Math.min(discountAmount, Number(coupon.maxDiscountAmount));
        } else {
          discountAmount = Number(coupon.discountValue);
        }
        await tx.update(coupons).set({ usedCount: sql`${coupons.usedCount} + 1` }).where(eq(coupons.id, coupon.id));
      }
    }

    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxAmount = Math.round((taxableAmount * 16) / 116);
    const total = Math.max(0, taxableAmount + deliveryFee);

    const [{ count: existingCount }] = await tx.select({ count: sql`count(*)::int` }).from(orders);
    const newOrderNumber = orderNumberFor(existingCount + 1);

    const [order] = await tx
      .insert(orders)
      .values({
        orderNumber: newOrderNumber,
        userId: userId || null,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        subtotal: String(subtotal),
        discountAmount: String(discountAmount),
        couponCode: appliedCoupon,
        deliveryFee: String(deliveryFee),
        taxAmount: String(taxAmount),
        total: String(total),
        status: paymentMethod === 'M-Pesa STK Push' ? 'Payment Pending' : 'Processing',
        paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending (Cash On Delivery)' : 'Pending',
        paymentMethod: paymentMethod || 'M-Pesa STK Push',
        deliveryMethod: deliveryMethod || 'Courier Express',
        deliveryAddress: deliveryAddress || {},
        trackingNumber: trackingNumberFor()
      })
      .returning();

    for (const item of verifiedItems) {
      await tx.insert(orderItems).values({
        orderId: order.id,
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        variantName: item.variantName,
        sku: item.sku,
        unitPrice: String(item.unitPrice),
        quantity: item.quantity,
        thumbnailUrl: item.thumbnailUrl
      });
      // Reserve stock now; actual stock is decremented on payment confirmation
      // (confirmPayment) — mirrors the original two-phase reserve/commit flow.
      await tx.update(products).set({ reservedStock: sql`${products.reservedStock} + ${item.quantity}` }).where(eq(products.id, item.productId));
    }

    await tx.insert(orderStatusHistory).values({
      orderId: order.id,
      status: 'Order Placed',
      note: `Order ${newOrderNumber} placed via web portal.`
    });

    // Every order gets an invoice immediately (it documents what's owed);
    // a receipt is only created later, on confirmed payment.
    await createInvoiceForOrder(tx, order);

    return toApiOrder(order, tx);
  });

  return result;
}

export async function findOrderByIdentifier(identifier) {
  const [row] = await db
    .select()
    .from(orders)
    .where(orderIdentifierCondition(identifier))
    .limit(1);
  if (!row) return null;
  return toApiOrder(row);
}

export async function findOrdersForCustomer(email) {
  const rows = await db.select().from(orders).where(ilike(orders.customerEmail, email)).orderBy(desc(orders.createdAt));
  return Promise.all(rows.map((r) => toApiOrder(r)));
}

export async function findOrdersForCustomerOrPhone(query) {
  const digits = query.replace(/\D/g, '');
  const isPhoneQuery = digits.length >= 7;
  const conditions = [ilike(orders.customerEmail, query)];
  if (isPhoneQuery) {
    conditions.push(sql`regexp_replace(${orders.customerPhone}, '\\D', '', 'g') LIKE ${'%' + digits + '%'}`);
  }
  const rows = await db.select().from(orders).where(or(...conditions)).orderBy(desc(orders.createdAt));
  return Promise.all(rows.map((r) => toApiOrder(r)));
}

export async function listOrders({ status, paymentStatus, search } = {}) {
  const conditions = [];
  if (status) conditions.push(eq(orders.status, status));
  if (paymentStatus) conditions.push(eq(orders.paymentStatus, paymentStatus));
  if (search) {
    const q = `%${search}%`;
    conditions.push(or(ilike(orders.orderNumber, q), ilike(orders.customerName, q), ilike(orders.customerEmail, q), ilike(orders.paymentReference, q)));
  }
  const rows = await db
    .select()
    .from(orders)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(orders.createdAt));
  return Promise.all(rows.map((r) => toApiOrder(r)));
}

export async function updateOrderStatus(identifier, { status, note, trackingNumber, paymentStatus, changedByUserId }) {
  return db.transaction(async (tx) => {
    const [order] = await tx
      .select()
      .from(orders)
      .where(orderIdentifierCondition(identifier))
      .limit(1);
    if (!order) return null;

    const oldStatus = order.status;
    const patch = { updatedAt: new Date() };
    if (status) patch.status = status;
    if (paymentStatus) patch.paymentStatus = paymentStatus;
    if (trackingNumber) patch.trackingNumber = trackingNumber;

    const [updated] = await tx.update(orders).set(patch).where(eq(orders.id, order.id)).returning();

    await tx.insert(orderStatusHistory).values({
      orderId: order.id,
      status: status || oldStatus,
      note: note || `Status updated to ${status || oldStatus} by staff`,
      changedBy: changedByUserId || null
    });

    return { order: await toApiOrder(updated, tx), oldStatus };
  });
}

// Called on confirmed payment (M-Pesa callback / manual confirm) — commits
// the reservation into an actual stock decrement.
export async function confirmOrderPayment(identifier, { paymentReference, provider = 'mpesa' } = {}) {
  return db.transaction(async (tx) => {
    const [order] = await tx
      .select()
      .from(orders)
      .where(orderIdentifierCondition(identifier))
      .limit(1);
    if (!order) return null;

    const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    for (const item of items) {
      await tx
        .update(products)
        .set({
          stock: sql`GREATEST(0, ${products.stock} - ${item.quantity})`,
          reservedStock: sql`GREATEST(0, ${products.reservedStock} - ${item.quantity})`
        })
        .where(eq(products.id, item.productId));
      if (item.variantId) {
        await tx.update(productVariants).set({ stock: sql`GREATEST(0, ${productVariants.stock} - ${item.quantity})` }).where(eq(productVariants.id, item.variantId));
      }
    }

    const [updated] = await tx
      .update(orders)
      .set({ paymentStatus: 'Paid', status: 'Processing', paymentReference: paymentReference || order.paymentReference, updatedAt: new Date() })
      .where(eq(orders.id, order.id))
      .returning();

    const { receipt } = await createReceiptForPayment(tx, order, {
      amount: order.total,
      paymentMethod: order.paymentMethod,
      providerReference: paymentReference
    });

    await tx.insert(orderStatusHistory).values({
      orderId: order.id,
      status: 'Payment Confirmed',
      note: `Payment of KES ${Number(order.total).toLocaleString()} confirmed via ${provider}. Receipt: ${receipt.receiptNumber} (Ref: ${paymentReference || 'N/A'})`
    });

    return { order: await toApiOrder(updated, tx), receipt };
  });
}

export { toApiOrder };
