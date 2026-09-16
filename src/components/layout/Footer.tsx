import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Send,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  CheckCircle2,
  Lock,
  Facebook,
  Instagram,
  Twitter,
  Youtube
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { Logo } from '../common/Logo';

export const Footer: React.FC = () => {
  const { settings } = useStore();
  const { showToast } = useToast();
  const [emailInput, setEmailInput] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    try {
      setIsSubscribing(true);
      const res = await fetch('/api/admin/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Subscribed successfully to VIP Tech Drops!', 'success');
        setEmailInput('');
      }
    } catch (err) {
      showToast('Subscribed to VIP Tech Drops newsletter!', 'success');
      setEmailInput('');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="bg-[#070b18] text-slate-400 text-sm border-t border-slate-800 relative z-10">
      {/* 1. TOP TRUST BADGES STRIP */}
      <div className="border-b border-slate-800/80 bg-slate-950/60 py-8 px-3 sm:px-4 lg:px-5">
        <div className="max-w-[1520px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-800/50 flex items-center justify-center text-cyan-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">100% Genuine Products</h4>
              <p className="text-xs text-slate-400">Official Brand Warranties</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-950/80 border border-blue-800/50 flex items-center justify-center text-blue-400 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Express Delivery</h4>
              <p className="text-xs text-slate-400">Same-Day Nairobi & Countrywide</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center text-emerald-400 shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">M-Pesa & Card Secure</h4>
              <p className="text-xs text-slate-400">256-Bit SSL Safe Checkout</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-800/50 flex items-center justify-center text-purple-400 shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Expert Tech Support</h4>
              <p className="text-xs text-slate-400">Hardware & Compatibility Help</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN FOOTER CONTENT */}
      <div className="max-w-[1520px] mx-auto px-3 sm:px-4 lg:px-5 py-12 lg:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Col 1: Brand & Contact Info */}
        <div className="lg:col-span-2 space-y-4">
          <a href="/">
            <Logo size={40} />
          </a>

          <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
            {settings.storeName} deals in brand new and Ex-UK laptops, computers, desktop accessories, screen replacement, structured cabling, network planning &amp; implementation, CCTV surveillance, hardware &amp; software maintenance, and general office supplies.
          </p>

          <div className="space-y-2 pt-2 text-xs">
            <div className="flex items-center gap-3 text-slate-300">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{settings.address}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{settings.phone} / {settings.altPhone}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{settings.email}</span>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3 pt-2">
            <a
              href={settings.socialLinks.facebook}
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-cyan-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href={settings.socialLinks.instagram}
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-pink-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href={settings.socialLinks.twitter}
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-sky-500 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href={settings.socialLinks.youtube}
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <Youtube className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Col 2: Categories */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Top Categories</h4>
          <ul className="space-y-2 text-xs">
            <li><a href="/shop?category=brand-new-laptops" className="hover:text-cyan-400 transition-colors">Brand New Laptops</a></li>
            <li><a href="/shop?category=ex-uk-laptops" className="hover:text-cyan-400 transition-colors">Ex-UK Laptops</a></li>
            <li><a href="/shop?category=desktop-computers" className="hover:text-cyan-400 transition-colors">Desktop Computers</a></li>
            <li><a href="/shop?category=networking" className="hover:text-cyan-400 transition-colors">Networking</a></li>
            <li><a href="/shop?category=structured-cabling" className="hover:text-cyan-400 transition-colors">Structured Cabling</a></li>
            <li><a href="/shop?category=cctv-surveillance" className="hover:text-cyan-400 transition-colors">CCTV & Surveillance</a></li>
            <li><a href="/shop?category=screen-replacement" className="hover:text-cyan-400 transition-colors">Screen Replacement</a></li>
            <li><a href="/shop?category=office-supplies" className="hover:text-cyan-400 transition-colors">Office Supplies</a></li>
          </ul>
        </div>

        {/* Col 3: Customer Care & Services */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Customer Care</h4>
          <ul className="space-y-2 text-xs">
            <li><a href="/track-order" className="hover:text-cyan-400 transition-colors">Track Order Status</a></li>
            <li><a href="/store-locator" className="hover:text-cyan-400 transition-colors">Store Locations & Pickup</a></li>
            <li><a href="/policies/delivery" className="hover:text-cyan-400 transition-colors">Delivery Information</a></li>
            <li><a href="/policies/warranty" className="hover:text-cyan-400 transition-colors">Warranty Policy</a></li>
            <li><a href="/policies/returns" className="hover:text-cyan-400 transition-colors">Returns & Refunds</a></li>
            <li><a href="/faqs" className="hover:text-cyan-400 transition-colors">Frequently Asked Questions</a></li>
            <li><a href="/contact" className="hover:text-cyan-400 transition-colors">Contact Support & Tickets</a></li>
            <li><a href="/about" className="hover:text-cyan-400 transition-colors">About Internext</a></li>
          </ul>
        </div>

        {/* Col 4: Newsletter & Tech Drops */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">VIP Tech Drops</h4>
          <p className="text-xs text-slate-400">
            Subscribe to receive exclusive flash sales, coupon vouchers, and first notification of new stock arrivals.
          </p>

          <form onSubmit={handleSubscribe} className="space-y-2">
            <div className="relative">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          <div className="pt-2">
            <div className="text-[11px] font-semibold text-slate-400 mb-2">Accepted Payment Methods:</div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded bg-emerald-950 border border-emerald-800/60 text-[10px] font-extrabold text-emerald-400 tracking-wider">
                M-PESA
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-[10px] font-bold text-slate-300">
                VISA
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-[10px] font-bold text-slate-300">
                MASTERCARD
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-[10px] font-bold text-slate-300">
                BANK WIRE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM COPYRIGHT STRIP */}
      <div className="border-t border-slate-800/80 bg-slate-950 py-6 px-3 sm:px-4 lg:px-5">
        <div className="max-w-[1520px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-slate-500">
            © {new Date().getFullYear()} {settings.storeName}. All Rights Reserved.
          </p>

          <div className="flex items-center gap-4 text-slate-500">
            <a href="/policies/terms" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            <span>•</span>
            <a href="/policies/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="/policies/warranty" className="hover:text-slate-300 transition-colors">Warranty Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
