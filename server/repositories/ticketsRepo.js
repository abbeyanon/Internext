import { eq, ilike, desc } from 'drizzle-orm';
import { db } from '../db/client.js';
import { supportTickets, ticketMessages } from '../db/schema.js';

function ticketNumber() {
  return `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
}

async function withMessages(ticket) {
  if (!ticket) return null;
  const messages = await db.select().from(ticketMessages).where(eq(ticketMessages.ticketId, ticket.id)).orderBy(ticketMessages.createdAt);
  return { ...ticket, messages };
}

export async function listTickets() {
  const rows = await db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));
  return Promise.all(rows.map(withMessages));
}

export async function listTicketsForCustomer(email) {
  const rows = await db
    .select()
    .from(supportTickets)
    .where(ilike(supportTickets.customerEmail, email))
    .orderBy(desc(supportTickets.createdAt));
  return Promise.all(rows.map(withMessages));
}

export async function findTicketByIdentifier(identifier) {
  let [row] = await db.select().from(supportTickets).where(eq(supportTickets.ticketNumber, identifier)).limit(1);
  if (!row) {
    [row] = await db.select().from(supportTickets).where(eq(supportTickets.id, identifier)).limit(1);
  }
  return withMessages(row);
}

export async function createTicket({ userId, customerName, customerEmail, customerPhone, subject, category, priority, message }) {
  const [ticket] = await db
    .insert(supportTickets)
    .values({
      ticketNumber: ticketNumber(),
      userId: userId || null,
      customerName,
      customerEmail,
      customerPhone,
      subject,
      category: category || 'General Support',
      priority: priority || 'Normal',
      status: 'Open'
    })
    .returning();

  await db.insert(ticketMessages).values({
    ticketId: ticket.id,
    senderRole: 'customer',
    senderId: userId || null,
    senderName: customerName,
    message
  });

  return withMessages(ticket);
}

export async function replyToTicket(identifier, { text, senderRole, senderId, senderName, status }) {
  const ticket = await findTicketByIdentifier(identifier);
  if (!ticket) return null;

  await db.insert(ticketMessages).values({
    ticketId: ticket.id,
    senderRole: senderRole || 'staff',
    senderId: senderId || null,
    senderName,
    message: text
  });

  if (status) {
    await db.update(supportTickets).set({ status, updatedAt: new Date() }).where(eq(supportTickets.id, ticket.id));
  }

  return findTicketByIdentifier(ticket.id);
}
