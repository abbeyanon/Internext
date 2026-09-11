import React, { useState, useEffect } from 'react';
import { Flame, Clock, ArrowRight, Zap } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../common/ProductCard';

export const FlashDeals: React.FC = () => {
  const { products } = useStore();

  // 12-hour countdown simulation
  const [timeLeft, setTimeLeft] = useState({
    hours: 11,
    minutes: 42,
    seconds: 19
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const flashDealProducts = products.filter((p) => p.isFlashDeal).slice(0, 4);

  if (flashDealProducts.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 bg-[#070b18] border-t border-b border-slate-800/80 px-3 sm:px-4 lg:px-5">
      <div className="max-w-[1520px] mx-auto">
        {/* Header with Live Countdown */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 p-6 rounded-2xl border border-amber-500/20">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Limited-Time Price Cuts</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Internext Flash Deals
            </h2>
            <p className="text-xs text-slate-400">Exclusive discounts on sealed smartphones, laptops & accessories in Kenya</p>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase mr-2">
              <Clock className="w-4 h-4 text-amber-400" /> Ends In:
            </div>

            <div className="flex items-center gap-1.5 text-center font-mono">
              <div className="bg-slate-950 border border-amber-500/30 rounded-xl px-3 py-1.5 min-w-[44px]">
                <div className="text-lg font-black text-amber-400 leading-tight">
                  {timeLeft.hours.toString().padStart(2, '0')}
                </div>
                <div className="text-[9px] text-slate-400 font-sans uppercase">Hours</div>
              </div>
              <span className="text-amber-400 font-bold">:</span>
              <div className="bg-slate-950 border border-amber-500/30 rounded-xl px-3 py-1.5 min-w-[44px]">
                <div className="text-lg font-black text-amber-400 leading-tight">
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </div>
                <div className="text-[9px] text-slate-400 font-sans uppercase">Mins</div>
              </div>
              <span className="text-amber-400 font-bold">:</span>
              <div className="bg-slate-950 border border-amber-500/30 rounded-xl px-3 py-1.5 min-w-[44px]">
                <div className="text-lg font-black text-amber-400 leading-tight">
                  {timeLeft.seconds.toString().padStart(2, '0')}
                </div>
                <div className="text-[9px] text-slate-400 font-sans uppercase">Secs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {flashDealProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
