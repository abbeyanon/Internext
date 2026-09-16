import express from 'express';
import { listTickets, listTicketsForCustomer, findTicketByIdentifier, createTicket, replyToTicket } from '../repositories/ticketsRepo.js';
import { logAudit } from '../repositories/auditLogsRepo.js';
import { requireAuth, requirePermission } from '../middleware/authorize.js';

const router = express.Router();

// Staff-only: full ticket list.
router.get('/', requirePermission('tickets:read'), async (req, res) => {
  const tickets = await listTickets();
  res.json({ success: true, tickets });
});

// Customer: only their own tickets, scoped by the authenticated session.
router.get('/mine', requireAuth, async (req, res) => {
  const tickets = await listTicketsForCustomer(req.user.email);
  res.json({ success: true, tickets });
});

// Public: guests and logged-in customers can both open a support ticket.
router.post('/', async (req, res) => {
  const { customerName, customerEmail, customerPhone, subject, category, message, priority } = req.body;

  const ticket = await createTicket({
    userId: req.user?.id || null,
    customerName: req.user ? req.user.name : customerName,
    customerEmail: req.user ? req.user.email : customerEmail,
    customerPhone: customerPhone || '+254 700 000 000',
    subject, category, priority, message
  });

  await logAudit({
    actorId: req.user?.id || null, actorName: ticket.customerName, action: 'TICKET_CREATED', entity: 'Support',
    entityId: ticket.id, newValue: 'Open', ip: req.ip
  });
  res.status(201).json({ success: true, ticket });
});

router.post('/:id/reply', requirePermission('tickets:respond'), async (req, res) => {
  const { text, sender, status } = req.body;
  const ticket = await replyToTicket(req.params.id, {
    text, senderRole: sender || 'staff', senderId: req.user.id, senderName: req.user.name, status
  });
  if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
  res.json({ success: true, ticket });
});

export default router;
