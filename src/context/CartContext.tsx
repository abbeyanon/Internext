import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { CartItem, Product, ProductVariant, Coupon } from '../types';
import { useToast } from './ToastContext';
import { useStore } from './StoreContext';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  taxAmount: number;
  total: number;
  appliedCoupon: Coupon | null;
  selectedDeliveryZoneId: string;
  setSelectedDeliveryZoneId: (zoneId: string) => void;
  addToCart: (product: Product, variant?: ProductVariant | null, quantity?: number) => void;
  removeFromCart: (productId: string, variantId?: string | null) => void;
  updateQuantity: (productId: string, variantId: string | null | undefined, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function readGuestCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem('nexus_cart') || '[]');
  } catch {
    return [];
  }
}

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const { deliveryZones } = useStore();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);
  const [selectedDeliveryZoneId, setSelectedDeliveryZoneId] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [cart, setCart] = useState<CartItem[]>(() => readGuestCart());
  const hasMergedRef = useRef(false);

  // Guests: persist to localStorage as before.
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('nexus_cart', JSON.stringify(cart));
    }
  }, [cart, isAuthenticated]);

  // Authenticated users: cart lives server-side (server/routes/cartRoutes.js).
  // On login, merge whatever was in the guest cart into the account cart once.
  useEffect(() => {
    if (authLoading) return;

    if (isAuthenticated && !hasMergedRef.current) {
      hasMergedRef.current = true;
      const guestItems = readGuestCart();
      const mergeOrFetch = guestItems.length
        ? fetch('/api/cart/merge', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: guestItems }) })
        : fetch('/api/cart');

      mergeOrFetch
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.cart) {
            setCart(data.cart);
            localStorage.removeItem('nexus_cart');
          }
        })
        .catch(() => {});
    } else if (!isAuthenticated) {
      hasMergedRef.current = false;
    }
  }, [isAuthenticated, authLoading]);

  const addToCart = async (product: Product, variant?: ProductVariant | null, quantity: number = 1) => {
    const variantId = variant?.id || null;
    const maxStock = variant?.stock !== undefined ? variant.stock : product.stock;

    if (maxStock <= 0) {
      showToast(`${product.name} is currently out of stock`, 'error');
      return;
    }

    if (isAuthenticated) {
      try {
        const res = await fetch('/api/cart/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id, variantId, quantity })
        });
        const data = await res.json();
        if (!res.ok) {
          showToast(data.message || 'Unable to add item to cart', 'error');
          return;
        }
        setCart(data.cart);
        showToast(`Added ${product.name} to cart!`, 'success');
      } catch {
        showToast('Unable to reach the server. Please try again.', 'error');
      }
      return;
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.productId === product.id && item.variantId === variantId);
      if (existingIndex > -1) {
        const newQty = Math.min(prev[existingIndex].quantity + quantity, maxStock);
        const updated = [...prev];
        updated[existingIndex].quantity = newQty;
        showToast(`Updated ${product.name} quantity to ${newQty}`, 'success');
        return updated;
      }
      showToast(`Added ${product.name} to cart!`, 'success');
      return [
        ...prev,
        {
          productId: product.id,
          variantId,
          name: product.name,
          variantName: variant?.name || null,
          sku: variant?.sku || product.sku,
          price: variant?.price || product.price,
          compareAtPrice: product.compareAtPrice,
          quantity: Math.min(quantity, maxStock),
          thumbnail: product.thumbnail,
          stock: maxStock
        }
      ];
    });
  };

  const removeFromCart = async (productId: string, variantId?: string | null) => {
    if (isAuthenticated) {
      try {
        const res = await fetch('/api/cart/items', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, variantId: variantId || null })
        });
        const data = await res.json();
        if (res.ok) setCart(data.cart);
      } catch {
        showToast('Unable to reach the server. Please try again.', 'error');
        return;
      }
    } else {
      setCart((prev) => prev.filter((item) => !(item.productId === productId && item.variantId === (variantId || null))));
    }
    showToast('Item removed from cart', 'info');
  };

  const updateQuantity = async (productId: string, variantId: string | null | undefined, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }

    if (isAuthenticated) {
      try {
        const res = await fetch('/api/cart/items', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, variantId: variantId || null, quantity })
        });
        const data = await res.json();
        if (!res.ok) {
          showToast(data.message || 'Unable to update quantity — not enough stock', 'error');
          return;
        }
        setCart(data.cart);
      } catch {
        showToast('Unable to reach the server. Please try again.', 'error');
      }
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId && item.variantId === (variantId || null)) {
          const clamped = Math.min(quantity, item.stock);
          return { ...item, quantity: clamped };
        }
        return item;
      })
    );
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await fetch('/api/cart', { method: 'DELETE' });
      } catch {
        // best-effort — local state still clears below
      }
    }
    setCart([]);
    setAppliedCoupon(null);
  };

  // Calculations
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Delivery Fee Calculation
  let deliveryFee = 350;
  const currentZone = deliveryZones.find((z) => z.id === selectedDeliveryZoneId) || deliveryZones[0];
  if (currentZone) {
    deliveryFee = currentZone.freeThreshold && subtotal >= currentZone.freeThreshold ? 0 : currentZone.fee;
  }

  // Coupon Discount Calculation — display-only estimate; the server always
  // recomputes this authoritatively at order creation (server/repositories/ordersRepo.js).
  let discountAmount = 0;
  if (appliedCoupon && subtotal >= (appliedCoupon.minOrderAmount || 0)) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = (subtotal * appliedCoupon.discountValue) / 100;
      if (appliedCoupon.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, appliedCoupon.maxDiscountAmount);
      }
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  // Kenya VAT 16% (Inclusive in prices)
  const taxAmount = Math.round((taxableAmount * 16) / 116);
  const total = Math.max(0, taxableAmount + deliveryFee);

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, orderAmount: subtotal })
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon({
          code: data.code,
          discountType: data.discountType,
          discountValue: data.discountValue,
          description: data.description,
          isActive: true
        });
        showToast(`Coupon ${data.code} applied: -KES ${Math.round(data.calculatedDiscount).toLocaleString()}`, 'success');
        return { success: true, message: 'Coupon applied successfully!' };
      }
      showToast(data.message || 'Invalid coupon', 'error');
      return { success: false, message: data.message || 'Invalid coupon' };
    } catch {
      showToast('Unable to reach the server. Please try again.', 'error');
      return { success: false, message: 'Unable to reach the server. Please try again.' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed', 'info');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        subtotal,
        discountAmount,
        deliveryFee,
        taxAmount,
        total,
        appliedCoupon,
        selectedDeliveryZoneId: selectedDeliveryZoneId || currentZone?.id || '',
        setSelectedDeliveryZoneId,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        isCartDrawerOpen,
        setIsCartDrawerOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
