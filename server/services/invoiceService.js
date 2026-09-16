import PDFDocument from 'pdfkit';

const BRAND_COLOR = '#0b3d91';
const MUTED_COLOR = '#64748b';
const BORDER_COLOR = '#e2e8f0';

function money(amount, currency = 'KES') {
  return `${currency} ${Number(amount).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function drawHeader(doc, company, title, docNumber, dateLabel, date) {
  doc.fontSize(18).fillColor(BRAND_COLOR).font('Helvetica-Bold').text(company?.name || 'Internext Business System', 40, 40);
  doc.fontSize(9).fillColor(MUTED_COLOR).font('Helvetica').text((company?.tagline || 'We Make Technology Happen').toUpperCase(), 40, 62);

  doc.fontSize(8.5).fillColor('#334155')
    .text(company?.address || 'Princely House, 1st Floor, Moi Avenue, Nairobi', 40, 80)
    .text(company?.poBox || 'P.O. Box 16806-00100, Nairobi, Kenya', 40, 92)
    .text(`Tel: ${company?.phonePrimary || '+254 722 664 457'} / ${company?.phoneSecondary || '+254 726 237 204'}`, 40, 104)
    .text(`Email: ${company?.email || 'info@internextbusinesssystem.co.ke'}`, 40, 116);

  doc.fontSize(20).fillColor('#0f172a').font('Helvetica-Bold').text(title, 350, 40, { width: 205, align: 'right' });
  doc.fontSize(9).fillColor(MUTED_COLOR).font('Helvetica')
    .text(`${title.replace(/\s.*/, '')} #: ${docNumber}`, 350, 68, { width: 205, align: 'right' })
    .text(`${dateLabel}: ${new Date(date).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}`, 350, 82, { width: 205, align: 'right' });

  doc.moveTo(40, 135).lineTo(555, 135).strokeColor(BORDER_COLOR).stroke();
}

function drawItemsTable(doc, items, startY, currency) {
  let y = startY;
  const colX = { name: 40, qty: 350, price: 400, total: 480 };

  doc.font('Helvetica-Bold').fontSize(9).fillColor('#334155');
  doc.text('Item', colX.name, y);
  doc.text('Qty', colX.qty, y, { width: 40, align: 'right' });
  doc.text('Unit Price', colX.price, y, { width: 70, align: 'right' });
  doc.text('Total', colX.total, y, { width: 75, align: 'right' });
  y += 16;
  doc.moveTo(40, y).lineTo(555, y).strokeColor(BORDER_COLOR).stroke();
  y += 8;

  doc.font('Helvetica').fontSize(9).fillColor('#0f172a');
  for (const item of items) {
    const lineTotal = item.price * item.quantity;
    const label = item.variantName ? `${item.name} (${item.variantName})` : item.name;
    doc.text(label, colX.name, y, { width: 300 });
    doc.text(String(item.quantity), colX.qty, y, { width: 40, align: 'right' });
    doc.text(money(item.price, currency), colX.price, y, { width: 70, align: 'right' });
    doc.text(money(lineTotal, currency), colX.total, y, { width: 75, align: 'right' });
    y += 20;
  }
  doc.moveTo(40, y).lineTo(555, y).strokeColor(BORDER_COLOR).stroke();
  return y + 10;
}

function drawTotals(doc, order, startY) {
  let y = startY;
  const rows = [
    ['Subtotal', order.subtotal],
    ...(order.discountAmount > 0 ? [[`Discount${order.couponCode ? ` (${order.couponCode})` : ''}`, -order.discountAmount]] : []),
    ['VAT (16%, inclusive)', order.taxAmount],
    ['Delivery Fee', order.deliveryFee]
  ];

  doc.font('Helvetica').fontSize(9).fillColor('#334155');
  for (const [label, value] of rows) {
    doc.text(label, 350, y, { width: 120 });
    doc.text(money(value, order.currency), 480, y, { width: 75, align: 'right' });
    y += 16;
  }

  doc.moveTo(350, y).lineTo(555, y).strokeColor(BORDER_COLOR).stroke();
  y += 8;
  doc.font('Helvetica-Bold').fontSize(11).fillColor(BRAND_COLOR);
  doc.text('Grand Total', 350, y, { width: 120 });
  doc.text(money(order.total, order.currency), 480, y, { width: 75, align: 'right' });
  return y + 30;
}

export function streamInvoicePdf(res, { order, invoice, company }) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${invoice.invoiceNumber}.pdf"`);
  doc.pipe(res);

  drawHeader(doc, company, 'TAX INVOICE', invoice.invoiceNumber, 'Date', invoice.issuedAt);

  doc.font('Helvetica-Bold').fontSize(9).fillColor('#334155').text('Bill To:', 40, 150);
  doc.font('Helvetica').fontSize(9).fillColor('#0f172a')
    .text(order.customer.name, 40, 164)
    .text(order.customer.email || '', 40, 176)
    .text(order.customer.phone || '', 40, 188);

  doc.font('Helvetica-Bold').fontSize(9).fillColor('#334155').text('Order Reference:', 350, 150, { width: 205, align: 'right' });
  doc.font('Helvetica').fontSize(9).fillColor('#0f172a').text(order.orderNumber, 350, 164, { width: 205, align: 'right' });
  doc.text(`Status: ${order.status} / ${order.paymentStatus}`, 350, 176, { width: 205, align: 'right' });

  let y = drawItemsTable(doc, order.items, 215, order.currency);
  y = drawTotals(doc, order, y);

  doc.font('Helvetica').fontSize(8).fillColor(MUTED_COLOR)
    .text('This is a computer-generated tax invoice. Prices are inclusive of 16% VAT where applicable.', 40, y, { width: 515, align: 'center' });

  doc.end();
}
