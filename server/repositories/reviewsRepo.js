import { eq, avg, count } from 'drizzle-orm';
import { db } from '../db/client.js';
import { reviews, products } from '../db/schema.js';

export async function listReviews({ productId } = {}) {
  const query = db.select().from(reviews).orderBy(reviews.createdAt);
  if (productId) return query.where(eq(reviews.productId, productId));
  return query;
}

export async function createReview(data) {
  const [row] = await db.insert(reviews).values(data).returning();
  await recalculateProductRating(data.productId);
  return row;
}

export async function deleteReview(id) {
  const [row] = await db.delete(reviews).where(eq(reviews.id, id)).returning();
  if (row) await recalculateProductRating(row.productId);
  return row || null;
}

async function recalculateProductRating(productId) {
  const [agg] = await db
    .select({ avgRating: avg(reviews.rating), total: count() })
    .from(reviews)
    .where(eq(reviews.productId, productId));

  await db
    .update(products)
    .set({
      rating: agg?.avgRating ? Number(agg.avgRating).toFixed(1) : '0',
      reviewsCount: agg?.total || 0
    })
    .where(eq(products.id, productId));
}
