import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { products as baseProducts } from './productsData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

// Extra Smartphones to reach 30+
const extraPhones = [
  {
    id: "prod-iph15pm",
    name: "Apple iPhone 15 Pro Max",
    slug: "apple-iphone-15-pro-max",
    brand: "Apple",
    brandId: "b-apple",
    category: "Smartphones",
    categoryId: "cat-smartphones",
    subcategory: "Apple iPhone",
    sku: "IPH15PM-256-BLU",
    shortSpecs: "256GB | 8GB RAM | 5G | 6.7\" Super Retina XDR OLED | A17 Pro | 48MP 5x Optical Zoom",
    price: 175000,
    compareAtPrice: 195000,
    costPrice: 150000,
    rating: 4.8,
    reviewsCount: 112,
    stock: 15,
    condition: "Brand New Sealed",
    warranty: "1 Year Apple Warranty",
    isFeatured: true,
    thumbnail: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80"],
    description: "iPhone 15 Pro Max in Blue Titanium. USB-C 3.0, Action Button, and exceptional battery life.",
    variants: [{ id: "v-ph-1", name: "256GB / Blue Titanium", sku: "IPH15PM-256-BLU", price: 175000, stock: 15, storage: "256GB", color: "Blue Titanium" }],
    specs: { "Display": { "Screen": "6.7\" OLED 120Hz" }, "Chip": { "Processor": "A17 Pro (3nm)" } }
  },
  {
    id: "prod-iph15",
    name: "Apple iPhone 15",
    slug: "apple-iphone-15",
    brand: "Apple",
    brandId: "b-apple",
    category: "Smartphones",
    categoryId: "cat-smartphones",
    subcategory: "Apple iPhone",
    sku: "IPH15-128-PNK",
    shortSpecs: "128GB | 6GB RAM | 5G | 6.1\" Super Retina XDR | Dynamic Island | 48MP Main Camera",
    price: 115000,
    compareAtPrice: 128000,
    costPrice: 98000,
    rating: 4.8,
    reviewsCount: 88,
    stock: 20,
    condition: "Brand New Sealed",
    warranty: "1 Year Apple Warranty",
    isFeatured: false,
    thumbnail: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80"],
    description: "Features Dynamic Island, 48MP main camera with 2x telephoto crop, color-infused back glass, and USB-C.",
    variants: [{ id: "v-ph-2", name: "128GB / Black", sku: "IPH15-128-BLK", price: 115000, stock: 10, storage: "128GB", color: "Black" }, { id: "v-ph-3", name: "128GB / Pink", sku: "IPH15-128-PNK", price: 115000, stock: 10, storage: "128GB", color: "Pink" }],
    specs: { "Processor": { "CPU": "A16 Bionic" } }
  },
  {
    id: "prod-sam-s24plus",
    name: "Samsung Galaxy S24+ 5G",
    slug: "samsung-galaxy-s24-plus-5g",
    brand: "Samsung",
    brandId: "b-samsung",
    category: "Smartphones",
    categoryId: "cat-smartphones",
    subcategory: "Samsung Galaxy",
    sku: "SAM-S24P-256-BLK",
    shortSpecs: "256GB | 12GB RAM | 5G | 6.7\" QHD+ Dynamic AMOLED 2X 120Hz | Galaxy AI | 4900mAh Battery",
    price: 135000,
    compareAtPrice: 148000,
    costPrice: 118000,
    rating: 4.8,
    reviewsCount: 46,
    stock: 14,
    condition: "Brand New Sealed",
    warranty: "2 Years Samsung Warranty",
    isFeatured: true,
    thumbnail: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80"],
    description: "Enhanced QHD+ display with 12GB RAM standard, Armor Aluminum 2.0 frame, and 45W fast charging.",
    variants: [{ id: "v-ph-4", name: "256GB / Onyx Black", sku: "SAM-S24P-256-BLK", price: 135000, stock: 14, storage: "256GB", color: "Onyx Black" }],
    specs: { "Battery": { "Size": "4900 mAh", "Speed": "45W Fast Charging" } }
  },
  {
    id: "prod-px8a",
    name: "Google Pixel 8a 5G (Best Value Camera)",
    slug: "google-pixel-8a-5g",
    brand: "Google",
    brandId: "b-google",
    category: "Smartphones",
    categoryId: "cat-smartphones",
    subcategory: "Google Pixel",
    sku: "GGL-PX8A-128-BAY",
    shortSpecs: "128GB | 8GB RAM | 5G | 6.1\" Actua OLED 120Hz | Google Tensor G3 | Best Take & Magic Audio Eraser",
    price: 68000,
    compareAtPrice: 76000,
    costPrice: 58000,
    rating: 4.8,
    reviewsCount: 54,
    stock: 16,
    condition: "Brand New Sealed",
    warranty: "1 Year Warranty",
    isFeatured: false,
    isFlashDeal: true,
    flashDealEnds: "2026-10-31T23:59:59Z",
    thumbnail: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80"],
    description: "The AI phone for less. 120Hz display, Google Tensor G3 processor, IP67 water resistance, and 7 years of software updates.",
    variants: [{ id: "v-ph-5", name: "128GB / Bay Blue", sku: "GGL-PX8A-128-BAY", price: 68000, stock: 9, storage: "128GB", color: "Bay Blue" }, { id: "v-ph-6", name: "128GB / Obsidian", sku: "GGL-PX8A-128-OBS", price: 68000, stock: 7, storage: "128GB", color: "Obsidian" }],
    specs: { "Processor": { "CPU": "Google Tensor G3" } }
  },
  {
    id: "prod-op-12",
    name: "OnePlus 12 5G (Hasselblad Camera)",
    slug: "oneplus-12-5g-hasselblad",
    brand: "OnePlus",
    brandId: "b-asus",
    category: "Smartphones",
    categoryId: "cat-smartphones",
    subcategory: "OnePlus",
    sku: "OP-12-512-GRN",
    shortSpecs: "512GB | 16GB RAM | 5G | 6.82\" 2K 120Hz ProXDR AMOLED | Snapdragon 8 Gen 3 | 5400mAh | 100W SUPERVOOC",
    price: 128000,
    compareAtPrice: 142000,
    costPrice: 110000,
    rating: 4.9,
    reviewsCount: 38,
    stock: 11,
    condition: "Brand New Sealed",
    warranty: "1 Year Official Warranty",
    isFeatured: true,
    thumbnail: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80"],
    description: "Peak flagship performance with 4th Gen Hasselblad Camera for Mobile, Aqua Touch screen responsive in rain, and 100W wired / 50W wireless charging.",
    variants: [{ id: "v-ph-7", name: "512GB / Flowy Emerald", sku: "OP-12-512-GRN", price: 128000, stock: 11, storage: "512GB", color: "Flowy Emerald" }],
    specs: { "Charging": { "Wired": "100W SUPERVOOC (1-100% in 26 mins)", "Battery": "5400 mAh Dual-Cell" } }
  },
  {
    id: "prod-tec-c30p",
    name: "Tecno Camon 30 Premier 5G",
    slug: "tecno-camon-30-premier-5g",
    brand: "Tecno",
    brandId: "b-samsung",
    category: "Smartphones",
    categoryId: "cat-smartphones",
    subcategory: "Tecno & Infinix",
    sku: "TEC-C30P-512-ALPS",
    shortSpecs: "512GB | 12GB+12GB Extended RAM | 5G | 6.77\" 1.5K 120Hz LTPO AMOLED | Sony PolarAce AI Imaging | 70W Ultra Charge",
    price: 62000,
    compareAtPrice: 69000,
    costPrice: 52000,
    rating: 4.7,
    reviewsCount: 51,
    stock: 18,
    condition: "Brand New Sealed",
    warranty: "24+1 Months Carlcare Warranty",
    isFeatured: false,
    isFlashDeal: true,
    flashDealEnds: "2026-10-31T23:59:59Z",
    thumbnail: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80",
    images: ["https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80"],
    description: "Pioneering PolarAce Dual Chip imaging system with 50MP Sony IMX890 OIS main camera, 50MP periscope telephoto, and genuine action-dot recording light.",
    variants: [{ id: "v-ph-8", name: "512GB / Alps Snowy Silver", sku: "TEC-C30P-512-ALPS", price: 62000, stock: 18, storage: "512GB", color: "Snowy Silver" }],
    specs: { "Camera": { "Sensors": "Triple 50MP Rear + 50MP Eye-Tracking Front Camera" } }
  }
];

// Combine all products
const currentDb = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
const existingIds = new Set(currentDb.products.map(p => p.id));

for (const p of extraPhones) {
  if (!existingIds.has(p.id)) {
    currentDb.products.push(p);
  }
}

fs.writeFileSync(DB_FILE, JSON.stringify(currentDb, null, 2), 'utf-8');
console.log(`Updated catalog. Total active products: ${currentDb.products.length}`);
