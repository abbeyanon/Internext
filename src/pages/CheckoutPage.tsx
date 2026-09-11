import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Truck,
  CreditCard,
  Smartphone,
  Building,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Tag,
  MapPin,
  Loader2,
  CheckCheck,
  XCircle,
  Clock
} from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { FloatingWhatsApp } from '../components/layout/FloatingWhatsApp';
import { MpesaModal } from '../components/checkout/MpesaModal';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { navigate } from '../utils/navigation';

type PaymentStatus = 'idle' | 'initiating' | 'pending' | 'confirmed' | 'failed';

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    subtotal,
    discountAmount,
    deliveryFee,
    total,
    appliedCoupon,
    selectedDeliveryZoneId,
    setSelectedDeliveryZoneId,
    clearCart,
    applyCoupon,
    removeCoupon
  } = useCart();
  const { user } = useAuth();
  const { formatPrice, deliveryZones, settings } = useStore();
  const { showToast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Form State
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const [deliveryAddress, setDeliveryAddress] = useState({
    county: 'Nairobi',
    town: '',
    street: '',
    building: '',
    deliveryNotes: ''
  });

  const [deliveryMethod, setDeliveryMethod] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('M-Pesa STK Push');

  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    rawCardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [activeMpesaOrder, setActiveMpesaOrder] = useState<any | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  if (cart.length === 0 && !activeMpesaOrder) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Header currentPath="/checkout" />
        <div className="flex-1 flex items-center justify-center p-12 text-center">
          <div className="space-y-4 max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 mx-auto flex items-center justify-center text-slate-500">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Your Cart is Empty</h3>
            <p className="text-sm text-slate-400">Add products to your cart before proceeding to checkout.</p>
            <a
              href="/shop"
              className="inline-block px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-bold transition-all"
            >
              Explore Products
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Validation ──────────────────────────────────────────────────────────
  const validateStep = (fromStep: number): boolean => {
    const errs: Record<string, string> = {};

    if (fromStep === 1) {
      if (customerInfo.name.trim().length < 2) errs.name = 'Full name must be at least 2 characters';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) errs.email = 'Enter a valid email address';
      if (customerInfo.phone.trim().replace(/\D/g, '').length < 9) errs.phone = 'Enter a valid phone number';
    }

    if (fromStep === 2) {
      if (!deliveryAddress.town.trim()) errs.town = 'Town / suburb is required';
      if (!deliveryAddress.street.trim()) errs.street = 'Street / road name is required';
    }

    if (fromStep === 3) {
      if (!selectedDeliveryZoneId) errs.zone = 'Please select a shipping method';
    }

    if (fromStep === 4) {
      if (paymentMethod === 'Credit / Debit Card') {
        if (cardInfo.rawCardNumber.length !== 16) errs.cardNumber = 'Card number must be 16 digits';
        if (!cardInfo.cardHolder.trim()) errs.cardHolder = 'Cardholder name is required';
        if (!/^\d{2}\/\d{2}$/.test(cardInfo.expiry)) errs.expiry = 'Expiry must be in MM/YY format';
        if (cardInfo.cvv.length < 3) errs.cvv = 'CVV must be 3 or 4 digits';
      }
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const advanceStep = (targetStep: number) => {
    if (!validateStep(step)) return;
    setCompletedSteps((prev) => new Set([...prev, step]));
    setStep(targetStep as any);
  };

  const goBackStep = (targetStep: number) => {
    setStep(targetStep as any);
  };

  // ── Order Creation ───────────────────────────────────────────────────────
  const handleCreateOrder = async () => {
    setOrderError('');
    setIsSubmitting(true);
    setPaymentStatus('initiating');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: customerInfo,
          items: cart,
          couponCode: appliedCoupon?.code,
          deliveryZoneId: selectedDeliveryZoneId,
          deliveryAddress,
          deliveryMethod,
          paymentMethod
        })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setPaymentStatus('failed');
        setOrderError(data.message || 'Unable to place your order. Please try again.');
        showToast(data.message || 'Unable to place your order', 'error');
        return;
      }

      if (paymentMethod === 'M-Pesa STK Push') {
        setPaymentStatus('pending');
        setActiveMpesaOrder(data.order);
      } else {
        setPaymentStatus('confirmed');
        clearCart();
        showToast(`Order ${data.order.orderNumber} placed successfully!`, 'success');
        setTimeout(() => {
          navigate(`/order-confirmation?orderNumber=${data.order.orderNumber}`);
        }, 800);
      }
    } catch {
      setPaymentStatus('failed');
      setOrderError('Unable to reach the server. Please check your connection and try again.');
      showToast('Unable to reach the server. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMpesaSuccess = (verifiedOrder: any) => {
    setPaymentStatus('confirmed');
    clearCart();
    setActiveMpesaOrder(null);
    navigate(`/order-confirmation?orderNumber=${verifiedOrder.orderNumber}`);
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    await applyCoupon(couponInput.trim().toUpperCase());
    setCouponLoading(false);
    setCouponInput('');
  };

  // ── Stepper ──────────────────────────────────────────────────────────────
  const STEPS = [
    { num: 1, label: 'Contact' },
    { num: 2, label: 'Address' },
    { num: 3, label: 'Shipping' },
    { num: 4, label: 'Payment' },
    { num: 5, label: 'Review' }
  ];

  const inputBase =
    'w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all';

  const fieldErr = (field: string) =>
    fieldErrors[field] ? 'border-rose-600 focus:border-rose-500 focus:ring-rose-500/20' : '';

  const FieldError = ({ field }: { field: string }) =>
    fieldErrors[field] ? (
      <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1">
        <AlertCircle className="w-3 h-3 shrink-0" />
        {fieldErrors[field]}
      </p>
    ) : null;

  // ── Payment Status Banner ────────────────────────────────────────────────
  const PaymentStatusBanner = () => {
    if (paymentStatus === 'idle') return null;
    const config: Record<PaymentStatus, { icon: React.ReactNode; text: string; className: string }> = {
      idle: { icon: null, text: '', className: '' },
      initiating: {
        icon: <Loader2 className="w-5 h-5 animate-spin text-blue-400" />,
        text: 'Processing your payment securely…',
        className: 'bg-blue-950/60 border-blue-700/50 text-blue-300'
      },
      pending: {
        icon: <Clock className="w-5 h-5 text-amber-400 animate-pulse" />,
        text: 'Waiting for M-Pesa confirmation on your phone…',
        className: 'bg-amber-950/60 border-amber-700/50 text-amber-300'
      },
      confirmed: {
        icon: <CheckCheck className="w-5 h-5 text-emerald-400" />,
        text: 'Payment confirmed! Redirecting to your order…',
        className: 'bg-emerald-950/60 border-emerald-700/50 text-emerald-300'
      },
      failed: {
        icon: <XCircle className="w-5 h-5 text-rose-400" />,
        text: 'Payment failed. Please review your details and try again.',
        className: 'bg-rose-950/60 border-rose-700/50 text-rose-300'
      }
    };
    const c = config[paymentStatus];
    return (
      <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border font-medium text-sm ${c.className}`}>
        {c.icon}
        <span>{c.text}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-600 selection:text-white">
      <Header currentPath="/checkout" />

      {/* Progress Stepper */}
      <div className="bg-[#070b18] border-b border-slate-800 py-6 px-3 sm:px-4 lg:px-5">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => {
              const isCompleted = completedSteps.has(s.num);
              const isCurrent = step === s.num;
              const isFuture = !isCompleted && !isCurrent;

              return (
                <React.Fragment key={s.num}>
                  <button
                    type="button"
                    onClick={() => isCompleted && goBackStep(s.num)}
                    disabled={isFuture}
                    className={`flex items-center gap-2 text-xs font-bold transition-colors ${
                      isCurrent
                        ? 'text-cyan-400'
                        : isCompleted
                        ? 'text-emerald-400 cursor-pointer hover:text-emerald-300'
                        : 'text-slate-600 cursor-not-allowed'
                    }`}
                    title={isFuture ? 'Complete previous steps first' : isCompleted ? 'Click to edit' : ''}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                        isCurrent
                          ? 'bg-cyan-600 text-white ring-4 ring-cyan-600/25'
                          : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-600'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                    </div>
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 rounded transition-colors ${
                        completedSteps.has(s.num) ? 'bg-emerald-600' : 'bg-slate-800'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Checkout Area */}
      <div className="max-w-[1520px] mx-auto px-3 sm:px-4 lg:px-5 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Step Form */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">

            {/* ── STEP 1: CUSTOMER DETAILS ── */}
            {step === 1 && (
              <div className="space-y-5 animate-fadeInUp">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-xl font-bold text-white">Step 1 — Your Contact Details</h2>
                  <p className="text-sm text-slate-400 mt-1">Where should we send your tracking updates and digital receipt?</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">Full Name <span className="text-rose-400">*</span></label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      placeholder="e.g. Dennis Mwangi"
                      className={`${inputBase} ${fieldErr('name')}`}
                      required
                    />
                    <FieldError field="name" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">Email Address <span className="text-rose-400">*</span></label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      placeholder="e.g. dennis@gmail.com"
                      className={`${inputBase} ${fieldErr('email')}`}
                      required
                    />
                    <FieldError field="email" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">Phone Number <span className="text-rose-400">*</span></label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      placeholder="e.g. 0712345678"
                      className={`${inputBase} font-mono ${fieldErr('phone')}`}
                      required
                    />
                    <FieldError field="phone" />
                    <p className="text-slate-500 text-xs mt-1">Used for M-Pesa STK Push & rider contact</p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => advanceStep(2)}
                    className="px-8 py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition-all"
                  >
                    <span>Continue to Delivery Address</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: DELIVERY ADDRESS ── */}
            {step === 2 && (
              <div className="space-y-5 animate-fadeInUp">
                <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Step 2 — Delivery Address</h2>
                    <p className="text-sm text-slate-400 mt-1">Specify your exact delivery location in Kenya</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => goBackStep(1)}
                    className="text-sm text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 font-semibold transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">County / Region</label>
                    <select
                      value={deliveryAddress.county}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, county: e.target.value })}
                      className={inputBase}
                    >
                      <option value="Nairobi">Nairobi</option>
                      <option value="Kiambu">Kiambu</option>
                      <option value="Mombasa">Mombasa</option>
                      <option value="Nakuru">Nakuru</option>
                      <option value="Eldoret (Uasin Gishu)">Eldoret (Uasin Gishu)</option>
                      <option value="Kisumu">Kisumu</option>
                      <option value="Machakos">Machakos</option>
                      <option value="Kajiado">Kajiado</option>
                      <option value="Nyeri">Nyeri</option>
                      <option value="Meru">Meru</option>
                      <option value="Kakamega">Kakamega</option>
                      <option value="Other Counties">Other Counties (G4S / Fargo Courier)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">Town / Suburb <span className="text-rose-400">*</span></label>
                    <input
                      type="text"
                      value={deliveryAddress.town}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, town: e.target.value })}
                      placeholder="e.g. Kilimani / Westlands / Nyali"
                      className={`${inputBase} ${fieldErr('town')}`}
                      required
                    />
                    <FieldError field="town" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">Street / Road Name <span className="text-rose-400">*</span></label>
                    <input
                      type="text"
                      value={deliveryAddress.street}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                      placeholder="e.g. Argwings Kodhek Road"
                      className={`${inputBase} ${fieldErr('street')}`}
                      required
                    />
                    <FieldError field="street" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">Building & Apartment No.</label>
                    <input
                      type="text"
                      value={deliveryAddress.building}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, building: e.target.value })}
                      placeholder="e.g. Silverstone Towers, 4th Floor, Apt 4B"
                      className={inputBase}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">Rider Delivery Instructions (Optional)</label>
                    <textarea
                      rows={2}
                      value={deliveryAddress.deliveryNotes}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, deliveryNotes: e.target.value })}
                      placeholder="e.g. Leave with security guard or call on arrival…"
                      className={`${inputBase} resize-none`}
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => goBackStep(1)}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-bold transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => advanceStep(3)}
                    className="px-8 py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition-all"
                  >
                    <span>Continue to Shipping</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: DELIVERY METHOD ── */}
            {step === 3 && (
              <div className="space-y-5 animate-fadeInUp">
                <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Step 3 — Select Delivery Speed</h2>
                    <p className="text-sm text-slate-400 mt-1">Choose courier speed or free physical store pickup</p>
                  </div>
                  <button type="button" onClick={() => goBackStep(2)} className="text-sm text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 font-semibold transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                </div>

                {fieldErrors.zone && (
                  <div className="bg-rose-950/50 border border-rose-800 text-rose-300 rounded-xl px-4 py-3 flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {fieldErrors.zone}
                  </div>
                )}

                <div className="space-y-3">
                  {deliveryZones.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center text-slate-400 text-sm">
                      <Truck className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                      <p>Delivery options are loading. Please wait a moment or refresh the page.</p>
                    </div>
                  ) : (
                    deliveryZones.map((zone) => (
                      <label
                        key={zone.id}
                        onClick={() => {
                          setSelectedDeliveryZoneId(zone.id);
                          setDeliveryMethod(zone.name);
                          setFieldErrors((prev) => ({ ...prev, zone: '' }));
                        }}
                        className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                          selectedDeliveryZoneId === zone.id
                            ? 'bg-cyan-950/60 border-cyan-500 ring-1 ring-cyan-500 text-white'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                              selectedDeliveryZoneId === zone.id ? 'border-cyan-500 bg-cyan-500' : 'border-slate-600'
                            }`}
                          >
                            {selectedDeliveryZoneId === zone.id && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-white">{zone.name}</div>
                            <div className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                              <Truck className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Estimated: {zone.estimatedTime}</span>
                            </div>
                          </div>
                        </div>
                        <div className="font-black text-sm text-right">
                          {zone.fee === 0 ? (
                            <span className="text-emerald-400">FREE</span>
                          ) : (
                            <span className="text-white">{formatPrice(zone.fee)}</span>
                          )}
                        </div>
                      </label>
                    ))
                  )}
                </div>

                <div className="flex justify-between pt-2">
                  <button type="button" onClick={() => goBackStep(2)} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-bold transition-all">Back</button>
                  <button type="button" onClick={() => advanceStep(4)} className="px-8 py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition-all">
                    <span>Continue to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 4: PAYMENT ── */}
            {step === 4 && (
              <div className="space-y-5 animate-fadeInUp">
                <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Step 4 — Payment Method</h2>
                    <p className="text-sm text-slate-400 mt-1">Secure, encrypted payment options in Kenyan Shillings</p>
                  </div>
                  <button type="button" onClick={() => goBackStep(3)} className="text-sm text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 font-semibold transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* M-Pesa */}
                  <label
                    onClick={() => setPaymentMethod('M-Pesa STK Push')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                      paymentMethod === 'M-Pesa STK Push'
                        ? 'bg-emerald-950/60 border-emerald-500 ring-1 ring-emerald-500'
                        : 'bg-slate-950 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-white">
                        <Smartphone className="w-5 h-5 text-emerald-400" />
                        <span>M-Pesa STK Push</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-extrabold text-[10px] border border-emerald-800">INSTANT</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Automated Safaricom prompt sent to your phone. Enter your M-PIN to authenticate instantly.
                    </p>
                  </label>

                  {/* Card */}
                  <label
                    onClick={() => setPaymentMethod('Credit / Debit Card')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                      paymentMethod === 'Credit / Debit Card'
                        ? 'bg-cyan-950/60 border-cyan-500 ring-1 ring-cyan-500'
                        : 'bg-slate-950 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-white">
                        <CreditCard className="w-5 h-5 text-cyan-400" />
                        <span>Visa / MasterCard</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold text-[10px]">CARD</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      256-bit SSL encrypted card transaction with 3D Secure 2.0 fraud defense.
                    </p>
                  </label>

                  {/* Bank Wire */}
                  <label
                    onClick={() => setPaymentMethod('Bank Wire / RTGS')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                      paymentMethod === 'Bank Wire / RTGS'
                        ? 'bg-blue-950/60 border-blue-500 ring-1 ring-blue-500'
                        : 'bg-slate-950 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-white">
                        <Building className="w-5 h-5 text-blue-400" />
                        <span>Bank Wire / RTGS</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold text-[10px]">CORPORATE</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Transfer to KCB / Equity Bank Kenya. Account details provided on your invoice.
                    </p>
                  </label>

                  {/* Cash on Delivery */}
                  <label
                    onClick={() => setPaymentMethod('Cash on Delivery')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                      paymentMethod === 'Cash on Delivery'
                        ? 'bg-amber-950/60 border-amber-500 ring-1 ring-amber-500'
                        : 'bg-slate-950 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-white">
                        <ShieldCheck className="w-5 h-5 text-amber-400" />
                        <span>Pay on Delivery</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-bold text-[10px]">NAIROBI ONLY</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Pay rider via M-Pesa or cash upon inspection, within Nairobi Metro coverage.
                    </p>
                  </label>
                </div>

                {/* Card Details */}
                {paymentMethod === 'Credit / Debit Card' && (
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
                      <Lock className="w-4 h-4 text-cyan-400" />
                      <span>Secure Card Details (SSL Encrypted)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-semibold text-slate-300 mb-1.5">Cardholder Name <span className="text-rose-400">*</span></label>
                        <input
                          type="text"
                          value={cardInfo.cardHolder}
                          onChange={(e) => setCardInfo({ ...cardInfo, cardHolder: e.target.value })}
                          placeholder="Name as it appears on card"
                          className={`${inputBase} ${fieldErr('cardHolder')}`}
                        />
                        <FieldError field="cardHolder" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-semibold text-slate-300 mb-1.5">Card Number <span className="text-rose-400">*</span></label>
                        <input
                          type="text"
                          value={cardInfo.cardNumber}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
                            const formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
                            setCardInfo({ ...cardInfo, cardNumber: formatted, rawCardNumber: raw });
                          }}
                          placeholder="1234 5678 9012 3456"
                          className={`${inputBase} font-mono tracking-widest ${fieldErr('cardNumber')}`}
                          maxLength={19}
                        />
                        <FieldError field="cardNumber" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-1.5">Expiry (MM/YY) <span className="text-rose-400">*</span></label>
                        <input
                          type="text"
                          value={cardInfo.expiry}
                          onChange={(e) => {
                            let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                            if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
                            setCardInfo({ ...cardInfo, expiry: v });
                          }}
                          placeholder="MM/YY"
                          className={`${inputBase} font-mono ${fieldErr('expiry')}`}
                          maxLength={5}
                        />
                        <FieldError field="expiry" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-1.5">CVV / CVC <span className="text-rose-400">*</span></label>
                        <input
                          type="password"
                          value={cardInfo.cvv}
                          onChange={(e) => setCardInfo({ ...cardInfo, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                          placeholder="•••"
                          className={`${inputBase} font-mono ${fieldErr('cvv')}`}
                          maxLength={4}
                        />
                        <FieldError field="cvv" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-2">
                  <button type="button" onClick={() => goBackStep(3)} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-bold transition-all">Back</button>
                  <button type="button" onClick={() => advanceStep(5)} className="px-8 py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition-all">
                    <span>Review Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 5: ORDER REVIEW ── */}
            {step === 5 && (
              <div className="space-y-6 animate-fadeInUp">
                <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Step 5 — Final Order Review</h2>
                    <p className="text-sm text-slate-400 mt-1">Please verify your items, address, and payment method</p>
                  </div>
                  <button type="button" onClick={() => goBackStep(4)} className="text-sm text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 font-semibold transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                </div>

                {/* Summary Boxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Customer & Contact</div>
                    <div className="font-extrabold text-white">{customerInfo.name}</div>
                    <div className="text-slate-400 text-sm">{customerInfo.email}</div>
                    <div className="text-slate-400 text-sm font-mono">{customerInfo.phone}</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Delivery Destination</div>
                    <div className="text-slate-300 text-sm leading-relaxed">
                      {deliveryAddress.building && `${deliveryAddress.building}, `}
                      {deliveryAddress.street && `${deliveryAddress.street}, `}
                      <strong className="text-white">{deliveryAddress.town}, {deliveryAddress.county}</strong>
                    </div>
                    <div className="text-emerald-400 font-semibold text-sm">{deliveryMethod || 'Standard Delivery'}</div>
                  </div>
                </div>

                {/* Items List */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Items Ordered ({cart.length})
                  </div>
                  <div className="divide-y divide-slate-800/80">
                    {cart.map((item, idx) => (
                      <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={item.thumbnail} alt="" className="w-11 h-11 rounded-lg object-contain bg-slate-900 border border-slate-700" />
                          <div>
                            <div className="font-bold text-white text-sm truncate max-w-xs">{item.name}</div>
                            <div className="text-xs text-slate-400">Qty: {item.quantity} × {formatPrice(item.price)}</div>
                          </div>
                        </div>
                        <div className="font-black text-emerald-400 text-sm">{formatPrice(item.price * item.quantity)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Status Banner */}
                <PaymentStatusBanner />

                {/* Error */}
                {orderError && paymentStatus === 'failed' && (
                  <div className="p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-sm flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{orderError}</span>
                  </div>
                )}

                {/* Place Order CTA */}
                <div className="pt-2 space-y-3">
                  <button
                    type="button"
                    onClick={handleCreateOrder}
                    disabled={isSubmitting || paymentStatus === 'confirmed'}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 hover:opacity-90 disabled:opacity-50 text-white font-black text-base rounded-2xl flex items-center justify-center gap-3 shadow-2xl shadow-cyan-600/40 transition-all hover:scale-[1.005] active:scale-[0.998]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Placing Order…</span>
                      </>
                    ) : paymentStatus === 'confirmed' ? (
                      <>
                        <CheckCheck className="w-5 h-5" />
                        <span>Order Confirmed!</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        <span>Place Order & Pay {formatPrice(total)}</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>By placing your order you agree to {settings.storeName}'s delivery & warranty terms.</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Order Summary Sidebar */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
              <h3 className="text-base font-extrabold text-white">Order Summary</h3>

              {/* Cart Items Preview */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <img src={item.thumbnail} alt="" className="w-10 h-10 rounded-lg object-contain bg-slate-800 border border-slate-700 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{item.name}</div>
                      <div className="text-[11px] text-slate-400">Qty: {item.quantity}</div>
                    </div>
                    <div className="text-xs font-bold text-emerald-400 shrink-0">{formatPrice(item.price * item.quantity)}</div>
                  </div>
                ))}
              </div>

              {/* Coupon Code Input */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Coupon code"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono tracking-wider"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                    className="px-4 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all"
                  >
                    {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                  </button>
                </div>
                {appliedCoupon && (
                  <div className="flex items-center justify-between text-xs bg-emerald-950/40 border border-emerald-800/50 rounded-xl px-3 py-2">
                    <span className="text-emerald-300 font-bold">✓ {appliedCoupon.code}</span>
                    <button type="button" onClick={removeCoupon} className="text-slate-400 hover:text-rose-400 transition-colors">Remove</button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-sm text-slate-300 pt-2 border-t border-slate-800">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold text-white">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Coupon Discount:</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="font-bold text-white">{deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>VAT (16%, incl.):</span>
                  <span>{formatPrice(Math.round((subtotal * 16) / 116))}</span>
                </div>
                <div className="flex justify-between text-lg font-black text-white pt-3 border-t border-slate-800">
                  <span>Total Due:</span>
                  <span className="text-cyan-400">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Official Warranty Guarantee
                </div>
                <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold">
                  <Lock className="w-3.5 h-3.5" /> 256-bit SSL Encrypted Checkout
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Protected by Kenya Consumer Protection Regulations with manufacturer repair seals.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* M-Pesa STK Push Modal */}
      {activeMpesaOrder && (
        <MpesaModal
          orderId={activeMpesaOrder.id}
          orderNumber={activeMpesaOrder.orderNumber}
          phone={customerInfo.phone}
          amount={activeMpesaOrder.total}
          onSuccess={handleMpesaSuccess}
          onCancel={() => { setActiveMpesaOrder(null); setPaymentStatus('idle'); }}
        />
      )}

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};
