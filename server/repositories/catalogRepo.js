import { eq, and, ilike, gte, lte, inArray, desc, asc, sql, or } from 'drizzle-orm';
import { db } from '../db/client.js';
import { categories, brands, products, productVariants } from '../db/schema.js';
import { isUuid } from '../db/util.js';

// --- Categories ---------------------------------------------------------

export async function listCategories() {
  const rows = await db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.name));
  const counts = await db
    .select({ categoryId: products.categoryId, count: sql`count(*)::int` })
    .from(products)
    .where(eq(products.isActive, true))
    .groupBy(products.categoryId);
  const countMap = Object.fromEntries(counts.map((c) => [c.categoryId, c.count]));
  return rows.map((c) => ({ ...c, productCount: countMap[c.id] || 0 }));
}

export async function findCategoryBySlugOrId(identifier) {
  // Postgres errors on `uuid_col = $1` when $1 isn't a valid UUID, even in an
  // unmatched OR branch — only compare against id when it looks like one.
  const condition = isUuid(identifier) ? or(eq(categories.slug, identifier), eq(categories.id, identifier)) : eq(categories.slug, identifier);
  const [row] = await db.select().from(categories).where(condition).limit(1);
  return row || null;
}

export async function createCategory(data) {
  const [row] = await db.insert(categories).values(data).returning();
  return row;
}

// --- Brands --------------------------------------------------------------

export async function listBrands() {
  const rows = await db.select().from(brands).orderBy(asc(brands.name));
  const counts = await db
    .select({ brandId: products.brandId, count: sql`count(*)::int` })
    .from(products)
    .where(eq(products.isActive, true))
    .groupBy(products.brandId);
  const countMap = Object.fromEntries(counts.map((c) => [c.brandId, c.count]));
  return rows.map((b) => ({ ...b, count: countMap[b.id] || 0 }));
}

export async function createBrand(data) {
  const [row] = await db.insert(brands).values(data).returning();
  return row;
}

// --- Products --------------------------------------------------------------

// Reshapes DB rows into the exact frontend Product contract (src/types/index.ts):
// "thumbnail" not "thumbnailUrl", numeric fields as numbers not numeric-strings,
// "brand"/"category" as display names (not ids).
function withRelations(row) {
  if (!row) return null;
  const p = row.products;
  return {
    ...p,
    brand: row.brands?.name || null,
    brandId: p.brandId,
    category: row.categories?.name || null,
    categoryId: p.categoryId,
    categorySlug: row.categories?.slug || null,
    categoryKind: row.categories?.kind || 'product',
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice != null ? Number(p.compareAtPrice) : null,
    costPrice: p.costPrice != null ? Number(p.costPrice) : null,
    rating: Number(p.rating),
    thumbnail: p.thumbnailUrl
  };
}

function toApiVariant(v) {
  return {
    id: v.id,
    name: v.name,
    sku: v.sku,
    price: Number(v.price),
    stock: v.stock,
    image: v.imageUrl,
    ...(v.attributes || {})
  };
}

export async function searchProductSuggestions(query) {
  const q = `%${query}%`;
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      thumbnailUrl: products.thumbnailUrl,
      stock: products.stock,
      brand: brands.name,
      category: categories.name
    })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.isActive, true), or(ilike(products.name, q), ilike(products.sku, q), ilike(brands.name, q))))
    .limit(8);

  return rows.map((r) => ({ ...r, thumbnail: r.thumbnailUrl, price: Number(r.price), compareAtPrice: r.compareAtPrice != null ? Number(r.compareAtPrice) : null }));
}

export async function listProducts({
  category, subcategory, brand, minPrice, maxPrice, condition, inStock,
  featured, flashDeal, search, sortBy, limit = 50, page = 1
} = {}) {
  const conditions = [eq(products.isActive, true)];

  if (category) {
    conditions.push(or(ilike(categories.slug, category), ilike(categories.name, category)));
  }
  if (brand) {
    const brandsList = Array.isArray(brand) ? brand : String(brand).split(',');
    conditions.push(inArray(brands.name, brandsList));
  }
  if (minPrice) conditions.push(gte(products.price, String(minPrice)));
  if (maxPrice) conditions.push(lte(products.price, String(maxPrice)));
  if (condition) conditions.push(ilike(products.condition, `%${condition}%`));
  if (inStock === 'true' || inStock === true) conditions.push(sql`${products.stock} > 0`);
  if (featured === 'true' || featured === true) conditions.push(eq(products.isFeatured, true));
  if (flashDeal === 'true' || flashDeal === true) conditions.push(eq(products.isFlashDeal, true));
  if (search) {
    const q = `%${search}%`;
    conditions.push(or(ilike(products.name, q), ilike(products.description, q), ilike(products.shortSpecs, q), ilike(products.sku, q)));
  }

  let orderBy = [desc(products.isFeatured)];
  switch (sortBy) {
    case 'price-asc': orderBy = [asc(products.price)]; break;
    case 'price-desc': orderBy = [desc(products.price)]; break;
    case 'rating': orderBy = [desc(products.rating)]; break;
    case 'newest': orderBy = [desc(products.isNewArrival), desc(products.createdAt)]; break;
    default: orderBy = [desc(products.isFeatured)];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 50;
  const offset = (pageNum - 1) * limitNum;

  const baseQuery = db
    .select({ products, brands, categories })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(...conditions));

  const rows = await baseQuery.orderBy(...orderBy).limit(limitNum).offset(offset);
  const [{ count: total }] = await db
    .select({ count: sql`count(*)::int` })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(...conditions));

  return {
    products: rows.map(withRelations),
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum)
  };
}

export async function findProductByIdentifier(identifier) {
  const condition = isUuid(identifier) ? or(eq(products.slug, identifier), eq(products.id, identifier)) : eq(products.slug, identifier);
  const [row] = await db
    .select({ products, brands, categories })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(condition)
    .limit(1);
  if (!row) return null;

  const variants = await db.select().from(productVariants).where(eq(productVariants.productId, row.products.id));
  return { ...withRelations(row), variants: variants.map(toApiVariant) };
}

export async function findRelatedProducts(product, limit = 6) {
  const rows = await db
    .select({ products, brands, categories })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(
      and(
        eq(products.isActive, true),
        sql`${products.id} != ${product.id}`,
        or(eq(products.categoryId, product.categoryId), eq(products.brandId, product.brandId))
      )
    )
    .limit(limit);
  return rows.map(withRelations);
}

export async function createProduct(data) {
  const [row] = await db.insert(products).values(data).returning();
  return row;
}

export async function updateProduct(id, patch) {
  const [row] = await db.update(products).set({ ...patch, updatedAt: new Date() }).where(eq(products.id, id)).returning();
  return row;
}

export async function deleteProduct(id) {
  const [row] = await db.delete(products).where(eq(products.id, id)).returning();
  return row;
}

export async function getProductById(id) {
  const [row] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return row || null;
}
