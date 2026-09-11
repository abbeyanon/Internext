import { findOrderByIdentifier, confirmOrderPayment } from '../repositories/ordersRepo.js';
import { getProductById } from '../repositories/catalogRepo.js';
import { getCompanyProfile } from '../repositories/companyProfileRepo.js';
import { logAudit } from '../repositories/auditLogsRepo.js';
import { sendPaymentConfirmationEmail, sendLowStockAlertEmail } from './email/index.js';

async function checkAndAlertLowStock(order) {
  const lowStockProducts = [];
  for (const item of order.items) {
    const product = await getProductById(item.productId);
    if (product && product.stock <= product.reorderLevel) {
      lowStockProducts.push(product);
    }
  }
  if (!lowStockProducts.length) return;

  const company = await getCompanyProfile();
  const alertRecipient = company?.email;
  if (alertRecipient) {
    sendLowStockAlertEmail(alertRecipient, lowStockProducts).catch((e) => console.error('Failed to send low-stock alert:', e));
  }
}

/**
 * Service to simulate and handle Safaricom Daraja M-Pesa Express (STK Push).
 * Real Daraja credentials (MPESA_CONSUMER_KEY/SECRET/PASSKEY) are read from
 * env when going live — see .env.example. Currently simulated end-to-end.
 */
export class MpesaService {
  static async initiateStkPush({ orderId, orderNumber, phone, amount }) {
    const order = await findOrderByIdentifier(orderId || orderNumber);
    if (!order) {
      throw new Error('Order not found');
    }

    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith('7') || formattedPhone.startsWith('1')) {
      formattedPhone = '254' + formattedPhone;
    }

    const checkoutRequestId = `ws_CO_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const merchantRequestId = `MR_${Math.floor(Math.random() * 1000000)}`;
    const mpesaReceipt = `QKD${Math.floor(100000 + Math.random() * 900000)}XLP`;

    // Stash the simulated checkout reference on the order via a status-history
    // note (payments table entry happens at confirmation) so verifyPayment
    // can look it up either by orderId or by this checkoutRequestId.
    pendingCheckouts.set(checkoutRequestId, { orderId: order.id, mpesaReceipt });

    return {
      success: true,
      ResponseCode: '0',
      ResponseDescription: 'Success. Request accepted for processing',
      MerchantRequestID: merchantRequestId,
      CheckoutRequestID: checkoutRequestId,
      CustomerMessage: `An M-Pesa prompt has been sent to ${formattedPhone}. Please enter your M-Pesa PIN on your phone to complete payment of KES ${amount.toLocaleString()}.`,
      mpesaReceipt
    };
  }

  static async verifyPayment({ orderId, checkoutRequestId, mpesaReceipt }) {
    let resolvedOrderId = orderId;
    let receipt = mpesaReceipt;

    if (checkoutRequestId && pendingCheckouts.has(checkoutRequestId)) {
      const pending = pendingCheckouts.get(checkoutRequestId);
      resolvedOrderId = resolvedOrderId || pending.orderId;
      receipt = receipt || pending.mpesaReceipt;
      pendingCheckouts.delete(checkoutRequestId);
    }

    const result = await confirmOrderPayment(resolvedOrderId, { paymentReference: receipt, provider: 'mpesa' });
    if (!result) {
      return { success: false, message: 'Order not found' };
    }
    const { order, receipt: receiptRecord } = result;

    await logAudit({
      actorName: order.customer.name, action: 'PAYMENT_CONFIRMED', entity: 'Order',
      entityId: order.id, previousValue: 'Pending', newValue: `Paid via M-Pesa (${order.paymentReference})`
    });

    sendPaymentConfirmationEmail(order, receiptRecord).catch((e) => console.error('Failed to send payment confirmation email:', e));
    checkAndAlertLowStock(order).catch((e) => console.error('Failed to check/send low-stock alert:', e));

    return { success: true, message: 'Payment successfully verified and confirmed!', order };
  }
}

// In-memory map of simulated STK checkout references to order ids — fine
// for a single-process dev/demo simulation; a real Daraja integration would
// persist this (or not need it, since Daraja's callback carries the order
// reference in AccountReference).
const pendingCheckouts = new Map();
