import * as consoleProvider from './consoleProvider.js';

// Provider-agnostic email interface. EMAIL_PROVIDER selects the implementation;
// only "console" (log, no real send) is wired up until real credentials are
// supplied — see .env.example. Templates get a full branded pass in a later
// phase; this is intentionally minimal for now.
const PROVIDERS = {
  console: consoleProvider
};

function getProvider() {
  const key = process.env.EMAIL_PROVIDER || 'console';
  return PROVIDERS[key] || consoleProvider;
}

function layout(bodyHtml) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#0f172a;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-weight:900;font-size:20px;color:#0b3d91;">INTERNEXT BUSINESS SYSTEM</div>
        <div style="font-size:11px;letter-spacing:0.08em;color:#0284c7;text-transform:uppercase;">We Make Technology Happen</div>
      </div>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;">
        ${bodyHtml}
      </div>
      <div style="text-align:center;margin-top:24px;font-size:11px;color:#64748b;">
        Internext Business System &middot; Princely House, 1st Floor, Moi Avenue, Nairobi<br/>
        +254 722 664 457 / +254 726 237 204 &middot; info@internextbusinesssystem.co.ke
      </div>
    </div>
  `;
}

export async function sendEmail({ to, subject, bodyHtml, text }) {
  const provider = getProvider();
  return provider.send({ to, subject, html: layout(bodyHtml), text });
}

export async function sendVerificationEmail(to, verifyUrl) {
  return sendEmail({
    to,
    subject: 'Verify your Internext Business System account',
    bodyHtml: `
      <p>Welcome to Internext Business System.</p>
      <p>Please confirm your email address to activate your account:</p>
      <p><a href="${verifyUrl}" style="color:#0284c7;font-weight:bold;">Verify my email</a></p>
      <p style="font-size:12px;color:#64748b;">This link expires in 24 hours. If you didn't create this account, you can ignore this email.</p>
    `
  });
}

export async function sendPasswordResetEmail(to, resetUrl) {
  return sendEmail({
    to,
    subject: 'Reset your Internext Business System password',
    bodyHtml: `
      <p>We received a request to reset your password.</p>
      <p><a href="${resetUrl}" style="color:#0284c7;font-weight:bold;">Reset my password</a></p>
      <p style="font-size:12px;color:#64748b;">This link expires in 30 minutes. If you didn't request this, you can safely ignore this email — your password will not change.</p>
    `
  });
}

export async function sendSalesManagerInviteEmail(to, acceptUrl) {
  return sendEmail({
    to,
    subject: "You've been invited to join Internext Business System",
    bodyHtml: `
      <p>You've been invited to join Internext Business System as a Sales Manager.</p>
      <p><a href="${acceptUrl}" style="color:#0284c7;font-weight:bold;">Accept invitation &amp; set your password</a></p>
      <p style="font-size:12px;color:#64748b;">This invitation expires in 7 days.</p>
    `
  });
}

function money(amount, currency = 'KES') {
  return `${currency} ${Number(amount).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function itemsTable(order) {
  const rows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:6px 0;border-bottom:1px solid #e2e8f0;">${item.name}${item.variantName ? ` (${item.variantName})` : ''}</td>
        <td style="padding:6px 0;border-bottom:1px solid #e2e8f0;text-align:center;">${item.quantity}</td>
        <td style="padding:6px 0;border-bottom:1px solid #e2e8f0;text-align:right;">${money(item.price * item.quantity, order.currency)}</td>
      </tr>`
    )
    .join('');
  return `
    <table style="width:100%;border-collapse:collapse;font-size:13px;margin:12px 0;">
      <thead>
        <tr style="color:#64748b;text-align:left;font-size:11px;text-transform:uppercase;">
          <th style="padding-bottom:6px;">Item</th>
          <th style="padding-bottom:6px;text-align:center;">Qty</th>
          <th style="padding-bottom:6px;text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

export async function sendOrderConfirmationEmail(order) {
  return sendEmail({
    to: order.customer.email,
    subject: `Order Confirmed — ${order.orderNumber}`,
    bodyHtml: `
      <p>Hi ${order.customer.name},</p>
      <p>Thank you for your order! We've received <strong>${order.orderNumber}</strong> and it's now being prepared.</p>
      ${itemsTable(order)}
      <p style="text-align:right;font-weight:bold;font-size:15px;">Total: ${money(order.total, order.currency)}</p>
      <p style="font-size:12px;color:#64748b;">Payment method: ${order.paymentMethod}. You can track this order any time using your order number.</p>
    `
  });
}

export async function sendPaymentConfirmationEmail(order, receipt) {
  return sendEmail({
    to: order.customer.email,
    subject: `Payment Received — ${order.orderNumber}`,
    bodyHtml: `
      <p>Hi ${order.customer.name},</p>
      <p>We've received your payment of <strong>${money(receipt.amount, order.currency)}</strong> for order <strong>${order.orderNumber}</strong>.</p>
      <p>Receipt number: <strong>${receipt.receiptNumber}</strong></p>
      <p>Your order is now being processed for dispatch.</p>
    `
  });
}

export async function sendOrderStatusUpdateEmail(order, note) {
  return sendEmail({
    to: order.customer.email,
    subject: `Order Update — ${order.orderNumber} is now ${order.status}`,
    bodyHtml: `
      <p>Hi ${order.customer.name},</p>
      <p>Your order <strong>${order.orderNumber}</strong> status has been updated to <strong>${order.status}</strong>.</p>
      ${note ? `<p style="font-size:13px;color:#334155;">${note}</p>` : ''}
      ${order.trackingNumber ? `<p style="font-size:12px;color:#64748b;">Tracking reference: ${order.trackingNumber}</p>` : ''}
    `
  });
}

export async function sendLowStockAlertEmail(to, products) {
  const rows = products.map((p) => `<li>${p.name} (SKU: ${p.sku}) — ${p.stock} unit(s) left</li>`).join('');
  return sendEmail({
    to,
    subject: `Low Stock Alert — ${products.length} item(s) need reordering`,
    bodyHtml: `
      <p>The following items are at or below their reorder level:</p>
      <ul style="font-size:13px;color:#334155;">${rows}</ul>
    `
  });
}
