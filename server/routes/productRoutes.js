import express from 'express';
import {
  searchProductSuggestions,
  listProducts,
  findProductByIdentifier,
  findRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  findCategoryByName,
  findBrandByName
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
  const { name, sku } = req.body;
  if (!name || !sku) {
    return res.status(400).json({ success: false, message: 'Product title and SKU are required' });
  }

  let categoryId = req.body.categoryId;
  let brandId = req.body.brandId;
  if (!categoryId && req.body.category) {
    const category = await findCategoryByName(req.body.category);
    if (!category) {
      return res.status(400).json({ success: false, message: `Unknown category: ${req.body.category}` });
    }
    categoryId = category.id;
  }
  if (!brandId && req.body.brand) {
    const brand = await findBrandByName(req.body.brand);
    brandId = brand?.id || null;
  }
  if (!categoryId) {
    return res.status(400).json({ success: false, message: 'A valid category is required' });
  }

  const slug = (req.body.slug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const thumbnailUrl = req.body.thumbnail || req.body.thumbnailUrl || null;
  const images = req.body.images?.length ? req.body.images : (thumbnailUrl ? [thumbnailUrl] : []);

  const product = await createProduct({
    ...req.body,
    name, slug, sku, categoryId, brandId,
    thumbnailUrl,
    images
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
  if (!patch.categoryId && patch.category) {
    const category = await findCategoryByName(patch.category);
    if (category) patch.categoryId = category.id;
  }
  if (!patch.brandId && patch.brand) {
    const brand = await findBrandByName(patch.brand);
    if (brand) patch.brandId = brand.id;
  }
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
