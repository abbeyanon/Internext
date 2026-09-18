import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { attachUser } from './middleware/session.js';
import { db } from './db/client.js';
import { products, orders } from './db/schema.js';
import { sql } from 'drizzle-orm';

import authRoutes from './routes/authRoutes.js';
import inviteRoutes from './routes/inviteRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import brandRoutes from './routes/brandRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import receiptRoutes from './routes/receiptRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet({
  contentSecurityPolicy: false // frontend is a separate Vite build; CSP tuned when the two are unified for production
}));
app.use(cors({
  origin: process.env.APP_URL || true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(attachUser);

// Request logging middleware
app.use((req, res, next) => {
  if (!req.url.startsWith('/assets') && !req.url.includes('.')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/invites', inviteRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api', invoiceRoutes);
app.use('/api', receiptRoutes);

const uploadsPath = path.join(__dirname, '../uploads');
fs.mkdirSync(uploadsPath, { recursive: true });
app.use('/uploads', express.static(uploadsPath));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const [[{ productsCount }], [{ ordersCount }]] = await Promise.all([
      db.select({ productsCount: sql`count(*)::int` }).from(products),
      db.select({ ordersCount: sql`count(*)::int` }).from(orders)
    ]);
    res.json({
      status: 'ok',
      storeName: 'Internext Business System',
      productsCount,
      ordersCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check database query failed:', error);
    res.status(503).json({
      status: 'unavailable',
      code: 'DATABASE_UNAVAILABLE',
      message: 'The database could not be reached. Check DATABASE_URL and database network access.'
    });
  }
});

// Serve frontend public and dist assets
const publicPath = path.join(__dirname, '../public');
const distPath = path.join(__dirname, '../dist');

app.use(express.static(publicPath));
app.use(express.static(distPath));

// Explicit favicon handler
app.get('/favicon.ico', (req, res) => {
  const iconPath = path.join(publicPath, 'favicon.ico');
  res.sendFile(iconPath, (err) => {
    if (err) res.status(204).end();
  });
});

app.get('/favicon.svg', (req, res) => {
  const svgPath = path.join(publicPath, 'favicon.svg');
  res.sendFile(svgPath, (err) => {
    if (err) res.status(204).end();
  });
});

// Fallback handler for SPA client-side routing
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: "API endpoint not found" });
  }

  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Internext Business System API</title><style>body{font-family:sans-serif;padding:40px;background:#0b132b;color:#fff;text-align:center;}</style></head>
        <body>
          <h1>Internext Business System API Server is Running on Port ${PORT}</h1>
          <p>Please launch the Vite development frontend on <a href="http://localhost:5174" style="color:#38bdf8;">http://localhost:5174</a> or run <code>npm run build</code>.</p>
        </body>
        </html>
      `);
    }
  });
});

if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`Internext Business System API Server is Live on Port ${PORT}`);
    console.log(`Local API: http://localhost:${PORT}/api/health`);
    console.log(`======================================================\n`);
  });
}

export default app;
