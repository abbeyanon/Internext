import express from 'express';
import {
  createOrder, findOrderByIdentifier, findOrdersForCustomer, findOrdersForCustomerOrPhone,
  listOrders, updateOrderStatus, OrderError
} from '../repositories/ordersRepo.js';
import { logAudit } from '../repositories/auditLogsRepo.js';
import { MpesaService } from '../services/mpesaService.js';
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from '../services/email/index.js';
import { requireAuth, requirePermission } from '../middleware/authorize.js';

const router = express.Router();

const STAFF_ROLES = ['ADMIN', 'SALES_MANAGER'];

function redactOrderForPublic(order) {
  // Order tracking by order number is intentionally public (customers track
  // parcels without logging in), but full customer PII should only be
  // visible to the order's owner or staff, not anyone who guesses a number.
  return {
    ...order,
    customer: { name: order.customer.name },
    deliveryAddress: { county: order.deliveryAddress?.county, town: order.deliveryAddress?.town }
  };
}

// 1. Create New Order (Server-Side Price & Tax Validation, real DB transaction)
router.post('/', requireAuth, async (req, res) => {
  const { customer, items, couponCode, deliveryZoneId, deliveryAddress, deliveryMethod, paymentMethod } = req.body;

  try {
    const order = await createOrder({
      customer, items, couponCode, deliveryZoneId, deliveryAddress, deliveryMethod, paymentMethod,
      userId: req.user?.id || null
    });

    await logAudit({
      actorId: req.user?.id || null, actorName: customer?.name || 'Customer', action: 'ORDER_CREATED', entity: 'Order',
      entityId: order.id, newValue: `Total: KES ${order.total.toLocaleString()} (${order.paymentMethod})`, ip: req.ip
    });

    sendOrderConfirmationEmail(order).catch((e) => console.error('Failed to send order confirmation email:', e));

    res.status(201).json({ success: true, order });
  } catch (err) {
    if (err instanceof OrderError) {
      return res.status(err.status).json({ success: false, message: err.message, productId: err.productId, available: err.available });
    }
    throw err;
  }
});

// 2. M-Pesa STK Push Trigger
router.post('/:id/mpesa-stk', requireAuth, async (req, res) => {
  try {
    const { phone } = req.body;
    const order = await findOrderByIdentifier(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const stkResult = await MpesaService.initiateStkPush({
      orderId: order.id, orderNumber: order.orderNumber, phone: phone || order.customer.phone, amount: order.total
    });
    res.json(stkResult);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. M-Pesa Payment Verification / Simulation Confirmation
router.post('/:id/mpesa-verify', requireAuth, async (req, res) => {
  try {
    const { checkoutRequestId, mpesaReceipt } = req.body;
    const verifyResult = await MpesaService.verifyPayment({ orderId: req.params.id, checkoutRequestId, mpesaReceipt });
    if (!verifyResult.success) {
      return res.status(400).json(verifyResult);
    }
    res.json(verifyResult);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. Get Order by Order Number or ID — public for tracking, but only the
// order's owner or staff sees full customer details.
router.get('/:identifier', async (req, res) => {
  const order = await findOrderByIdentifier(req.params.identifier);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const isOwner = req.user && req.user.email && order.customer.email &&
    req.user.email.toLowerCase() === order.customer.email.toLowerCase();
  const isStaff = req.user && STAFF_ROLES.includes(req.user.role);

  res.json({ success: true, order: (isOwner || isStaff) ? order : redactOrderForPublic(order) });
});

// 5. Get Customer's Own Orders — scoped to the authenticated session.
// Staff may look up any customer by email/phone via the URL param.
router.get('/customer/:query', requireAuth, async (req, res) => {
  const isStaff = STAFF_ROLES.includes(req.user.role);
  const orders = isStaff
    ? await findOrdersForCustomerOrPhone(req.params.query)
    : await findOrdersForCustomer(req.user.email);
  res.json({ success: true, orders });
});

// 6. Admin/Sales Manager: List All Orders with Filters
router.get('/', requirePermission('orders:read'), async (req, res) => {
  const orders = await listOrders(req.query);
  res.json({ success: true, orders, total: orders.length });
});

// 7. Admin/Sales Manager: Update Order Status & Fulfillment Timeline
router.put('/:id/status', requirePermission('orders:update_status'), async (req, res) => {
  const { status, note, trackingNumber, paymentStatus } = req.body;
  const result = await updateOrderStatus(req.params.id, { status, note, trackingNumber, paymentStatus, changedByUserId: req.user.id });
  if (!result) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  await logAudit({
    actorId: req.user.id, actorName: req.user.name, action: 'ORDER_STATUS_UPDATE', entity: 'Order',
    entityId: result.order.id, previousValue: result.oldStatus, newValue: status || result.oldStatus, ip: req.ip
  });

  if (status && status !== result.oldStatus) {
    sendOrderStatusUpdateEmail(result.order, note).catch((e) => console.error('Failed to send order status email:', e));
  }

  res.json({ success: true, order: result.order });
});

export default router;
