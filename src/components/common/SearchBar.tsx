import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, History, ArrowRight, ExternalLink } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product, Category } from '../../types';
import { navigate } from '../../utils/navigation';

interface SearchBarProps {
  onSelectProduct?: (product: Product) => void;
  onSearchSubmit?: (query: string) => void;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSelectProduct, onSearchSubmit, className = '' }) => {
  const { formatPrice, setSearchQuery } = useStore();
  const [inputVal, setInputVal] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_search_history');
      return saved ? JSON.parse(saved) : ['iPhone 16 Pro', 'Dell XPS 15', 'RTX 4090', 'Sony WH-1000XM5'];
    } catch {
      return [];
    }
  });

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!inputVal.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products/search/suggestions?q=${encodeURIComponent(inputVal.trim())}`);
        const data = await res.json();
        if (data.products) setSuggestions(data.products);
        if (data.categories) setCategories(data.categories);
      } catch (err) {
        console.error('Failed to fetch search suggestions:', err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [inputVal]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim()) return;

    const updatedHistory = [
      inputVal.trim(),
      ...searchHistory.filter((h) => h.toLowerCase() !== inputVal.trim().toLowerCase()),
    ].slice(0, 6);
    setSearchHistory(updatedHistory);
    localStorage.setItem('nexus_search_history', JSON.stringify(updatedHistory));

    setSearchQuery(inputVal.trim());
    if (onSearchSubmit) {
      onSearchSubmit(inputVal.trim());
    } else {
      navigate(`/shop?search=${encodeURIComponent(inputVal.trim())}`);
    }
    setIsOpen(false);
  };

  const handleSelectHistory = (term: string) => {
    setInputVal(term);
    setSearchQuery(term);
    if (onSearchSubmit) {
      onSearchSubmit(term);
    } else {
      navigate(`/shop?search=${encodeURIComponent(term)}`);
    }
    setIsOpen(false);
  };

  const handleSelectProduct = (product: Product) => {
    if (onSelectProduct) {
      onSelectProduct(product);
    } else {
      navigate(`/products/${product.slug}`);
    }
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative flex items-center h-11">
        <div className="absolute left-4 text-slate-400 pointer-events-none z-10">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => {
            setInputVal(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search phones, laptops, computers, accessories..."
          className="w-full h-full bg-slate-900/90 text-white placeholder-slate-400 text-sm pl-11 pr-20 rounded-l-xl border border-slate-700/80 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all shadow-inner"
        />
        {inputVal && (
          <button
            type="button"
            onClick={() => {
              setInputVal('');
              setSuggestions([]);
            }}
            className="absolute right-16 p-1 text-slate-400 hover:text-white rounded-md transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          type="submit"
          className="h-full px-5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-r-xl transition-colors flex items-center justify-center font-bold text-sm gap-1.5 shrink-0 border border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-800">
          {inputVal.trim().length === 0 ? (
            <div className="p-4 space-y-4">
              {/* Popular Searches */}
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2.5">
                  <TrendingUp className="w-3.5 h-3.5" /> Popular Searches
                </div>
                <div className="flex flex-wrap gap-2">
                  {['iPhone 16 Pro', 'MacBook Air M3', 'Samsung S24 Ultra', 'RTX 4090', 'Dell Latitude', 'PS5 Slim', 'Anker 100W'].map(
                    (tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleSelectHistory(tag)}
                        className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
                      >
                        {tag}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Search History */}
              {searchHistory.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <History className="w-3.5 h-3.5" /> Recent Searches
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleSelectHistory(item)}
                        className="text-xs bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-md border border-slate-800 transition-colors flex items-center gap-1.5"
                      >
                        <span>{item}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* Categories Matches */}
              {categories.length > 0 && (
                <div className="p-3 bg-slate-800/40">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 px-2">
                    Categories
                  </div>
                  <div className="flex flex-wrap gap-2 px-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          navigate(`/shop?category=${encodeURIComponent(cat.slug)}`);
                          setIsOpen(false);
                        }}
                        className="text-xs bg-cyan-950/60 text-cyan-300 hover:bg-cyan-900 border border-cyan-800/50 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1"
                      >
                        <span>In {cat.name}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Matches */}
              {suggestions.length > 0 ? (
                <div className="p-2 space-y-1 max-h-72 overflow-y-auto">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-1">
                    Products ({suggestions.length})
                  </div>
                  {suggestions.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleSelectProduct(product)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800 transition-colors group text-left"
                    >
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover bg-slate-800 border border-slate-700 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-cyan-400 font-medium uppercase tracking-wider">{product.brand}</div>
                        <div className="text-sm font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">
                          {product.name}
                        </div>
                        <div className="text-xs text-slate-400">{product.category}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold text-emerald-400">{formatPrice(product.price)}</div>
                        {product.compareAtPrice && (
                          <div className="text-xs text-slate-500 line-through">{formatPrice(product.compareAtPrice)}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 text-sm">
                  No products found for &quot;<span className="text-white">{inputVal}</span>&quot;
                </div>
              )}

              {/* View All Button */}
              <div className="p-3 bg-slate-950/80 text-center">
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  className="inline-flex items-center justify-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <span>View all results for &quot;{inputVal}&quot;</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
