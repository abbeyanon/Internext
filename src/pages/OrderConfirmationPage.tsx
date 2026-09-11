import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Package,
  Printer,
  Truck,
  ArrowRight,
  ShieldCheck,
  Zap,
  MapPin,
  Clock,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { InvoiceModal } from '../components/checkout/InvoiceModal';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';

export const OrderConfirmationPage: React.FC = () => {
  const { formatPrice } = useStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState<boolean>(false);

  const urlParams = new URLSearchParams(window.location.search);
  const orderNumber = urlParams.get('orderNumber') || 'ORD-2026-000101';

  useEffect(() => {
    // Fire festive celebration confetti
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 }
    });

    fetch(`/api/orders/${orderNumber}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.order) {
          setOrder(data.order);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-600 selection:text-white">
      <Header currentPath="/order-confirmation" />

      <main className="flex-1 max-w-4xl mx-auto px-3 sm:px-4 lg:px-5 py-12 w-full space-y-8">
        {/* Success Card */}
        <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 text-center space-y-5 shadow-2xl relative overflow-hidden">
          <div className="w-20 h-20 rounded-full bg-emerald-950/80 border-2 border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center animate-bounce shadow-xl">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" /> Order Placed & Confirmed
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Asante Sana! Your Order is on the Way
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
              We've dispatched your order to our dispatch warehouse for swift processing and rider delivery.
            </p>
          </div>

          {/* Key Reference Number Box */}
          <div className="inline-block p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-sm sm:text-base text-cyan-400 font-bold">
            Order Number: <span className="text-white">{orderNumber}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {order && (
              <button
                type="button"
                onClick={() => setIsInvoiceOpen(true)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-700 transition-colors shadow"
              >
                <Printer className="w-4 h-4" />
                <span>View & Print Tax Invoice</span>
              </button>
            )}

            <a
              href={`/track-order?orderNumber=${orderNumber}`}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition-all"
            >
              <Truck className="w-4 h-4" />
              <span>Track Live Delivery Progress</span>
            </a>
          </div>
        </div>

        {/* Order Details Breakdown */}
        {order && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
              Order Summary & Items
            </h3>

            {/* Customer & Shipping Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-bold text-slate-400 uppercase text-[10px]">Customer Details:</div>
                <div className="font-extrabold text-white text-sm">{order.customer.name}</div>
                <div className="text-slate-400">{order.customer.phone}</div>
                <div className="text-slate-400">{order.customer.email}</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-bold text-slate-400 uppercase text-[10px]">Delivery Destination:</div>
                <div className="text-slate-200">
                  {order.deliveryAddress.building && `${order.deliveryAddress.building}, `}
                  {order.deliveryAddress.street && `${order.deliveryAddress.street}, `}
                  <strong>{order.deliveryAddress.town}, {order.deliveryAddress.county}</strong>
                </div>
                <div className="text-cyan-400 font-semibold">{order.deliveryMethod}</div>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold text-slate-300 uppercase">Purchased Products:</div>
              <div className="divide-y divide-slate-800">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img src={item.thumbnail} alt="" className="w-12 h-12 rounded-xl object-contain bg-slate-950 p-1 border border-slate-800" />
                      <div>
                        <div className="font-bold text-white">{item.name}</div>
                        {item.variantName && (
                          <div className="text-[11px] text-cyan-400 font-mono">{item.variantName}</div>
                        )}
                        <div className="text-[10px] text-slate-400">Qty: {item.quantity} × {formatPrice(item.price)}</div>
                      </div>
                    </div>
                    <div className="font-black text-emerald-400 text-sm">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-sm">
              <span className="font-bold text-slate-300">Total Paid via {order.paymentMethod}:</span>
              <span className="text-xl font-black text-cyan-400">{formatPrice(order.total)}</span>
            </div>
          </div>
        )}
      </main>

      {/* Invoice Modal */}
      {isInvoiceOpen && order && (
        <InvoiceModal order={order} onClose={() => setIsInvoiceOpen(false)} />
      )}

      <Footer />
    </div>
  );
};
