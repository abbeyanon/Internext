import express from 'express';
import { listReviews, createReview, deleteReview } from '../repositories/reviewsRepo.js';
import { logAudit } from '../repositories/auditLogsRepo.js';
import { requirePermission } from '../middleware/authorize.js';

const router = express.Router();

// Get reviews (with optional productId filter)
router.get('/', async (req, res) => {
  const { productId } = req.query;
  const reviews = await listReviews({ productId });
  res.json({ success: true, reviews: reviews.map((r) => ({ ...r, date: r.createdAt })) });
});

// Submit review — must be signed in; author identity comes from the session,
// not the request body, and "verified purchase" is never just asserted by
// the client (order-linked verification is a later enhancement — defaults
// to false rather than the previous always-true placeholder).
router.post('/', requirePermission('reviews:create'), async (req, res) => {
  const { productId, userCity, rating, title, comment } = req.body;

  const review = await createReview({
    productId,
    userId: req.user.id,
    userName: req.user.name,
    userCity: userCity || 'Nairobi',
    rating: Number(rating) || 5,
    title,
    comment,
    verifiedPurchase: false
  });

  res.status(201).json({ success: true, review: { ...review, date: review.createdAt } });
});

// Staff moderation: remove a review.
router.delete('/:id', requirePermission('reviews:moderate'), async (req, res) => {
  const deleted = await deleteReview(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Review not found' });
  }
  await logAudit({ actorId: req.user.id, actorName: req.user.name, action: 'REVIEW_MODERATED_DELETE', entity: 'Review', entityId: deleted.id, previousValue: deleted.comment, newValue: 'Deleted', ip: req.ip });
  res.json({ success: true, message: 'Review removed' });
});

export default router;
