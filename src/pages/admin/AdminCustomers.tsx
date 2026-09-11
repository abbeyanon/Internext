import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, MapPin, ShoppingBag } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order } from '../../types';

export const AdminCustomers: React.FC = () => {
  const { formatPrice } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const defaultDemoOrders: Order[] = [
    {
      id: 'ord-101',
      orderNumber: 'NX-892401',
      customer: {
        name: 'Dennis Mwangi',
        email: 'dennis.mwangi@gmail.com',
        phone: '+254 759 508 348'
      },
      items: [],
      subtotal: 215000,
      discountAmount: 0,
      deliveryFee: 350,
      taxAmount: 29655,
      total: 215350,
      currency: 'KES',
      status: 'Dispatched',
      paymentMethod: 'M-Pesa STK Push',
      paymentStatus: 'Paid',
      deliveryMethod: 'Express Courier',
      deliveryAddress: {
        county: 'Nairobi',
        town: 'Kilimani',
        street: 'Argwings Kodhek Road'
      },
      trackingNumber: 'NEX-TRK-98214',
      timeline: [],
      createdAt: new Date().toISOString()
    }
  ];

  useEffect(() => {
    fetch('/api/orders')
      .then((res) => {
        if (!res.ok) return null;
        const ct = res.headers.get('content-type');
        return ct && ct.includes('application/json') ? res.json() : null;
      })
      .then((data) => {
        if (data && data.orders && data.orders.length > 0) {
          setOrders(data.orders);
        } else {
          try {
            const saved = JSON.parse(localStorage.getItem('nexus_orders') || '[]');
            setOrders(saved.length > 0 ? saved : defaultDemoOrders);
          } catch {
            setOrders(defaultDemoOrders);
          }
        }
      })
      .catch(() => {
        try {
          const saved = JSON.parse(localStorage.getItem('nexus_orders') || '[]');
          setOrders(saved.length > 0 ? saved : defaultDemoOrders);
        } catch {
          setOrders(defaultDemoOrders);
        }
      });
  }, []);

  // Deduplicate customers from orders
  const customerMap: Record<string, any> = {};
  orders.forEach((o) => {
    const key = o.customer.email.toLowerCase();
    if (!customerMap[key]) {
      customerMap[key] = {
        name: o.customer.name,
        email: o.customer.email,
        phone: o.customer.phone,
        city: `${o.deliveryAddress.town}, ${o.deliveryAddress.county}`,
        ordersCount: 0,
        totalSpend: 0,
        lastOrder: o.createdAt
      };
    }
    customerMap[key].ordersCount += 1;
    customerMap[key].totalSpend += o.total;
  });

  const customersList = Object.values(customerMap).filter((c) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Customer Database & Lifetime Value</h2>
          <p className="text-xs text-slate-400">View customer purchase history, verified contacts, and regional delivery hubs</p>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customers..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Contact Info</th>
                <th className="p-3.5">Destination Hub</th>
                <th className="p-3.5 text-center">Orders</th>
                <th className="p-3.5 text-right">Lifetime Spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {customersList.map((c, i) => (
                <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-bold text-white">{c.name}</td>
                  <td className="p-3.5">
                    <div className="text-slate-300">{c.email}</div>
                    <div className="text-slate-400 font-mono text-[11px]">{c.phone}</div>
                  </td>
                  <td className="p-3.5 text-cyan-300">{c.city}</td>
                  <td className="p-3.5 text-center font-bold font-mono text-white">{c.ordersCount}</td>
                  <td className="p-3.5 text-right font-black text-emerald-400 font-mono">
                    {formatPrice(c.totalSpend)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
