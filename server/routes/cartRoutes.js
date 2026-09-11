import express from 'express';
import { getCart, addCartItem, updateCartItemQuantity, removeCartItem, clearCart, mergeGuestCart, CartError } from '../repositories/cartsRepo.js';
import { requireAuth } from '../middleware/authorize.js';

const router = express.Router();

// Cart is DB-backed for authenticated users only — guests keep the existing
// localStorage cart (src/context/CartContext.tsx) and merge into this on login.
router.use(requireAuth);

router.get('/', async (req, res) => {
  const cart = await getCart(req.user.id);
  res.json({ success: true, cart });
});

router.post('/items', async (req, res) => {
  try {
    const cart = await addCartItem(req.user.id, req.body);
    res.status(201).json({ success: true, cart });
  } catch (err) {
    if (err instanceof CartError) return res.status(err.status).json({ success: false, message: err.message, available: err.available });
    throw err;
  }
});

router.put('/items', async (req, res) => {
  try {
    const cart = await updateCartItemQuantity(req.user.id, req.body);
    res.json({ success: true, cart });
  } catch (err) {
    if (err instanceof CartError) return res.status(err.status).json({ success: false, message: err.message, available: err.available });
    throw err;
  }
});

router.delete('/items', async (req, res) => {
  const cart = await removeCartItem(req.user.id, req.body);
  res.json({ success: true, cart });
});

router.delete('/', async (req, res) => {
  await clearCart(req.user.id);
  res.json({ success: true, cart: [] });
});

router.post('/merge', async (req, res) => {
  const cart = await mergeGuestCart(req.user.id, req.body.items || []);
  res.json({ success: true, cart });
});

export default router;
