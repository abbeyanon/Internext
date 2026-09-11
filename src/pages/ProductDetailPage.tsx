import React, { useState, useEffect } from 'react';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  ShoppingCart,
  Heart,
  Scale,
  MessageCircle,
  Share2,
  CheckCircle2,
  Lock,
  ChevronRight,
  Package,
  Layers,
  Sparkles,
  Zap,
  Plus,
  Minus,
  Check
} from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { FloatingWhatsApp } from '../components/layout/FloatingWhatsApp';
import { CompareDrawer } from '../components/common/CompareDrawer';
import { CartDrawer } from '../components/checkout/CartDrawer';
import { ProductCard } from '../components/common/ProductCard';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useToast } from '../context/ToastContext';
import { Product, ProductVariant, Review } from '../types';

import { initialProducts, initialReviews } from '../data/mockData';

export const ProductDetailPage: React.FC = () => {
  const { formatPrice, settings, products } = useStore();
  const { addToCart, setIsCartDrawerOpen } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isComparing, addToCompare } = useCompare();
  const { showToast } = useToast();

  // Extract slug from URL path e.g. /products/apple-iphone-16-pro-max
  const pathParts = window.location.pathname.split('/');
  const slug = pathParts[pathParts.length - 1] || 'apple-iphone-16-pro-max';

  // Immediate lookup from catalog
  const catalogList = (products && products.length > 0) ? products : initialProducts;
  const initialFound = catalogList.find((p) => p.slug === slug || p.id === slug) || catalogList[0];

  const [product, setProduct] = useState<Product | null>(initialFound || null);
  const [related, setRelated] = useState<Product[]>(() => {
    if (!initialFound) return [];
    return catalogList.filter((p) => p.id !== initialFound.id && p.category === initialFound.category).slice(0, 4);
  });
  const [reviews, setReviews] = useState<Review[]>(() => {
    if (!initialFound) return [];
    return initialReviews.filter((r) => r.productId === initialFound.id);
  });
  const [loading, setLoading] = useState<boolean>(!initialFound);

  // Gallery state
  const [selectedImage, setSelectedImage] = useState<string>(
    initialFound ? (initialFound.thumbnail || initialFound.images[0]) : ''
  );
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    initialFound && initialFound.variants && initialFound.variants.length > 0 ? initialFound.variants[0] : null
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'description' | 'reviews' | 'warranty'>('specs');

  // Review submission modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserCity, setNewUserCity] = useState('Nairobi');

  // Bundle Add-on items
  const [includeCharger, setIncludeCharger] = useState(true);

  useEffect(() => {
    // Background live update if API exists
    fetch(`/api/products/${slug}`)
      .then((res) => {
        if (!res.ok) return null;
        const ct = res.headers.get('content-type');
        return ct && ct.includes('application/json') ? res.json() : null;
      })
      .then((data) => {
        if (data && data.success && data.product) {
          setProduct(data.product);
          setSelectedImage(data.product.thumbnail || data.product.images[0]);
          if (data.product.variants && data.product.variants.length > 0) {
            setSelectedVariant(data.product.variants[0]);
          }
          if (data.related) setRelated(data.related);
          if (data.reviews) setReviews(data.reviews);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Header currentPath="/products" />
        <div className="flex-1 flex items-center justify-center p-20">
          <div className="flex flex-col items-center gap-3 text-cyan-400">
            <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold uppercase tracking-wider">Loading Genuine Tech Specs...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Header currentPath="/products" />
        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Product Not Found</h2>
          <p className="text-xs text-slate-400">The requested gadget might have been updated or moved.</p>
          <a href="/shop" className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-xs">
            Return to Shop
          </a>
        </div>
        <Footer />
      </div>
    );
  }

  const activePrice = selectedVariant ? selectedVariant.price : product.price;
  const activeStock = selectedVariant ? selectedVariant.stock : product.stock;
  const activeSku = selectedVariant ? selectedVariant.sku : product.sku;

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > activePrice
      ? Math.round(((product.compareAtPrice - activePrice) / product.compareAtPrice) * 100)
      : 0;

  const isSaved = isInWishlist(product.id);
  const isCompared = isComparing(product.id);

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedVariant, quantity);
    window.location.href = '/checkout';
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on ${settings.storeName}!`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product link copied to clipboard!', 'success');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newComment.trim()) {
      showToast('Please provide both title and review comments', 'error');
      return;
    }

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          userName: newUserName.trim() || 'Verified Tech Buyer',
          userCity: newUserCity,
          rating: newRating,
          title: newTitle.trim(),
          comment: newComment.trim()
        })
      });
      if (res.ok) {
        const ct = res.headers.get('content-type');
        if (ct && ct.includes('application/json')) {
          const data = await res.json();
          if (data.success && data.review) {
            setReviews([data.review, ...reviews]);
            showToast('Review submitted successfully!', 'success');
            setIsReviewModalOpen(false);
            setNewTitle('');
            setNewComment('');
            return;
          }
        }
      }
      // Local fallback
      const localReview: Review = {
        id: `rev-${Date.now()}`,
        productId: product.id,
        userName: newUserName.trim() || 'Verified Tech Buyer',
        userCity: newUserCity,
        rating: newRating,
        title: newTitle.trim(),
        comment: newComment.trim(),
        verifiedPurchase: true,
        date: new Date().toISOString()
      };
      setReviews([localReview, ...reviews]);
      showToast('Review submitted successfully!', 'success');
      setIsReviewModalOpen(false);
      setNewTitle('');
      setNewComment('');
    } catch {
      const localReview: Review = {
        id: `rev-${Date.now()}`,
        productId: product.id,
        userName: newUserName.trim() || 'Verified Tech Buyer',
        userCity: newUserCity,
        rating: newRating,
        title: newTitle.trim(),
        comment: newComment.trim(),
        verifiedPurchase: true,
        date: new Date().toISOString()
      };
      setReviews([localReview, ...reviews]);
      showToast('Review submitted successfully!', 'success');
      setIsReviewModalOpen(false);
      setNewTitle('');
      setNewComment('');
    }
  };

  // WhatsApp prefilled message
  const whatsappUrl = `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Hello ${settings.storeName}, I am interested in ${product.name} [SKU: ${activeSku}] priced at ${formatPrice(activePrice)}. Is it currently available?`
  )}`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-600 selection:text-white">
      <Header currentPath="/products" />

      {/* Breadcrumb Bar */}
      <div className="bg-[#070b18] border-b border-slate-800 py-3.5 px-3 sm:px-4 lg:px-5">
        <div className="max-w-[1520px] mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400 truncate">
            <a href="/" className="hover:text-cyan-400">Home</a>
            <span>/</span>
            <a href="/shop" className="hover:text-cyan-400">Shop</a>
            <span>/</span>
            <a href={`/shop?category=${product.categoryId || product.category.toLowerCase()}`} className="hover:text-cyan-400 capitalize">
              {product.category}
            </a>
            <span>/</span>
            <span className="text-white font-medium truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 font-semibold"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* Main Showcase Grid */}
      <div className="max-w-[1520px] mx-auto px-3 sm:px-4 lg:px-5 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* ======================================================== */}
          {/* LEFT: MULTI-IMAGE GALLERY (5 Cols) */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main Stage Image */}
            <div className="relative h-80 sm:h-[450px] rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 p-6 flex items-center justify-center group shadow-2xl">
              <img
                src={selectedImage}
                alt={product.name}
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
              />

              {discountPercent > 0 && (
                <span className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-rose-600 text-white font-black text-xs uppercase tracking-wider shadow-lg">
                  {discountPercent}% OFF
                </span>
              )}

              {product.isFlashDeal && (
                <span className="absolute top-4 right-4 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Flash Deal
                </span>
              )}
            </div>

            {/* Thumbnails list */}
            {product.images && product.images.length > 0 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden bg-slate-900 border-2 p-2 shrink-0 transition-all ${
                      selectedImage === img
                        ? 'border-cyan-500 ring-2 ring-cyan-500/30 scale-105'
                        : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* RIGHT: BUY BOX & SPECS SELECTOR (6 Cols) */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              {/* Brand & Stock Pill */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  {product.brand}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  SKU: <strong className="text-slate-200">{activeSku}</strong>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
                {product.name}
              </h1>

              {/* Rating & Warranty */}
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 bg-amber-950/40 border border-amber-500/30 px-3 py-1 rounded-xl text-amber-400 text-xs font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{product.rating.toFixed(1)} Rating</span>
                  <span className="text-slate-400 font-normal">({product.reviewsCount} customer reviews)</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{activeStock > 0 ? `${activeStock} In Stock (Nairobi Kimathi Hub)` : 'Out of Stock'}</span>
                </div>
              </div>

              {/* Price Display */}
              <div className="mt-5 p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-baseline justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-medium mb-0.5">Special Retail Price:</div>
                  <div className="text-3xl sm:text-4xl font-black text-white">
                    {formatPrice(activePrice)}
                  </div>
                  {product.compareAtPrice && (
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      <span className="line-through">{formatPrice(product.compareAtPrice)}</span>
                      <span className="text-emerald-400 font-bold">Save {formatPrice(product.compareAtPrice - activePrice)}</span>
                    </div>
                  )}
                </div>

                <div className="text-right text-[11px] text-slate-400">
                  <div className="font-semibold text-slate-300">16% Kenya VAT Included</div>
                  <div>Official ETR Receipt Provided</div>
                </div>
              </div>
            </div>

            {/* Variants Picker (Storage / RAM / Colors) */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Select Model Configuration:</span>
                  <span className="text-cyan-400 font-normal">
                    {selectedVariant ? selectedVariant.name : 'Choose one'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                        selectedVariant?.id === variant.id
                          ? 'bg-cyan-950/80 border-cyan-500 text-white font-bold ring-1 ring-cyan-500'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{variant.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {variant.stock > 0 ? `${variant.stock} available` : 'Sold out'}
                        </div>
                      </div>
                      <div className="text-emerald-400 font-black text-sm">
                        {formatPrice(variant.price)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart & Buy Now Buttons */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {/* Quantity adjuster */}
                <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold text-sm transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-black text-white font-mono">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(activeStock, quantity + 1))}
                    className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold text-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={activeStock <= 0}
                  className="flex-1 py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-cyan-600/30 transition-all active:scale-98"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                </button>
              </div>

              {/* Buy Now Direct Button */}
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={activeStock <= 0}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 transition-all"
              >
                <Zap className="w-5 h-5" />
                <span>Buy Now with M-Pesa / Card</span>
              </button>

              {/* Action utilities */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition-colors ${
                    isSaved ? 'bg-rose-950/80 border-rose-500 text-rose-400' : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-400' : ''}`} />
                  <span>{isSaved ? 'Saved' : 'Wishlist'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => addToCompare(product)}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition-colors ${
                    isCompared ? 'bg-cyan-950/80 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <Scale className="w-4 h-4" />
                  <span>Compare</span>
                </button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 hover:bg-emerald-900 flex items-center justify-center gap-2 font-bold transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Trust Assurance Grid */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Warranty Included</div>
                  <div className="text-slate-400 text-[11px]">{product.warranty}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Truck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Fast Dispatch</div>
                  <div className="text-slate-400 text-[11px]">Same-Day Nairobi • 24h Countrywide</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* FREQUENTLY BOUGHT TOGETHER BUNDLE BUILDER */}
        {/* ======================================================== */}
        <div className="mt-16 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-cyan-400" /> Recommended Hardware Bundle
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            Frequently Bought Together
          </h3>

          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Main Item */}
            <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800 flex-1 w-full">
              <img src={product.thumbnail} alt="" className="w-16 h-16 rounded-xl object-contain bg-slate-900 p-1" />
              <div>
                <div className="text-xs font-bold text-white line-clamp-1">{product.name}</div>
                <div className="text-emerald-400 font-extrabold text-xs">{formatPrice(activePrice)}</div>
              </div>
            </div>

            <span className="text-slate-500 font-bold text-xl">+</span>

            {/* Bundle Addon Item: Anker GaN Charger */}
            <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800 flex-1 w-full">
              <input
                type="checkbox"
                checked={includeCharger}
                onChange={(e) => setIncludeCharger(e.target.checked)}
                className="rounded bg-slate-800 text-cyan-600 w-4 h-4 ml-1"
              />
              <img
                src="https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=200&auto=format&fit=crop&q=80"
                alt="Anker GaN Charger"
                className="w-16 h-16 rounded-xl object-contain bg-slate-900 p-1"
              />
              <div>
                <div className="text-xs font-bold text-white line-clamp-1">Anker Prime 100W GaN 3-Port Fast Wall Charger</div>
                <div className="text-emerald-400 font-extrabold text-xs">{formatPrice(9800)}</div>
              </div>
            </div>

            {/* Bundle Total & Action */}
            <div className="p-4 rounded-2xl bg-cyan-950/60 border border-cyan-800/60 shrink-0 text-center w-full md:w-64 space-y-2">
              <div className="text-xs text-slate-300 font-medium">Bundle Price:</div>
              <div className="text-xl font-black text-white">
                {formatPrice(activePrice + (includeCharger ? 9800 : 0))}
              </div>
              <button
                type="button"
                onClick={() => {
                  addToCart(product, selectedVariant, 1);
                  if (includeCharger) {
                    // Also add charger item
                    const ankerProd = related.find(r => r.name.includes('Anker')) || {
                      id: 'prod-anker-prime100w',
                      name: 'Anker Prime 100W GaN 3-Port Fast Wall Charger',
                      slug: 'anker-prime-100w-gan-charger',
                      sku: 'ANK-PRIME-100W-BLK',
                      price: 9800,
                      stock: 40,
                      thumbnail: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
                      images: [],
                      category: 'Accessories',
                      brand: 'Anker',
                      condition: 'Brand New',
                      warranty: '18 Months',
                      rating: 5,
                      reviewsCount: 78,
                      shortSpecs: '100W Fast Charger',
                      description: 'Anker 100W'
                    };
                    addToCart(ankerProd as any, null, 1);
                  }
                  setIsCartDrawerOpen(true);
                }}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition-colors shadow"
              >
                Add Both to Cart
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SPECIFICATIONS & REVIEWS TABS */}
        {/* ======================================================== */}
        <div className="mt-16 space-y-6">
          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
            {[
              { id: 'specs', label: 'Technical Specifications' },
              { id: 'description', label: 'Overview & Highlights' },
              { id: 'reviews', label: `Customer Reviews (${reviews.length})` },
              { id: 'warranty', label: 'Warranty & Genuine Seal' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Structured Specs Table */}
          {activeTab === 'specs' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 animate-in fade-in duration-200">
              <h3 className="text-xl font-bold text-white">Full Hardware Specifications</h3>
              
              {product.specs ? (
                <div className="space-y-6">
                  {Object.entries(product.specs).map(([sectionTitle, sectionAttrs]) => (
                    <div key={sectionTitle} className="space-y-3">
                      <h4 className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider pb-1 border-b border-slate-800">
                        {sectionTitle}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {Object.entries(sectionAttrs).map(([k, v]) => (
                          <div key={k} className="flex justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                            <span className="text-slate-400 font-medium">{k}</span>
                            <span className="text-white font-semibold text-right">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-300 leading-relaxed">
                  <p>{product.shortSpecs}</p>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Overview */}
          {activeTab === 'description' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed animate-in fade-in duration-200">
              <h3 className="text-xl font-bold text-white">Product Overview</h3>
              <p>{product.description}</p>
              <p>
                Every item sold by {settings.storeName} is verified authentic and covered by our warranty terms — see the Warranty tab for details specific to this item's condition.
              </p>
            </div>
          )}

          {/* Tab 3: Customer Reviews */}
          {activeTab === 'reviews' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Customer Reviews</h3>
                  <p className="text-xs text-slate-400">Verified buyer ratings from Kenyan customers</p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors"
                >
                  Write a Customer Review
                </button>
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  Be the first to review {product.name}!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-amber-400 gap-0.5">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">{rev.date}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white">"{rev.title}"</h4>
                      <p className="text-xs text-slate-300 leading-relaxed italic">{rev.comment}</p>
                      <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-semibold text-white">{rev.userName} ({rev.userCity})</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Warranty */}
          {activeTab === 'warranty' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-xs text-slate-300 leading-relaxed animate-in fade-in duration-200">
              <h3 className="text-xl font-bold text-white">Warranty & Genuine Authenticity Guarantee</h3>
              <p>
                This unit is covered by <strong className="text-white">{product.warranty}</strong>. If your device develops any manufacturer hardware defect, you can return it to our Kimathi Street Flagship Store or Sarit Centre TechHub for warranty service.
              </p>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* RELATED PRODUCTS */}
        {/* ======================================================== */}
        {related.length > 0 && (
          <div className="mt-16 space-y-6">
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              Customers Also Explored
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Review Submission Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Review {product.name}</h3>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Your Rating:</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className={`p-2 rounded-xl border ${
                        newRating >= star ? 'bg-amber-950 border-amber-500 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-500'
                      }`}
                    >
                      <Star className={`w-5 h-5 ${newRating >= star ? 'fill-amber-400' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Your Name:</label>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="e.g. Brian Otieno"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Town / County:</label>
                  <input
                    type="text"
                    value={newUserCity}
                    onChange={(e) => setNewUserCity(e.target.value)}
                    placeholder="e.g. Nairobi (Westlands)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Review Headline:</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Incredible battery life and blazing fast performance!"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Your Detailed Experience:</label>
                <textarea
                  rows={4}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Describe speed, camera quality, build finish, and delivery speed..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-cyan-600/30"
              >
                Publish Verified Review
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
      <FloatingWhatsApp productContext={product.name} />
      <CompareDrawer />
      <CartDrawer />
    </div>
  );
};
