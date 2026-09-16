import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types';
import { useToast } from './ToastContext';

interface CompareContextType {
  compareList: Product[];
  compareCount: number;
  isComparing: (productId: string) => boolean;
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [compareList, setCompareList] = useState<Product[]>(() => {
    const saved = localStorage.getItem('nexus_compare');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('nexus_compare', JSON.stringify(compareList));
  }, [compareList]);

  const isComparing = (productId: string) => {
    return compareList.some((p) => p.id === productId);
  };

  const addToCompare = (product: Product) => {
    if (isComparing(product.id)) {
      removeFromCompare(product.id);
      return;
    }

    if (compareList.length >= 4) {
      showToast('You can compare a maximum of 4 products at once', 'warning');
      return;
    }

    setCompareList((prev) => [...prev, product]);
    setIsDrawerOpen(true);
    showToast(`Added ${product.name} to comparison list`, 'success');
  };

  const removeFromCompare = (productId: string) => {
    setCompareList((prev) => prev.filter((p) => p.id !== productId));
    showToast('Removed from comparison', 'info');
  };

  const clearCompare = () => {
    setCompareList([]);
    setIsDrawerOpen(false);
  };

  return (
    <CompareContext.Provider
      value={{
        compareList,
        compareCount: compareList.length,
        isComparing,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isDrawerOpen,
        setIsDrawerOpen
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) throw new Error('useCompare must be used within a CompareProvider');
  return context;
};
