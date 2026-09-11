import React from 'react';
import {
  Smartphone,
  Laptop,
  Monitor,
  Tablet,
  Headphones,
  Cpu,
  Wifi,
  Gamepad2,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const CategoryGrid: React.FC = () => {
  const { categories } = useStore();

  const iconMap: Record<string, any> = {
    Smartphone,
    Laptop,
    Monitor,
    Tablet,
    Headphones,
    Cpu,
    Wifi,
    Gamepad2
  };

  return (
    <section className="py-12 sm:py-16 bg-slate-950 px-3 sm:px-4 lg:px-5">
      <div className="max-w-[1520px] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider mb-1">
              Engineered Catalog
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Explore by Category
            </h2>
          </div>

          <a
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>View All Tech Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* 8-Grid Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => {
            const Icon = (cat.icon && iconMap[cat.icon]) ? iconMap[cat.icon] : Smartphone;
            return (
              <a
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-cyan-500/50 p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-950/40 hover:-translate-y-1"
              >
                {/* Background image tint */}
                <div className="absolute inset-0 z-0 opacity-15 group-hover:opacity-30 transition-opacity duration-500">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent" />
                </div>

                <div className="relative z-10 space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-600 group-hover:text-white transition-all shadow-md">
                    <Icon className="w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs">
                  <span className="font-mono text-cyan-400 font-bold">
                    {cat.productCount}+ Products
                  </span>
                  <span className="text-slate-400 group-hover:text-white flex items-center gap-1 font-semibold transition-colors">
                    <span>Shop</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};
