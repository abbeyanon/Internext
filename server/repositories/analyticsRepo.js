import { eq, sql, inArray, desc } from 'drizzle-orm';
import { db } from '../db/client.js';
import { orders, orderItems, products, categories, users } from '../db/schema.js';
import { toApiOrder } from './ordersRepo.js';
import { listAuditLogs } from './auditLogsRepo.js';

export async function getDashboardAnalytics() {
  const [[{ totalRevenue }], [{ totalOrders }], [{ pendingOrders }], [{ processingOrders }], [{ deliveredOrders }]] = await Promise.all([
    db.select({ totalRevenue: sql`coalesce(sum(${orders.total}), 0)::float` }).from(orders).where(eq(orders.paymentStatus, 'Paid')),
    db.select({ totalOrders: sql`count(*)::int` }).from(orders),
    db.select({ pendingOrders: sql`count(*)::int` }).from(orders).where(inArray(orders.status, ['Pending', 'Payment Pending'])),
    db.select({ processingOrders: sql`count(*)::int` }).from(orders).where(inArray(orders.status, ['Processing', 'Packed'])),
    db.select({ deliveredOrders: sql`count(*)::int` }).from(orders).where(eq(orders.status, 'Delivered'))
  ]);

  const [[{ totalProducts }], [{ outOfStockCount }], [{ totalCustomers }]] = await Promise.all([
    db.select({ totalProducts: sql`count(*)::int` }).from(products).where(eq(products.isActive, true)),
    db.select({ outOfStockCount: sql`count(*)::int` }).from(products).where(sql`${products.stock} = 0 AND ${products.isActive} = true`),
    db.select({ totalCustomers: sql`count(*)::int` }).from(users).where(eq(users.role, 'CUSTOMER'))
  ]);

  const lowStockProducts = await db
    .select()
    .from(products)
    .where(sql`${products.stock} <= ${products.reorderLevel} AND ${products.isActive} = true`)
    .limit(10);

  const categoryRevenueRows = await db
    .select({ category: categories.name, revenue: sql`coalesce(sum(${orderItems.unitPrice} * ${orderItems.quantity}), 0)::float` })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .innerJoin(products, eq(orderItems.productId, products.id))
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(orders.paymentStatus, 'Paid'))
    .groupBy(categories.name);

  const categoryRevenue = Object.fromEntries(categoryRevenueRows.map((r) => [r.category, r.revenue]));

  const recentOrderRows = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(8);
  const recentOrders = await Promise.all(recentOrderRows.map((r) => toApiOrder(r)));
  const recentAuditLogs = await listAuditLogs(10);

  return {
    kpis: {
      totalRevenue, totalOrders, pendingOrders, processingOrders, deliveredOrders,
      totalProducts, lowStockCount: lowStockProducts.length, outOfStockCount, totalCustomers
    },
    lowStockProducts: lowStockProducts.map((p) => ({ ...p, price: Number(p.price), thumbnail: p.thumbnailUrl })),
    categoryRevenue,
    recentOrders,
    recentAuditLogs
  };
}
