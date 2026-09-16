import express from 'express';
import { listBrands, createBrand } from '../repositories/catalogRepo.js';
import { logAudit } from '../repositories/auditLogsRepo.js';
import { requirePermission } from '../middleware/authorize.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const brands = await listBrands();
  res.json({ success: true, brands });
});

router.post('/', requirePermission('brands:write'), async (req, res) => {
  const { name, logoUrl } = req.body;
  const slug = (req.body.slug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const brand = await createBrand({ name, slug, logoUrl });
  await logAudit({ actorId: req.user.id, actorName: req.user.name, action: 'BRAND_CREATE', entity: 'Brand', entityId: brand.id, newValue: brand.name, ip: req.ip });
  res.status(201).json({ success: true, brand });
});

export default router;
