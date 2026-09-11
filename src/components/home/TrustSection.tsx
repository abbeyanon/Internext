import React from 'react';
import { ShieldCheck, Truck, Lock, RotateCcw, Headphones, Award } from 'lucide-react';

export const TrustSection: React.FC = () => {
  return (
    <section className="py-12 bg-[#070b18] border-t border-slate-800 px-3 sm:px-4 lg:px-5">
      <div className="max-w-[1520px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-800/50 flex items-center justify-center text-cyan-400 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Direct Brand Warranty</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                All Apple, Samsung, Dell, and HP products come with official manufacturer warranties honored in Kenya with full repair coverage.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center text-emerald-400 shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Safaricom M-Pesa STK Push</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Seamless, fraud-protected instant checkout with automated PIN confirmation and digital PDF invoices emailed immediately.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-950/80 border border-blue-800/50 flex items-center justify-center text-blue-400 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Rapid Regional Logistics</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Same-day 2-hour courier across Nairobi Metro, and insured 24-hour delivery via G4S / Fargo Courier to all 47 counties in Kenya.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
