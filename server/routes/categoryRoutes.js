import express from 'express';
import { listCategories, createCategory } from '../repositories/catalogRepo.js';
import { logAudit } from '../repositories/auditLogsRepo.js';
import { requirePermission } from '../middleware/authorize.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const categories = await listCategories();
  res.json({ success: true, categories });
});

router.post('/', requirePermission('categories:write'), async (req, res) => {
  const { name, kind, description, imageUrl, icon, sortOrder } = req.body;
  const slug = (req.body.slug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const category = await createCategory({
    name, slug, kind: kind === 'service' ? 'service' : 'product',
    description, imageUrl, icon, sortOrder: sortOrder || 0
  });

  await logAudit({ actorId: req.user.id, actorName: req.user.name, action: 'CATEGORY_CREATE', entity: 'Category', entityId: category.id, newValue: category.name, ip: req.ip });
  res.status(201).json({ success: true, category });
});

export default router;
