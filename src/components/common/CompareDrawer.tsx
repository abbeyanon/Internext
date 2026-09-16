import React from 'react';
import { Scale, X, ArrowRight, Trash2 } from 'lucide-react';
import { useCompare } from '../../context/CompareContext';
import { useStore } from '../../context/StoreContext';

export const CompareDrawer: React.FC = () => {
  const { compareList, removeFromCompare, clearCompare, isDrawerOpen, setIsDrawerOpen } = useCompare();
  const { formatPrice } = useStore();

  if (!isDrawerOpen || compareList.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-700/80 shadow-2xl p-4 animate-in slide-in-from-bottom-6 duration-200">
      <div className="max-w-[1520px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Header Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <span>Compare Tech Specifications</span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 text-xs font-mono">
                {compareList.length}/4
              </span>
            </h4>
            <p className="text-xs text-slate-400">Side-by-side technical specs & price diff comparison</p>
          </div>
        </div>

        {/* Selected Products Strip */}
        <div className="flex items-center gap-3 overflow-x-auto max-w-full pb-1">
          {compareList.map((product) => (
            <div
              key={product.id}
              className="relative flex items-center gap-2.5 bg-slate-950/80 border border-slate-800 rounded-xl p-2 pr-8 shrink-0 group"
            >
              <img
                src={product.thumbnail}
                alt={product.name}
                className="w-10 h-10 rounded-lg object-cover bg-slate-900 border border-slate-800"
              />
              <div className="text-left">
                <div className="text-xs font-bold text-white max-w-[120px] truncate">{product.name}</div>
                <div className="text-[11px] font-extrabold text-emerald-400">{formatPrice(product.price)}</div>
              </div>
              <button
                type="button"
                onClick={() => removeFromCompare(product.id)}
                className="absolute right-1.5 top-1.5 p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Remove from comparison"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={clearCompare}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Clear</span>
          </button>

          <a
            href="/compare"
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition-all"
          >
            <span>Compare Now</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <button
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
