import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initialData } from './seedData.js';
import { products, blogPosts, reviews, sampleOrders, auditLogs, supportTickets } from './productsData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

let dbMemory = null;

export function getDb() {
  if (dbMemory) return dbMemory;

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      dbMemory = JSON.parse(content);
      return dbMemory;
    } catch (e) {
      console.error("Error reading db.json, re-initializing:", e);
    }
  }

  // Initialize fresh DB from seed files
  dbMemory = {
    settings: initialData.settings,
    deliveryZones: initialData.deliveryZones,
    stores: initialData.stores,
    categories: initialData.categories,
    brands: initialData.brands,
    coupons: initialData.coupons,
    users: initialData.users,
    products: products,
    blogPosts: blogPosts,
    reviews: reviews,
    orders: sampleOrders,
    auditLogs: auditLogs,
    supportTickets: supportTickets,
    newsletterSubscribers: [
      { email: "dennis.mwangi@gmail.com", subscribedAt: "2026-08-01T10:00:00Z" },
      { email: "mercy.chebet@outlook.com", subscribedAt: "2026-08-15T14:30:00Z" }
    ]
  };

  saveDb();
  return dbMemory;
}

export function saveDb() {
  if (!dbMemory) return;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbMemory, null, 2), 'utf-8');
  } catch (e) {
    console.error("Failed to write db.json:", e);
  }
}

export function addAuditLog(userId, userName, action, entity, record, previousValue, newValue, ip = "127.0.0.1") {
  const db = getDb();
  const log = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    userName,
    action,
    entity,
    record,
    previousValue: String(previousValue || "N/A"),
    newValue: String(newValue || "N/A"),
    ip,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(log);
  if (db.auditLogs.length > 500) db.auditLogs.pop();
  saveDb();
  return log;
}

export function generateOrderNumber() {
  const db = getDb();
  const year = new Date().getFullYear();
  const nextNum = (db.orders.length + 1).toString().padStart(6, '0');
  return `ORD-${year}-${nextNum}`;
}
