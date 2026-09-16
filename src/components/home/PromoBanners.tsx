import React from 'react';
import { ArrowRight, RefreshCw, Cpu, ShieldCheck, Zap } from 'lucide-react';

export const PromoBanners: React.FC = () => {
  return (
    <section className="py-8 bg-slate-950 px-3 sm:px-4 lg:px-5">
      <div className="max-w-[1520px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Banner 1: Device Trade-in & Upgrade */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950 border border-slate-800 p-6 sm:p-8 flex flex-col justify-between group hover:border-cyan-500/50 transition-all shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3 relative z-10 max-w-sm">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 text-[11px] font-bold uppercase tracking-wider">
              <RefreshCw className="w-3.5 h-3.5" /> Device Trade-In Service
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
              Trade-In Your Old Phone or Laptop in Nairobi
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Get instant valuation at our Kimathi Street CBD or Westlands Sarit Centre branches. Offset the cost against a brand-new iPhone 16 or MacBook Pro.
            </p>
          </div>

          <div className="pt-6 relative z-10">
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-cyan-600/20"
            >
              <span>Get Trade-In Valuation</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Banner 2: Custom PC Assembly & Workstations */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950 border border-slate-800 p-6 sm:p-8 flex flex-col justify-between group hover:border-purple-500/50 transition-all shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3 relative z-10 max-w-sm">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950 border border-purple-800 text-purple-400 text-[11px] font-bold uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5" /> Custom PC Builder Service
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
              Custom AI Rigs, 3D Workstations & RTX 4090 Rigs
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Hand-built by certified hardware architects with custom cable management, BIOS thermal profiling, and 24-hour benchmark stress testing.
            </p>
          </div>

          <div className="pt-6 relative z-10">
            <a
              href="/products/nexus-elite-ai-creator-workstation-r16"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-purple-600/20"
            >
              <span>Explore Custom PC Rigs</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
