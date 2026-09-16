import PDFDocument from 'pdfkit';

const BRAND_COLOR = '#0b3d91';
const MUTED_COLOR = '#64748b';
const BORDER_COLOR = '#e2e8f0';

function money(amount, currency = 'KES') {
  return `${currency} ${Number(amount).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Receipts only exist for confirmed payments (see server/repositories/receiptsRepo.js) —
// this renderer never claims payment was received on its own.
export function streamReceiptPdf(res, { order, receipt, company }) {
  const doc = new PDFDocument({ size: 'A5', margin: 36 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${receipt.receiptNumber}.pdf"`);
  doc.pipe(res);

  doc.fontSize(16).fillColor(BRAND_COLOR).font('Helvetica-Bold').text(company?.name || 'Internext Business System', { align: 'center' });
  doc.fontSize(8).fillColor(MUTED_COLOR).font('Helvetica').text((company?.tagline || 'We Make Technology Happen').toUpperCase(), { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(7.5).fillColor('#334155').text(company?.address || 'Princely House, 1st Floor, Moi Avenue, Nairobi', { align: 'center' });
  doc.text(`Tel: ${company?.phonePrimary || '+254 722 664 457'} / ${company?.phoneSecondary || '+254 726 237 204'}`, { align: 'center' });

  doc.moveDown(1);
  doc.moveTo(36, doc.y).lineTo(doc.page.width - 36, doc.y).strokeColor(BORDER_COLOR).stroke();
  doc.moveDown(0.8);

  doc.fontSize(13).fillColor('#0f172a').font('Helvetica-Bold').text('PAYMENT RECEIPT', { align: 'center' });
  doc.moveDown(0.6);

  doc.fontSize(9).font('Helvetica').fillColor('#334155');
  const row = (label, value) => {
    doc.text(label, { continued: true, width: 200 });
    doc.font('Helvetica-Bold').fillColor('#0f172a').text(`  ${value}`, { align: 'right' });
    doc.font('Helvetica').fillColor('#334155');
  };

  row('Receipt No:', receipt.receiptNumber);
  row('Date:', new Date(receipt.issuedAt).toLocaleString('en-KE'));
  row('Order Ref:', order.orderNumber);
  row('Customer:', order.customer.name);
  row('Payment Method:', receipt.paymentMethod || order.paymentMethod || 'M-Pesa');
  if (order.paymentReference) row('Transaction Ref:', order.paymentReference);

  doc.moveDown(0.8);
  doc.moveTo(36, doc.y).lineTo(doc.page.width - 36, doc.y).strokeColor(BORDER_COLOR).stroke();
  doc.moveDown(0.8);

  doc.fontSize(11).font('Helvetica-Bold').fillColor(BRAND_COLOR).text('Amount Paid:', { continued: true });
  doc.text(`  ${money(receipt.amount, order.currency)}`, { align: 'right' });

  doc.moveDown(1.5);
  doc.fontSize(9).font('Helvetica-Oblique').fillColor('#0f172a').text('Thank you for your business!', { align: 'center' });

  doc.end();
}
