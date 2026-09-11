import React, { useState } from 'react';
import {
  Boxes,
  AlertTriangle,
  Search,
  Plus,
  Minus,
  Save,
  CheckCircle2,
  TrendingDown,
  Warehouse
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';

export const AdminInventory: React.FC = () => {
  const { products, formatPrice, refreshProducts } = useStore();
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [stockChanges, setStockChanges] = useState<Record<string, number>>({});

  const handleStockAdjust = (id: string, delta: number, current: number) => {
    const existing = stockChanges[id] !== undefined ? stockChanges[id] : current;
    const nextVal = Math.max(0, existing + delta);
    setStockChanges({ ...stockChanges, [id]: nextVal });
  };

  const handleSaveStock = async (id: string) => {
    const newStock = stockChanges[id];
    if (newStock === undefined) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Inventory level updated!', 'success');
        refreshProducts();
        const nextChanges = { ...stockChanges };
        delete nextChanges[id];
        setStockChanges(nextChanges);
      }
    } catch (e) {
      showToast('Error updating inventory', 'error');
    }
  };

  const filtered = products.filter((p) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Warehouse Inventory & Stock Allocation</h2>
          <p className="text-xs text-slate-400">Kimathi Street CBD Flagship & Westlands Sarit Centre Hub distribution</p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2 p-2.5 bg-slate-900 border border-slate-800 rounded-xl">
            <Warehouse className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white">Nairobi Central Dispatch</span>
          </div>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter inventory by SKU or product title..."
          className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Inventory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Product & SKU</th>
                <th className="p-3.5">Retail Price</th>
                <th className="p-3.5">Current Units</th>
                <th className="p-3.5">Quick Stock Modifier</th>
                <th className="p-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((p) => {
                const draftStock = stockChanges[p.id] !== undefined ? stockChanges[p.id] : p.stock;
                const isChanged = stockChanges[p.id] !== undefined && stockChanges[p.id] !== p.stock;

                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img src={p.thumbnail} alt="" className="w-10 h-10 rounded-lg object-contain bg-slate-950 p-1 border border-slate-800" />
                        <div>
                          <div className="font-bold text-white max-w-xs truncate">{p.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">SKU: {p.sku}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 font-bold font-mono text-white">{formatPrice(p.price)}</td>

                    <td className="p-3.5">
                      <span className="font-mono font-black text-sm text-cyan-400">{draftStock} Units</span>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl p-0.5">
                          <button
                            type="button"
                            onClick={() => handleStockAdjust(p.id, -1, p.stock)}
                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-10 text-center font-mono font-bold text-white">{draftStock}</span>
                          <button
                            type="button"
                            onClick={() => handleStockAdjust(p.id, 1, p.stock)}
                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {isChanged && (
                          <button
                            type="button"
                            onClick={() => handleSaveStock(p.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save</span>
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5 text-right">
                      {draftStock > 5 ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-bold text-[10px] border border-emerald-800">
                          Healthy Stock
                        </span>
                      ) : draftStock > 0 ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-400 font-bold text-[10px] border border-amber-800 flex items-center gap-1 inline-flex">
                          <AlertTriangle className="w-3 h-3" /> Low Stock
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-400 font-bold text-[10px] border border-rose-800">
                          Out of Stock
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
