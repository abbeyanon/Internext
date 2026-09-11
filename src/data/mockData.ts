// Initial/fallback client state, used only until the real API data loads
// (see src/context/StoreContext.tsx) or if a request fails. Intentionally
// empty for catalog-shaped data — showing fictional demo products/reviews
// here would be misleading for a real, deployed business; better to show a
// brief loading/empty state than wrong data. Never put real secrets here:
// this file ships in the client-side JS bundle, visible to every visitor.
import { Product, Category, Brand, StoreSettings, DeliveryZone, StoreLocation, Review, BlogPost, Coupon } from "../types";

export const initialSettings: StoreSettings = {
  storeName: "Internext Business System",
  tagline: "We Make Technology Happen",
  phone: "+254 722 664 457",
  altPhone: "+254 726 237 204",
  email: "info@internextbusinesssystem.co.ke",
  supportEmail: "info@internextbusinesssystem.co.ke",
  whatsappNumber: "+254722664457",
  address: "Princely House, 1st Floor, Moi Avenue, Nairobi, P.O. Box 16806-00100",
  currency: "KES",
  currencySymbol: "KES ",
  taxRate: 16,
  pricesIncludeTax: true,
  freeShippingThreshold: 50000,
  mpesaPaybill: "",
  mpesaAccountNo: "",
  mpesaTill: "",
  theme: {
    primaryColor: "#0b132b",
    secondaryColor: "#1c2541",
    accentColor: "#0284c7",
    highlightColor: "#06b6d4"
  },
  socialLinks: {
    facebook: "",
    instagram: "",
    twitter: "",
    tiktok: "",
    youtube: ""
  }
};

export const initialDeliveryZones: DeliveryZone[] = [];
export const initialStores: StoreLocation[] = [
  {
    id: "store-hq",
    name: "Internext Business System — Head Office",
    address: "Princely House, 1st Floor, Moi Avenue",
    city: "Nairobi",
    phone: "+254 722 664 457",
    hours: "Mon - Fri: 8:00 AM - 6:00 PM | Sat: 9:00 AM - 2:00 PM",
    services: ["Sales", "CCTV & Network Installation", "Hardware & Software Repair", "Collection Point"]
  }
];
export const initialCategories: Category[] = [];
export const initialBrands: Brand[] = [];
export const initialProducts: Product[] = [];
export const initialReviews: Review[] = [];
export const initialBlogPosts: BlogPost[] = [];
export const initialCoupons: Coupon[] = [];
