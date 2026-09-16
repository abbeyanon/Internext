import { describe, it, expect, beforeAll } from 'vitest';

// Prevent server/index.js from calling app.listen() — supertest spins up its
// own ephemeral listener per request against the exported app.
process.env.VERCEL = '1';

const { default: request } = await import('supertest');
const { default: app } = await import('../index.js');

const suffix = Date.now();
const admin = { email: `test-admin-${suffix}@internextbusinesssystem.co.ke`, password: 'AdminPass123', name: 'Test Admin' };
const customer = { email: `test-customer-${suffix}@example.com`, password: 'StrongPass1', name: 'Test Customer' };

let adminCookie;
let customerCookie;

function extractCookie(res) {
  const raw = res.headers['set-cookie'];
  return Array.isArray(raw) ? raw.map((c) => c.split(';')[0]).join('; ') : undefined;
}

describe('Authentication', () => {
  it('registers a customer and never allows a client-supplied role to take effect', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...customer, role: 'ADMIN' }); // attempted privilege escalation via extra field

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('CUSTOMER');
    expect(res.body.user.passwordHash).toBeUndefined();
    customerCookie = extractCookie(res);
  });

  it('rejects weak passwords server-side', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'X', email: `weak-${suffix}@example.com`, password: 'weak' });
    expect(res.status).toBe(400);
  });

  it('rejects the historical exploit: login with an arbitrary role in the body', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: customer.email, password: customer.password, role: 'super_admin' });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('CUSTOMER');
  });

  it('rejects invalid credentials with a generic message (no user enumeration)', async () => {
    const known = await request(app).post('/api/auth/login').send({ email: customer.email, password: 'WrongPassword1' });
    const unknown = await request(app).post('/api/auth/login').send({ email: `nobody-${suffix}@example.com`, password: 'WrongPassword1' });
    expect(known.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(known.body.message).toBe(unknown.body.message);
  });
});

describe('RBAC — backend enforcement (not just UI hiding)', () => {
  beforeAll(async () => {
    // Bootstrap-equivalent: insert an ADMIN directly via the repository used
    // by the CLI script, since admin creation must never be an HTTP endpoint.
    const { hashPassword } = await import('../auth/passwords.js');
    const { createUser, findUserByEmail } = await import('../repositories/usersRepo.js');
    const existing = await findUserByEmail(admin.email);
    if (!existing) {
      const passwordHash = await hashPassword(admin.password);
      await createUser({ name: admin.name, email: admin.email, passwordHash, role: 'ADMIN' });
    }
    const res = await request(app).post('/api/auth/login').send({ email: admin.email, password: admin.password });
    adminCookie = extractCookie(res);
  });

  it('blocks unauthenticated access to admin endpoints', async () => {
    const res = await request(app).get('/api/admin/analytics');
    expect(res.status).toBe(401);
  });

  it('blocks a CUSTOMER from admin endpoints', async () => {
    const res = await request(app).get('/api/admin/analytics').set('Cookie', customerCookie);
    expect(res.status).toBe(403);
  });

  it('allows ADMIN access to admin endpoints', async () => {
    const res = await request(app).get('/api/admin/analytics').set('Cookie', adminCookie);
    expect(res.status).toBe(200);
  });

  it('blocks a CUSTOMER from creating products', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Cookie', customerCookie)
      .send({ name: 'Should Not Exist', price: 100, stock: 1, sku: `x-${suffix}` });
    expect(res.status).toBe(403);
  });

  it('never exposes M-Pesa secrets on the public settings endpoint', async () => {
    const res = await request(app).get('/api/admin/settings/public');
    expect(res.status).toBe(200);
    expect(res.body.settings.mpesaConsumerKey).toBeUndefined();
    expect(res.body.settings.mpesaConsumerSecret).toBeUndefined();
    expect(res.body.settings.mpesaPasskey).toBeUndefined();
  });

  it('blocks a CUSTOMER from creating a sales-manager invite', async () => {
    const res = await request(app)
      .post('/api/admin/invites')
      .set('Cookie', customerCookie)
      .send({ email: `nobody-${suffix}@example.com` });
    expect(res.status).toBe(403);
  });
});

describe('IDOR protections', () => {
  it('scopes /api/orders/customer/:query to the authenticated customer regardless of the URL param', async () => {
    const res = await request(app)
      .get('/api/orders/customer/someone-elses-email@example.com')
      .set('Cookie', customerCookie);
    expect(res.status).toBe(200);
    // Every returned order (if any) must belong to this customer, never "someone else's".
    for (const order of res.body.orders) {
      expect(order.customer.email.toLowerCase()).toBe(customer.email.toLowerCase());
    }
  });

  it('redacts customer PII on the public order-tracking endpoint for non-owners', async () => {
    const res = await request(app).get('/api/orders/ORD-2026-000101');
    if (res.status === 200) {
      expect(res.body.order.customer.email).toBeUndefined();
      expect(res.body.order.customer.phone).toBeUndefined();
    }
  });

  it('blocks unauthenticated access to the full support ticket list', async () => {
    const res = await request(app).get('/api/tickets');
    expect(res.status).toBe(401);
  });
});
