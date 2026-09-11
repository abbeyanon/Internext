import { describe, it, expect, beforeAll } from 'vitest';

process.env.VERCEL = '1';

const { default: request } = await import('supertest');
const { default: app } = await import('../index.js');

const suffix = Date.now();
const customer = { email: `test-cart-${suffix}@example.com`, password: 'StrongPass1', name: 'Cart Tester' };
let customerCookie;
let productId;
let productSlug;

function extractCookie(res) {
  const raw = res.headers['set-cookie'];
  return Array.isArray(raw) ? raw.map((c) => c.split(';')[0]).join('; ') : undefined;
}

describe('Catalog — non-UUID identifier lookups must not crash', () => {
  beforeAll(async () => {
    const res = await request(app).get('/api/products?limit=1');
    productId = res.body.products[0].id;
    productSlug = res.body.products[0].slug;
  });

  it('finds a product by slug (non-UUID) without a 500', async () => {
    const res = await request(app).get(`/api/products/${productSlug}`);
    expect(res.status).toBe(200);
    expect(res.body.product.slug).toBe(productSlug);
  });

  it('finds a product by UUID id', async () => {
    const res = await request(app).get(`/api/products/${productId}`);
    expect(res.status).toBe(200);
  });

  it('404s (not 500) for a nonexistent slug', async () => {
    const res = await request(app).get('/api/products/this-does-not-exist-anywhere');
    expect(res.status).toBe(404);
  });

  it('lists categories with the product/service kind distinction intact', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    const kinds = new Set(res.body.categories.map((c) => c.kind));
    expect(kinds.has('product')).toBe(true);
    expect(kinds.has('service')).toBe(true);
  });
});

describe('Orders — tracking by order number (non-UUID) must not crash', () => {
  it('404s (not 500) for a nonexistent order number', async () => {
    const res = await request(app).get('/api/orders/ORD-9999-999999');
    expect(res.status).toBe(404);
  });
});

describe('Cart — DB-backed, stock-validated', () => {
  beforeAll(async () => {
    const res = await request(app).post('/api/auth/register').send(customer);
    customerCookie = extractCookie(res);
    const products = await request(app).get('/api/products?limit=1');
    productId = products.body.products[0].id;
  });

  it('requires authentication', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.status).toBe(401);
  });

  it('adds an item and reflects it in the cart', async () => {
    const add = await request(app).post('/api/cart/items').set('Cookie', customerCookie).send({ productId, quantity: 1 });
    expect(add.status).toBe(201);
    expect(add.body.cart.some((i) => i.productId === productId)).toBe(true);
  });

  it('rejects a quantity beyond available stock', async () => {
    const res = await request(app).put('/api/cart/items').set('Cookie', customerCookie).send({ productId, quantity: 999999 });
    expect(res.status).toBe(409);
  });

  it('removes an item via quantity 0', async () => {
    const res = await request(app).put('/api/cart/items').set('Cookie', customerCookie).send({ productId, quantity: 0 });
    expect(res.status).toBe(200);
    expect(res.body.cart.some((i) => i.productId === productId)).toBe(false);
  });
});
