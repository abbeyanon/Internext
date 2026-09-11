import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ArrowRight, Shield } from 'lucide-react';

export const BrandShowcase: React.FC = () => {
  const { brands } = useStore();

  return (
    <section className="py-12 bg-[#070b18] border-t border-slate-800/80 px-3 sm:px-4 lg:px-5">
      <div className="max-w-[1520px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
              Authorized Partner Roster
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Official Brands & Hardware Manufacturers
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>100% Factory Sealed Units with Original Warranties</span>
          </div>
        </div>

        {/* Brand Logos Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-3 sm:gap-4">
          {brands.map((brand) => (
            <a
              key={brand.id}
              href={`/shop?brand=${encodeURIComponent(brand.name)}`}
              className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-center group transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-950/20"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center p-2 group-hover:border-cyan-500/40 transition-colors">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="max-w-full max-h-full object-contain filter invert opacity-80 group-hover:opacity-100 transition-opacity"
                  onError={(e) => {
                    // Fallback to text if SVG logo fails
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors block">
                  {brand.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {brand.count} Models
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
