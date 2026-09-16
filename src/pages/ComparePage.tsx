import React, { useState } from 'react';
import {
  Scale,
  X,
  Plus,
  ShoppingCart,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Trash2,
  Star
} from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { FloatingWhatsApp } from '../components/layout/FloatingWhatsApp';
import { CartDrawer } from '../components/checkout/CartDrawer';
import { useCompare } from '../context/CompareContext';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

export const ComparePage: React.FC = () => {
  const { compareList, removeFromCompare, clearCompare, addToCompare } = useCompare();
  const { products, formatPrice } = useStore();
  const { addToCart } = useCart();
  const [highlightDifferences, setHighlightDifferences] = useState<boolean>(false);
  const [searchPicker, setSearchPicker] = useState<string>('');

  const availableToAdd = products.filter(
    (p) => !compareList.some((c) => c.id === p.id)
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-600 selection:text-white">
      <Header currentPath="/compare" />

      {/* Header */}
      <div className="bg-[#070b18] border-b border-slate-800 py-8 px-3 sm:px-4 lg:px-5">
        <div className="max-w-[1520px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <a href="/" className="hover:text-cyan-400">Home</a>
              <span>/</span>
              <a href="/shop" className="hover:text-cyan-400">Shop</a>
              <span>/</span>
              <span className="text-white font-medium">Product Comparison</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <Scale className="w-7 h-7 text-cyan-400" />
              <span>Side-by-Side Specification Matrix</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Comparing {compareList.length} of 4 maximum devices
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Highlight Differences toggle */}
            <label className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={highlightDifferences}
                onChange={(e) => setHighlightDifferences(e.target.checked)}
                className="rounded bg-slate-800 text-cyan-600 focus:ring-cyan-500"
              />
              <span>Highlight Differences</span>
            </label>

            {compareList.length > 0 && (
              <button
                type="button"
                onClick={clearCompare}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-rose-400 border border-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="max-w-[1520px] mx-auto px-3 sm:px-4 lg:px-5 py-8 flex-1 w-full overflow-x-auto">
        {compareList.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 p-8 space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-slate-500">
              <Scale className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">No products in comparison list</h3>
            <p className="text-xs text-slate-400">
              Select products across smartphones, laptops or components to compare specifications side-by-side.
            </p>
            <a
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        ) : (
          <div className="min-w-[700px] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80">
                  <th className="p-4 w-48 text-slate-400 font-bold uppercase tracking-wider">
                    Specification
                  </th>
                  {compareList.map((product) => (
                    <th key={product.id} className="p-4 w-64 align-top">
                      <div className="relative space-y-3">
                        <button
                          type="button"
                          onClick={() => removeFromCompare(product.id)}
                          className="absolute -top-1 -right-1 p-1 rounded-md bg-slate-800 text-slate-400 hover:text-rose-400"
                          title="Remove"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>

                        <img
                          src={product.thumbnail}
                          alt={product.name}
                          className="w-28 h-28 mx-auto object-contain rounded-xl bg-slate-950 p-2 border border-slate-800"
                        />

                        <div>
                          <div className="text-[10px] font-bold text-cyan-400 uppercase">{product.brand}</div>
                          <a
                            href={`/products/${product.slug}`}
                            className="font-bold text-white hover:text-cyan-300 line-clamp-2 leading-snug"
                          >
                            {product.name}
                          </a>
                        </div>

                        <div className="text-base font-black text-emerald-400">
                          {formatPrice(product.price)}
                        </div>

                        <button
                          type="button"
                          onClick={() => addToCart(product)}
                          disabled={product.stock <= 0}
                          className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </th>
                  ))}

                  {/* Empty Slot if less than 4 */}
                  {compareList.length < 4 && (
                    <th className="p-4 w-64 bg-slate-950/40 border-l border-slate-800/80 align-middle text-center">
                      <div className="space-y-3 max-w-[200px] mx-auto">
                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-700 mx-auto flex items-center justify-center text-slate-500">
                          <Plus className="w-5 h-5" />
                        </div>
                        <div className="text-xs font-bold text-slate-300">Add Another Product</div>
                        <select
                          value={searchPicker}
                          onChange={(e) => {
                            const found = products.find((p) => p.id === e.target.value);
                            if (found) addToCompare(found);
                            setSearchPicker('');
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white"
                        >
                          <option value="">Select from catalog...</option>
                          {availableToAdd.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({formatPrice(p.price)})
                            </option>
                          ))}
                        </select>
                      </div>
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/80">
                {/* Brand & Category */}
                <tr className="hover:bg-slate-800/30">
                  <td className="p-4 font-bold text-slate-400 bg-slate-950/40">Brand / Category</td>
                  {compareList.map((p) => (
                    <td key={p.id} className="p-4 font-semibold text-white">
                      {p.brand} ({p.category})
                    </td>
                  ))}
                  {compareList.length < 4 && <td className="bg-slate-950/20" />}
                </tr>

                {/* SKU */}
                <tr className="hover:bg-slate-800/30">
                  <td className="p-4 font-bold text-slate-400 bg-slate-950/40">SKU Code</td>
                  {compareList.map((p) => (
                    <td key={p.id} className="p-4 font-mono text-slate-300">
                      {p.sku}
                    </td>
                  ))}
                  {compareList.length < 4 && <td className="bg-slate-950/20" />}
                </tr>

                {/* Rating */}
                <tr className="hover:bg-slate-800/30">
                  <td className="p-4 font-bold text-slate-400 bg-slate-950/40">Customer Rating</td>
                  {compareList.map((p) => (
                    <td key={p.id} className="p-4">
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{p.rating.toFixed(1)}</span>
                        <span className="text-slate-500 font-normal">({p.reviewsCount})</span>
                      </div>
                    </td>
                  ))}
                  {compareList.length < 4 && <td className="bg-slate-950/20" />}
                </tr>

                {/* Key Summary */}
                <tr className="hover:bg-slate-800/30">
                  <td className="p-4 font-bold text-slate-400 bg-slate-950/40">Key Specifications</td>
                  {compareList.map((p) => (
                    <td key={p.id} className="p-4 text-slate-300 leading-relaxed font-mono text-[11px]">
                      {p.shortSpecs || p.description}
                    </td>
                  ))}
                  {compareList.length < 4 && <td className="bg-slate-950/20" />}
                </tr>

                {/* Condition */}
                <tr className="hover:bg-slate-800/30">
                  <td className="p-4 font-bold text-slate-400 bg-slate-950/40">Condition</td>
                  {compareList.map((p) => (
                    <td key={p.id} className="p-4 font-bold text-cyan-300">
                      {p.condition}
                    </td>
                  ))}
                  {compareList.length < 4 && <td className="bg-slate-950/20" />}
                </tr>

                {/* Warranty */}
                <tr className="hover:bg-slate-800/30">
                  <td className="p-4 font-bold text-slate-400 bg-slate-950/40">Warranty</td>
                  {compareList.map((p) => (
                    <td key={p.id} className="p-4 font-medium text-emerald-400">
                      {p.warranty}
                    </td>
                  ))}
                  {compareList.length < 4 && <td className="bg-slate-950/20" />}
                </tr>

                {/* Stock Level */}
                <tr className="hover:bg-slate-800/30">
                  <td className="p-4 font-bold text-slate-400 bg-slate-950/40">Inventory Stock</td>
                  {compareList.map((p) => (
                    <td key={p.id} className="p-4">
                      {p.stock > 0 ? (
                        <span className="text-emerald-400 font-bold">{p.stock} Units In Stock</span>
                      ) : (
                        <span className="text-rose-400 font-bold">Out of Stock</span>
                      )}
                    </td>
                  ))}
                  {compareList.length < 4 && <td className="bg-slate-950/20" />}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Footer />
      <FloatingWhatsApp />
      <CartDrawer />
    </div>
  );
};
