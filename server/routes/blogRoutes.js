import express from 'express';
import { listBlogPosts, findBlogPostBySlugOrId, findRelatedBlogPosts, createBlogPost } from '../repositories/blogRepo.js';
import { logAudit } from '../repositories/auditLogsRepo.js';
import { requirePermission } from '../middleware/authorize.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const posts = await listBlogPosts();
  res.json({ success: true, posts: posts.map((p) => ({ ...p, date: p.publishedAt, image: p.imageUrl })) });
});

router.get('/:slug', async (req, res) => {
  const post = await findBlogPostBySlugOrId(req.params.slug);
  if (!post) return res.status(404).json({ success: false, message: 'Article not found' });

  const relatedPosts = await findRelatedBlogPosts(post);
  res.json({
    success: true,
    post: { ...post, date: post.publishedAt, image: post.imageUrl },
    relatedPosts: relatedPosts.map((p) => ({ ...p, date: p.publishedAt, image: p.imageUrl }))
  });
});

router.post('/', requirePermission('blog:write'), async (req, res) => {
  const slug = (req.body.slug || req.body.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const post = await createBlogPost({ ...req.body, slug, imageUrl: req.body.image || req.body.imageUrl });

  await logAudit({ actorId: req.user.id, actorName: req.user.name, action: 'BLOG_POST_CREATE', entity: 'Blog', entityId: post.id, newValue: 'Published', ip: req.ip });
  res.status(201).json({ success: true, post: { ...post, date: post.publishedAt, image: post.imageUrl } });
});

export default router;
