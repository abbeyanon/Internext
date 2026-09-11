import React from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Boxes,
  Tag,
  Users,
  Star,
  HelpCircle,
  FileText,
  Settings as SettingsIcon,
  Shield,
  ExternalLink,
  LogOut,
  Bell,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Logo } from '../../components/common/Logo';

interface AdminLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ activeTab, setActiveTab, children }) => {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const allNavItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard, adminOnly: false },
    { id: 'products', label: 'Products & Catalog', icon: Package, adminOnly: false },
    { id: 'orders', label: 'Orders & Fulfillment', icon: ShoppingCart, adminOnly: false },
    { id: 'inventory', label: 'Inventory & Stock', icon: Boxes, adminOnly: false },
    { id: 'coupons', label: 'Coupons & Discounts', icon: Tag, adminOnly: false },
    { id: 'customers', label: 'Customers CRM', icon: Users, adminOnly: false },
    { id: 'reviews', label: 'Review Moderation', icon: Star, adminOnly: false },
    { id: 'support', label: 'Support Tickets', icon: HelpCircle, adminOnly: false },
    // Audit logs and system/M-Pesa settings are administration functions —
    // Sales Managers must not see or reach unrestricted admin functions.
    { id: 'audit', label: 'System Audit Logs', icon: FileText, adminOnly: true },
    { id: 'settings', label: 'Store & M-Pesa Settings', icon: SettingsIcon, adminOnly: true }
  ];

  const navItems = allNavItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 selection:bg-cyan-600 selection:text-white">
      {/* SAAS SIDEBAR */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 hidden md:flex">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 space-y-3">
          <a href="/" className="flex items-center gap-2.5">
            <Logo size={32} titleClassName="text-white text-sm" taglineClassName="text-cyan-400 !text-[9px]" />
          </a>

          {/* User Badge */}
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
              alt=""
              className="w-7 h-7 rounded-lg object-cover ring-1 ring-cyan-500"
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">{user?.name || 'Super Admin'}</div>
              <div className="text-[10px] text-amber-400 font-mono uppercase">{user?.role?.replace('_', ' ')}</div>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <div className="p-3 space-y-1 overflow-y-auto flex-1 text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-all ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2 text-xs">
          <a
            href="/"
            className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition-colors"
          >
            <span>Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 text-rose-400 hover:bg-rose-950/30 rounded-xl font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            {navItems.map((n) => (
              <button
                key={n.id}
                onClick={() => setActiveTab(n.id)}
                className={`md:hidden px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 ${
                  activeTab === n.id ? 'bg-cyan-600 text-white' : 'text-slate-400 bg-slate-800'
                }`}
              >
                {n.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs shrink-0">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-1.5 cursor-pointer"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline font-bold">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-cyan-400" />
                  <span className="hidden sm:inline font-bold">Dark</span>
                </>
              )}
            </button>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Express REST API & M-Pesa Gateway Online</span>
            </span>

            <a
              href="/"
              className="px-3 py-1.5 bg-slate-800 hover:bg-cyan-600 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors"
            >
              <span>Storefront</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </header>

        {/* Tab Content */}
        <main className="p-6 sm:p-8 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};
