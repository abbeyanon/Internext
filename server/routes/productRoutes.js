import express from 'express';
import {
  searchProductSuggestions,
  listProducts,
  findProductByIdentifier,
  findRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById
} from '../repositories/catalogRepo.js';
import { listReviews } from '../repositories/reviewsRepo.js';
import { logAudit } from '../repositories/auditLogsRepo.js';
import { requirePermission } from '../middleware/authorize.js';

const router = express.Router();

// 1. Live Predictive Search & Autocomplete
router.get('/search/suggestions', async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length === 0) {
    return res.json({ suggestions: [], popular: ['Brand New Laptops', 'Ex-UK Laptops', 'CCTV Kit', 'Network Switch', 'Screen Replacement'] });
  }
  const matchedProducts = await searchProductSuggestions(q.trim());
  res.json({ query: q.trim(), products: matchedProducts, categories: [], totalMatches: matchedProducts.length });
});

// 2. Main Product Catalog with Multi-Facet Filters & Sorting
router.get('/', async (req, res) => {
  const result = await listProducts(req.query);
  res.json(result);
});

// 3. Single Product by Slug or ID
router.get('/:identifier', async (req, res) => {
  const product = await findProductByIdentifier(req.params.identifier);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  const [related, reviews] = await Promise.all([
    findRelatedProducts(product),
    listReviews({ productId: product.id })
  ]);
  res.json({ success: true, product, related, reviews });
});

// 4. Admin: Add New Product
router.post('/', requirePermission('products:create'), async (req, res) => {
  const { name, categoryId, brandId, sku } = req.body;
  const slug = (req.body.slug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const product = await createProduct({
    ...req.body,
    name, slug, sku, categoryId, brandId,
    price: String(Number(req.body.price) || 0),
    compareAtPrice: req.body.compareAtPrice ? String(Number(req.body.compareAtPrice)) : null,
    costPrice: req.body.costPrice ? String(Number(req.body.costPrice)) : null,
    stock: Number(req.body.stock) || 0,
    thumbnailUrl: req.body.thumbnail || req.body.thumbnailUrl,
    images: req.body.images || []
  });

  await logAudit({
    actorId: req.user.id, actorName: req.user.name, action: 'PRODUCT_CREATE', entity: 'Product',
    entityId: product.id, newValue: `Price: KES ${Number(product.price).toLocaleString()}, Stock: ${product.stock}`, ip: req.ip
  });
  res.status(201).json({ success: true, product });
});

// 5. Admin/Sales Manager: Update Product (stock/price adjustments)
router.put('/:id', requirePermission('products:update'), async (req, res) => {
  const existing = await getProductById(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const patch = { ...req.body };
  delete patch.id;
  if (patch.price !== undefined) patch.price = String(Number(patch.price));
  if (patch.compareAtPrice !== undefined) patch.compareAtPrice = patch.compareAtPrice ? String(Number(patch.compareAtPrice)) : null;
  if (patch.costPrice !== undefined) patch.costPrice = patch.costPrice ? String(Number(patch.costPrice)) : null;
  if (patch.stock !== undefined) patch.stock = Number(patch.stock);
  if (patch.thumbnail !== undefined) { patch.thumbnailUrl = patch.thumbnail; delete patch.thumbnail; }
  delete patch.brand; delete patch.category; delete patch.categorySlug; delete patch.categoryKind;

  const product = await updateProduct(req.params.id, patch);

  let changeSummary = [];
  if (patch.price !== undefined && Number(patch.price) !== Number(existing.price)) {
    changeSummary.push(`Price: KES ${Number(existing.price).toLocaleString()} -> KES ${Number(patch.price).toLocaleString()}`);
  }
  if (patch.stock !== undefined && patch.stock !== existing.stock) {
    changeSummary.push(`Stock: ${existing.stock} -> ${patch.stock}`);
  }

  await logAudit({
    actorId: req.user.id, actorName: req.user.name, action: 'PRODUCT_UPDATE', entity: 'Product',
    entityId: product.id, previousValue: `Price: ${existing.price}, Stock: ${existing.stock}`,
    newValue: changeSummary.join(', ') || 'Attributes updated', ip: req.ip
  });

  res.json({ success: true, product: { ...product, price: Number(product.price), stock: product.stock } });
});

// 6. Admin: Delete Product
router.delete('/:id', requirePermission('products:delete'), async (req, res) => {
  const deleted = await deleteProduct(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  await logAudit({
    actorId: req.user.id, actorName: req.user.name, action: 'PRODUCT_DELETE', entity: 'Product',
    entityId: deleted.id, previousValue: `SKU: ${deleted.sku}`, newValue: 'Deleted from catalog', ip: req.ip
  });
  res.json({ success: true, message: 'Product deleted successfully' });
});

export default router;
