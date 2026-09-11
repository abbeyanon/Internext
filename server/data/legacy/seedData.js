export const initialData = {
  settings: {
    storeName: "NexusTech Electronics",
    tagline: "Kenya's Premier Tech & Computing Destination",
    phone: "+254 759 508 348",
    altPhone: "+254 759 508 348",
    email: "sales@nexustech.co.ke",
    supportEmail: "support@nexustech.co.ke",
    whatsappNumber: "+254759508348",
    address: "Nexus Tower, 4th Floor, Kimathi Street, Nairobi CBD, Kenya",
    currency: "KES",
    currencySymbol: "KES ",
    taxRate: 16, // 16% VAT Kenya
    pricesIncludeTax: true,
    freeShippingThreshold: 50000,
    mpesaPaybill: "522522",
    mpesaAccountNo: "1290887645",
    mpesaTill: "889922",
    mpesaPasskey: "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
    mpesaConsumerKey: "NexusDarajaKeyProd2026",
    mpesaConsumerSecret: "NexusDarajaSecretProd2026",
    theme: {
      primaryColor: "#0b132b",
      secondaryColor: "#1c2541",
      accentColor: "#0284c7",
      highlightColor: "#06b6d4"
    },
    socialLinks: {
      facebook: "https://facebook.com/nexustechelectronics",
      instagram: "https://instagram.com/nexustech_ke",
      twitter: "https://twitter.com/nexustech_ke",
      tiktok: "https://tiktok.com/@nexustechkenya",
      youtube: "https://youtube.com/@nexustechke"
    }
  },
  deliveryZones: [
    { id: "dz-1", name: "Nairobi Metro (Same Day Delivery)", fee: 350, estimatedTime: "2-4 Hours", freeThreshold: 50000 },
    { id: "dz-2", name: "Kiambu / Thika / Machakos / Kajiado", fee: 450, estimatedTime: "Same Day / Next Morning", freeThreshold: 60000 },
    { id: "dz-3", name: "Mombasa & Coastal Region", fee: 650, estimatedTime: "24-48 Hours (G4S / Fargo Courier)", freeThreshold: 80000 },
    { id: "dz-4", name: "Nakuru / Eldoret / Rift Valley", fee: 600, estimatedTime: "24 Hours (Direct Express)", freeThreshold: 80000 },
    { id: "dz-5", name: "Kisumu & Western Kenya", fee: 700, estimatedTime: "24-48 Hours", freeThreshold: 80000 },
    { id: "dz-6", name: "Mount Kenya (Nyeri, Meru, Embu)", fee: 550, estimatedTime: "24 Hours", freeThreshold: 75000 },
    { id: "dz-7", name: "Free Store Pickup — Nairobi CBD (Kimathi St)", fee: 0, estimatedTime: "Ready in 30 Mins", freeThreshold: 0 },
    { id: "dz-8", name: "Free Store Pickup — Westlands Branch (Sarit Centre)", fee: 0, estimatedTime: "Ready in 30 Mins", freeThreshold: 0 }
  ],
  stores: [
    {
      id: "store-1",
      name: "NexusTech Flagship Experience Store — Nairobi CBD",
      address: "Ground Floor, Nexus Tower, Kimathi Street opposite Nation Centre",
      city: "Nairobi",
      phone: "+254 700 123 456",
      hours: "Mon - Sat: 8:00 AM - 8:00 PM | Sun: 10:00 AM - 5:00 PM",
      services: ["Sales", "Warranty Claims", "Hardware Upgrades", "Device Trade-In", "Collection Point"],
      coordinates: { lat: -1.2841, lng: 36.8223 }
    },
    {
      id: "store-2",
      name: "NexusTech TechHub — Westlands Branch",
      address: "Level 2, Sarit Centre Wing B, Karuna Road, Westlands",
      city: "Nairobi",
      phone: "+254 722 554 433",
      hours: "Mon - Sun: 9:00 AM - 9:00 PM",
      services: ["Sales", "VIP Experience Lounge", "Custom PC Building", "Collection Point"],
      coordinates: { lat: -1.2612, lng: 36.8044 }
    },
    {
      id: "store-3",
      name: "NexusTech Coastal Hub — Mombasa",
      address: "Nyali Plaza, Links Road, Nyali, Mombasa",
      city: "Mombasa",
      phone: "+254 711 889 900",
      hours: "Mon - Sat: 8:30 AM - 7:00 PM",
      services: ["Sales", "Fast Coastal Dispatch", "Collection Point"],
      coordinates: { lat: -4.0435, lng: 39.6682 }
    }
  ],
  categories: [
    {
      id: "cat-smartphones",
      name: "Smartphones",
      slug: "smartphones",
      icon: "Smartphone",
      description: "Flagship & budget 5G phones from Apple, Samsung, Google, Xiaomi & more with official warranties.",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80",
      productCount: 32,
      subcategories: ["Apple iPhone", "Samsung Galaxy", "Google Pixel", "Xiaomi & Redmi", "OnePlus", "Tecno & Infinix", "Oppo & Vivo"]
    },
    {
      id: "cat-laptops",
      name: "Laptops",
      slug: "laptops",
      icon: "Laptop",
      description: "Ultra-portable MacBooks, executive Dell & HP business laptops, and high-performance gaming rigs.",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
      productCount: 28,
      subcategories: ["Apple MacBook", "Dell Business & XPS", "HP Spectre & Envy", "Lenovo ThinkPad", "ASUS ZenBook & ROG", "Gaming Laptops", "Refurbished Grade A"]
    },
    {
      id: "cat-computers",
      name: "Desktop Computers",
      slug: "computers",
      icon: "Monitor",
      description: "Powerhouse workstations, All-in-One desktops, compact Mini PCs, and custom builder rigs.",
      image: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=800&auto=format&fit=crop&q=80",
      productCount: 18,
      subcategories: ["Apple Mac Studio & Mini", "All-in-One PCs", "Business Desktops", "Custom Creator Workstations", "Tower Rigs"]
    },
    {
      id: "cat-tablets",
      name: "Tablets & iPads",
      slug: "tablets",
      icon: "Tablet",
      description: "Apple iPad Pro M4, iPad Air, Samsung Galaxy Tabs, and Microsoft Surface hybrids with stylus support.",
      image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80",
      productCount: 16,
      subcategories: ["Apple iPad Pro & Air", "Samsung Galaxy Tab", "Microsoft Surface", "Drawing Tablets", "Budget Tablets"]
    },
    {
      id: "cat-accessories",
      name: "Accessories",
      slug: "accessories",
      icon: "Headphones",
      description: "Fast GaN chargers, premium noise-cancelling headphones, wireless earbuds, docks, and mice.",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
      productCount: 45,
      subcategories: ["Chargers & Power Banks", "Cables & Adapters", "Headphones & Earbuds", "Keyboards & Mice", "Laptop Bags & Sleeves", "Phone Cases & Glass"]
    },
    {
      id: "cat-components",
      name: "Computer Components",
      slug: "components",
      icon: "Cpu",
      description: "High-end NVIDIA GPUs, Intel & AMD Ryzen processors, Gen 4/5 NVMe SSDs, and DDR5 RAM.",
      image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop&q=80",
      productCount: 22,
      subcategories: ["Graphics Cards (GPU)", "Processors (CPU)", "Motherboards", "RAM Memory", "NVMe & SATA SSDs", "Power Supplies (PSU)", "PC Cases & Liquid Cooling"]
    },
    {
      id: "cat-networking",
      name: "Networking",
      slug: "networking",
      icon: "Wifi",
      description: "Enterprise Ubiquiti UniFi, WiFi 6/7 Mesh routers, Gigabit PoE switches, and 5G portable modems.",
      image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80",
      productCount: 16,
      subcategories: ["WiFi 6/7 Routers", "Mesh Systems", "PoE Network Switches", "Enterprise Access Points", "5G Mobile Modems", "Cat6/Cat7 Cabling"]
    },
    {
      id: "cat-gaming",
      name: "Gaming Gear",
      slug: "gaming",
      icon: "Gamepad2",
      description: "PlayStation 5, Xbox Series X, Nintendo Switch, handheld consoles, RGB mechanical keyboards, and headsets.",
      image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80",
      productCount: 18,
      subcategories: ["Consoles (PS5, Xbox, Switch)", "Handheld Rigs (Steam Deck, ROG Ally)", "Wireless Controllers", "Gaming Headsets", "Mechanical Keyboards", "Gaming Mice"]
    }
  ],
  brands: [
    { id: "b-apple", name: "Apple", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg", count: 35 },
    { id: "b-samsung", name: "Samsung", logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg", count: 28 },
    { id: "b-dell", name: "Dell", logo: "https://upload.wikimedia.org/wikipedia/commons/4/48/Dell_Logo.svg", count: 18 },
    { id: "b-hp", name: "HP", logo: "https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_630x630.png", count: 16 },
    { id: "b-lenovo", name: "Lenovo", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Lenovo_logo_2015.svg", count: 15 },
    { id: "b-asus", name: "ASUS", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2e/ASUS_Logo.svg", count: 14 },
    { id: "b-sony", name: "Sony", logo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg", count: 12 },
    { id: "b-google", name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg", count: 10 },
    { id: "b-anker", name: "Anker", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Anker_logo.svg/800px-Anker_logo.svg.png", count: 15 },
    { id: "b-nvidia", name: "NVIDIA", logo: "https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg", count: 8 },
    { id: "b-intel", name: "Intel", logo: "https://upload.wikimedia.org/wikipedia/commons/7/7d/Intel_logo_%282020%29.svg", count: 9 },
    { id: "b-ubiquiti", name: "Ubiquiti", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Ubiquiti_Networks_Logo.svg/1200px-Ubiquiti_Networks_Logo.svg.png", count: 7 },
    { id: "b-tplink", name: "TP-Link", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/TP-Link_logo.svg/1200px-TP-Link_logo.svg.png", count: 9 },
    { id: "b-logitech", name: "Logitech", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Logitech_logo.svg/1024px-Logitech_logo.svg.png", count: 14 }
  ],
  coupons: [
    {
      code: "TECH2026",
      discountType: "percentage",
      discountValue: 10,
      minOrderAmount: 15000,
      maxDiscountAmount: 10000,
      validFrom: "2026-01-01",
      validUntil: "2026-12-31",
      usageLimit: 500,
      usedCount: 84,
      isActive: true,
      description: "10% off for technology purchases over KES 15,000"
    },
    {
      code: "WELCOME5K",
      discountType: "fixed",
      discountValue: 5000,
      minOrderAmount: 50000,
      maxDiscountAmount: 5000,
      validFrom: "2026-01-01",
      validUntil: "2026-12-31",
      usageLimit: 200,
      usedCount: 39,
      isActive: true,
      description: "Flat KES 5,000 voucher on orders above KES 50,000"
    },
    {
      code: "FREESHIP",
      discountType: "fixed",
      discountValue: 350,
      minOrderAmount: 10000,
      maxDiscountAmount: 350,
      validFrom: "2026-01-01",
      validUntil: "2026-12-31",
      usageLimit: 1000,
      usedCount: 312,
      isActive: true,
      description: "Free Nairobi Metro courier delivery on any item above KES 10,000"
    },
    {
      code: "GAMER15",
      discountType: "percentage",
      discountValue: 15,
      minOrderAmount: 30000,
      maxDiscountAmount: 15000,
      validFrom: "2026-01-01",
      validUntil: "2026-12-31",
      usageLimit: 100,
      usedCount: 18,
      isActive: true,
      description: "15% off on gaming consoles, GPUs, and peripherals"
    }
  ],
  users: [
    {
      id: "usr-admin-01",
      name: "Abbey Kibet (Super Admin)",
      email: "admin@nexustech.co.ke",
      role: "super_admin",
      phone: "+254 700 123 456",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      createdAt: "2026-01-10T08:00:00Z"
    },
    {
      id: "usr-mgr-01",
      name: "Faith Njeri (Store Manager)",
      email: "faith.njeri@nexustech.co.ke",
      role: "store_manager",
      phone: "+254 722 111 222",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
      createdAt: "2026-01-15T09:30:00Z"
    },
    {
      id: "usr-cust-01",
      name: "Dennis Mwangi",
      email: "dennis.mwangi@gmail.com",
      role: "customer",
      phone: "+254 712 345 678",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      addresses: [
        {
          id: "addr-1",
          fullName: "Dennis Mwangi",
          phone: "+254 712 345 678",
          county: "Nairobi",
          town: "Kilimani",
          street: "Argwings Kodhek Road",
          building: "Silverstone Towers, Apt 4B",
          isDefault: true
        }
      ],
      createdAt: "2026-02-01T14:20:00Z"
    }
  ]
};
