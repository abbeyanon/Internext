import React, { useState } from 'react';
import {
  Laptop,
  RefreshCw,
  Monitor,
  Mouse,
  Cpu,
  Wifi,
  Cable,
  Camera,
  Wrench,
  Settings,
  Printer,
  Flame,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { navigate } from '../../utils/navigation';

interface MegaMenuProps {
  onClose?: () => void;
}

// Mirrors the real category/product catalog (server/db/seed.js) — every
// link here resolves to an actual category or product.
export const MegaMenu: React.FC<MegaMenuProps> = ({ onClose }) => {
  const { formatPrice } = useStore();
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>('brand-new-laptops');

  const menuSections = [
    {
      slug: 'brand-new-laptops',
      name: 'Brand New Laptops',
      icon: Laptop,
      featuredText: 'HP EliteBook 840 G9',
      featuredPrice: 145000,
      bannerImage: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80',
      columns: [
        { title: 'By Brand', links: [
          { label: 'HP', href: '/shop?category=brand-new-laptops&brand=HP' },
          { label: 'Dell', href: '/shop?category=brand-new-laptops&brand=Dell' },
          { label: 'Lenovo', href: '/shop?category=brand-new-laptops&brand=Lenovo' }
        ] },
        { title: 'Popular Picks', links: [
          { label: 'HP ProBook 450 G10', href: '/products/hp-probook-450-g10-business-laptop' },
          { label: 'Dell Latitude 5440', href: '/products/dell-latitude-5440-business-laptop' },
          { label: 'Lenovo ThinkPad E14 Gen 5', href: '/products/lenovo-thinkpad-e14-gen-5' },
          { label: 'HP EliteBook 840 G9', href: '/products/hp-elitebook-840-g9' }
        ] }
      ]
    },
    {
      slug: 'ex-uk-laptops',
      name: 'Ex-UK Laptops',
      icon: RefreshCw,
      featuredText: 'Grade-A Refurbished, Warrantied',
      featuredPrice: 42000,
      bannerImage: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
      columns: [
        { title: 'Popular Picks', links: [
          { label: 'HP EliteBook 840 G5', href: '/products/hp-elitebook-840-g5-ex-uk' },
          { label: 'Dell Latitude 7490', href: '/products/dell-latitude-7490-ex-uk' },
          { label: 'Lenovo ThinkPad T480', href: '/products/lenovo-thinkpad-t480-ex-uk' },
          { label: 'HP ProBook 640 G4', href: '/products/hp-probook-640-g4-ex-uk' }
        ] }
      ]
    },
    {
      slug: 'desktop-computers',
      name: 'Desktop Computers',
      icon: Monitor,
      featuredText: 'Dell OptiPlex 7080',
      featuredPrice: 78000,
      bannerImage: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=600&auto=format&fit=crop&q=80',
      columns: [
        { title: 'Popular Picks', links: [
          { label: 'HP EliteDesk 800 G4 SFF', href: '/products/hp-elitedesk-800-g4-sff-desktop' },
          { label: 'Dell OptiPlex 7080', href: '/products/dell-optiplex-7080-desktop' },
          { label: 'Internext Custom Office Desktop', href: '/products/internext-custom-office-desktop' }
        ] }
      ]
    },
    {
      slug: 'computer-accessories',
      name: 'Computer Accessories',
      icon: Mouse,
      featuredText: 'Dell 24" FHD Monitor',
      featuredPrice: 18500,
      bannerImage: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80',
      columns: [
        { title: 'Popular Picks', links: [
          { label: 'Logitech MK270 Combo', href: '/products/logitech-mk270-wireless-combo' },
          { label: 'Dell 24" FHD Monitor', href: '/products/dell-24-fhd-monitor' },
          { label: 'HP 65W Universal Charger', href: '/products/hp-65w-universal-laptop-charger' },
          { label: 'Laptop Bags', href: '/shop?category=computer-accessories' }
        ] }
      ]
    },
    {
      slug: 'computer-components',
      name: 'Computer Components',
      icon: Cpu,
      featuredText: 'Crucial 480GB SATA SSD',
      featuredPrice: 4800,
      bannerImage: 'https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?w=600&auto=format&fit=crop&q=80',
      columns: [
        { title: 'Popular Picks', links: [
          { label: 'Kingston 8GB DDR4 RAM', href: '/products/kingston-8gb-ddr4-ram' },
          { label: 'Crucial 480GB SSD', href: '/products/crucial-480gb-sata-ssd' },
          { label: 'APC Back-UPS 650VA', href: '/products/apc-back-ups-650va' }
        ] }
      ]
    },
    {
      slug: 'networking',
      name: 'Networking',
      icon: Wifi,
      featuredText: 'Ubiquiti UniFi AP AC Lite',
      featuredPrice: 12500,
      bannerImage: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=600&auto=format&fit=crop&q=80',
      columns: [
        { title: 'Popular Picks', links: [
          { label: 'TP-Link Archer C6 Router', href: '/products/tp-link-archer-c6-ac1200-router' },
          { label: 'Ubiquiti UniFi AP AC Lite', href: '/products/ubiquiti-unifi-ap-ac-lite' },
          { label: '24-Port Gigabit Switch', href: '/products/tp-link-24-port-gigabit-switch' }
        ] }
      ]
    },
    {
      slug: 'structured-cabling',
      name: 'Structured Cabling',
      icon: Cable,
      featuredText: 'Network Planning & Design',
      featuredPrice: 15000,
      bannerImage: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80',
      columns: [
        { title: 'Services', links: [
          { label: 'Cabling Installation (Per Point)', href: '/products/structured-cabling-installation-per-point' },
          { label: 'Network Planning & Design', href: '/products/network-planning-design-consultation' },
          { label: 'Full Network Implementation', href: '/products/full-network-implementation-up-to-20-points' }
        ] }
      ]
    },
    {
      slug: 'cctv-surveillance',
      name: 'CCTV & Surveillance',
      icon: Camera,
      featuredText: 'Dahua 8-Channel IP Kit',
      featuredPrice: 68000,
      bannerImage: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop&q=80',
      columns: [
        { title: 'Popular Picks', links: [
          { label: 'Hikvision 4-Channel HD Kit', href: '/products/hikvision-4-channel-hd-cctv-kit' },
          { label: 'Dahua 8-Channel IP Kit', href: '/products/dahua-8-channel-ip-cctv-kit' },
          { label: 'Installation Service', href: '/products/cctv-installation-setup-per-camera' }
        ] }
      ]
    },
    {
      slug: 'screen-replacement',
      name: 'Screen Replacement',
      icon: Monitor,
      featuredText: 'Laptop Screens, Most Brands',
      featuredPrice: 6500,
      bannerImage: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&auto=format&fit=crop&q=80',
      columns: [
        { title: 'Services', links: [
          { label: '13"-14" Screen Replacement', href: '/products/laptop-screen-replacement-13-14' },
          { label: '15"-17" Screen Replacement', href: '/products/laptop-screen-replacement-15-17' },
          { label: 'Desktop Monitor Repair', href: '/products/desktop-monitor-repair' }
        ] }
      ]
    },
    {
      slug: 'hardware-maintenance',
      name: 'Hardware Maintenance',
      icon: Wrench,
      featuredText: 'Annual Maintenance Contracts',
      featuredPrice: 8000,
      bannerImage: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&auto=format&fit=crop&q=80',
      columns: [
        { title: 'Services', links: [
          { label: 'Diagnostic & Repair', href: '/products/computer-hardware-diagnostic-repair' },
          { label: 'Annual Maintenance Contract', href: '/products/annual-hardware-maintenance-contract-per-device' }
        ] }
      ]
    },
    {
      slug: 'software-maintenance',
      name: 'Software Maintenance',
      icon: Settings,
      featuredText: 'OS Setup & Support Contracts',
      featuredPrice: 2000,
      bannerImage: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&auto=format&fit=crop&q=80',
      columns: [
        { title: 'Services', links: [
          { label: 'OS Installation & Setup', href: '/products/os-installation-software-setup' },
          { label: 'Virus Removal & Optimization', href: '/products/virus-removal-system-optimization' },
          { label: 'Annual Maintenance Contract', href: '/products/annual-software-maintenance-contract-per-device' }
        ] }
      ]
    },
    {
      slug: 'office-supplies',
      name: 'Office Supplies',
      icon: Printer,
      featuredText: 'HP LaserJet Pro M404dn',
      featuredPrice: 32000,
      bannerImage: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&auto=format&fit=crop&q=80',
      columns: [
        { title: 'Popular Picks', links: [
          { label: 'HP LaserJet Pro Printer', href: '/products/hp-laserjet-pro-m404dn-printer' },
          { label: 'A4 Copy Paper', href: '/products/a4-copy-paper-ream-500-sheets' },
          { label: 'Canon Ink Cartridges', href: '/products/canon-ink-cartridge-set' }
        ] }
      ]
    }
  ];

  const activeSection = menuSections.find((s) => s.slug === activeCategorySlug) || menuSections[0];

  return (
    <div className="bg-slate-900 border-t border-b border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      <div className="max-w-[1520px] mx-auto flex min-h-[380px]">
        {/* Left Sidebar Menu */}
        <div className="w-64 bg-slate-950/80 border-r border-slate-800/80 p-3 space-y-1 overflow-y-auto">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-2">
            Top Categories
          </div>
          {menuSections.map((sec) => {
            const Icon = sec.icon;
            const isActive = sec.slug === activeCategorySlug;
            return (
              <button
                key={sec.slug}
                onMouseEnter={() => setActiveCategorySlug(sec.slug)}
                onClick={() => {
                  navigate(`/shop?category=${sec.slug}`);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-cyan-400'}`} />
                  <span>{sec.name}</span>
                </div>
                <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              </button>
            );
          })}

          <div className="pt-2 mt-2 border-t border-slate-800">
            <a
              href="/shop?flashDeal=true"
              onClick={onClose}
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-semibold text-amber-400 hover:bg-amber-950/30 transition-colors"
            >
              <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Flash Deals & Offers</span>
            </a>
            <a
              href="/shop?newArrival=true"
              onClick={onClose}
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-semibold text-emerald-400 hover:bg-emerald-950/30 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>New Arrivals</span>
            </a>
          </div>
        </div>

        {/* Center Columns */}
        <div className="flex-1 p-6 grid grid-cols-3 gap-8">
          {activeSection.columns.map((col, idx) => (
            <div key={idx} className="space-y-3">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider pb-1 border-b border-slate-800">
                {col.title}
              </h4>
              <ul className="space-y-2 text-sm">
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <a
                      href={link.href}
                      onClick={onClose}
                      className="text-slate-300 hover:text-cyan-300 hover:translate-x-1 inline-block transition-transform duration-150 font-normal"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Right Feature Banner */}
        <div className="w-72 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-l border-slate-800 p-5 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/50 text-[11px] font-bold text-cyan-300 uppercase tracking-wider mb-3">
              <Zap className="w-3 h-3 text-cyan-400" /> Featured Highlight
            </div>
            <h3 className="text-base font-bold text-white leading-snug mb-1">
              {activeSection.featuredText}
            </h3>
            <div className="text-emerald-400 font-extrabold text-lg mb-3">
              {formatPrice(activeSection.featuredPrice)}
            </div>
            <img
              src={activeSection.bannerImage}
              alt={activeSection.name}
              className="w-full h-32 object-cover rounded-xl border border-slate-700 shadow-md mb-3"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Warrantied & Locally Supported</span>
            </div>
            <a
              href={`/shop?category=${activeSection.slug}`}
              onClick={onClose}
              className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-cyan-600/20"
            >
              <span>Explore All {activeSection.name}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
