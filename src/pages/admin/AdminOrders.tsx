import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Search,
  Printer,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  ChevronRight,
  Filter,
  Zap,
  Edit2
} from 'lucide-react';
import { InvoiceModal } from '../../components/checkout/InvoiceModal';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { Order } from '../../types';

export const AdminOrders: React.FC = () => {
  const { formatPrice } = useStore();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  const defaultDemoOrders: Order[] = [
    {
      id: 'ord-101',
      orderNumber: 'NX-892401',
      customer: {
        name: 'Dennis Mwangi',
        email: 'dennis.mwangi@gmail.com',
        phone: '+254 759 508 348'
      },
      items: [
        {
          productId: 'prod-iphone16promax',
          name: 'Apple iPhone 16 Pro Max 256GB Desert Titanium',
          thumbnail: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=80',
          sku: 'APL-IPH16PM-256-DES',
          price: 215000,
          quantity: 1
        }
      ],
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

  const fetchOrders = () => {
    setLoading(true);
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
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string, note?: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          note: note || `Order status transitioned to ${newStatus} by Staff Specialist`
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Order status updated to ${newStatus}`, 'success');
        fetchOrders();
      }
    } catch (e) {
      showToast('Error updating status', 'error');
    }
  };

  const handleVerifyMpesa = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/mpesa-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mpesaReceipt: `QKD${Date.now().toString().slice(-6)}XLP`
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('M-Pesa payment marked as verified!', 'success');
        fetchOrders();
      }
    } catch (e) {
      showToast('Error verifying payment', 'error');
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus !== 'All' && o.status !== filterStatus) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.phone.includes(q) ||
        (o.paymentReference && o.paymentReference.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Order Management & Fulfillment Queue</h2>
          <p className="text-xs text-slate-400">Process dispatch status, verify M-Pesa receipts, and generate invoices</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-cyan-400 font-bold">
            {orders.length} Total Orders
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
          {['All', 'Processing', 'Packed', 'Dispatched', 'Out for Delivery', 'Delivered'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                filterStatus === st
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search order number or phone..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Order Ref</th>
                <th className="p-3.5">Customer & Contact</th>
                <th className="p-3.5">Items & Amount</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5">Fulfillment Stage</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 align-top">
                    <div className="font-mono font-bold text-cyan-400">{ord.orderNumber}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{new Date(ord.createdAt).toLocaleDateString()}</div>
                  </td>

                  <td className="p-3.5 align-top">
                    <div className="font-bold text-white">{ord.customer.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{ord.customer.phone}</div>
                    <div className="text-[11px] text-cyan-300 mt-0.5">{ord.deliveryAddress.town}, {ord.deliveryAddress.county}</div>
                  </td>

                  <td className="p-3.5 align-top">
                    <div className="font-black text-white font-mono">{formatPrice(ord.total)}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{ord.items.length} items ({ord.deliveryMethod})</div>
                  </td>

                  <td className="p-3.5 align-top">
                    <div className="space-y-1">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          ord.paymentStatus === 'Paid'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {ord.paymentStatus}
                      </span>
                      {ord.paymentReference && (
                        <div className="text-[10px] text-slate-400 font-mono">Ref: {ord.paymentReference}</div>
                      )}
                      {ord.paymentStatus !== 'Paid' && (
                        <button
                          type="button"
                          onClick={() => handleVerifyMpesa(ord.id)}
                          className="block text-[10px] text-emerald-400 hover:underline font-bold"
                        >
                          + Mark M-Pesa Paid
                        </button>
                      )}
                    </div>
                  </td>

                  <td className="p-3.5 align-top">
                    <select
                      value={ord.status}
                      onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-white font-bold cursor-pointer focus:border-cyan-500"
                    >
                      <option value="Processing">Processing</option>
                      <option value="Packed">Packed</option>
                      <option value="Dispatched">Dispatched</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>

                  <td className="p-3.5 text-right align-top">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedInvoiceOrder(ord)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Invoice</span>
                      </button>

                      <a
                        href={`/track-order?orderNumber=${ord.orderNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-slate-800 text-cyan-400 hover:bg-slate-700"
                        title="Live Tracking Link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Invoice Modal */}
      {selectedInvoiceOrder && (
        <InvoiceModal order={selectedInvoiceOrder} onClose={() => setSelectedInvoiceOrder(null)} />
      )}
    </div>
  );
};
