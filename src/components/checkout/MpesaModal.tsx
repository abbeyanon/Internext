import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowRight,
  RefreshCw,
  Zap,
  ShieldCheck,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../../context/StoreContext';

interface MpesaModalProps {
  orderId: string;
  orderNumber: string;
  phone: string;
  amount: number;
  onSuccess: (verifiedOrder: any) => void;
  onCancel: () => void;
}

export const MpesaModal: React.FC<MpesaModalProps> = ({
  orderId,
  orderNumber,
  phone,
  amount,
  onSuccess,
  onCancel
}) => {
  const { formatPrice, settings } = useStore();
  const [step, setStep] = useState<'prompt' | 'simulating' | 'success' | 'failed'>('prompt');
  const [pinInput, setPinInput] = useState<string>('');
  const [mpesaReceipt, setMpesaReceipt] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [checkoutRequestId, setCheckoutRequestId] = useState<string>('');

  // Format phone display
  const cleanPhone = phone.startsWith('0') ? '254' + phone.slice(1) : phone;

  useEffect(() => {
    // Initiate STK Push on modal mount
    fetch(`/api/orders/${orderId}/mpesa-stk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: cleanPhone })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.CheckoutRequestID) {
          setCheckoutRequestId(data.CheckoutRequestID);
          setMpesaReceipt(data.mpesaReceipt || `QKD${Date.now().toString().slice(-6)}XLP`);
        }
      })
      .catch((e) => console.error(e));
  }, [orderId, cleanPhone]);

  const handleSimulatePin = async () => {
    if (pinInput.length !== 4) {
      setErrorMessage('Please enter a 4-digit M-Pesa PIN');
      return;
    }

    setStep('simulating');

    try {
      // Simulate Safaricom processing delay
      setTimeout(async () => {
        const res = await fetch(`/api/orders/${orderId}/mpesa-verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            checkoutRequestId,
            mpesaReceipt: mpesaReceipt || `QKD${Date.now().toString().slice(-6)}XLP`
          })
        });
        const data = await res.json();

        if (data.success) {
          setStep('success');
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
          });
          setTimeout(() => {
            onSuccess(data.order);
          }, 2000);
        } else {
          setStep('failed');
          setErrorMessage(data.message || 'Payment could not be verified.');
        }
      }, 1500);
    } catch (e) {
      setStep('failed');
      setErrorMessage('Network timeout during M-Pesa validation');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative">
        {/* Top Header */}
        <div className="bg-emerald-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-black text-base">Lipa na M-PESA Online</h3>
              <p className="text-xs text-emerald-100 font-mono">Paybill: {settings.mpesaPaybill || '522522'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs">
          {step === 'prompt' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Merchant:</span>
                  <strong className="text-white">{settings.storeName}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Order Reference:</span>
                  <strong className="text-cyan-400 font-mono">{orderNumber}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Recipient Phone:</span>
                  <strong className="text-white font-mono">+{cleanPhone}</strong>
                </div>
                <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800 text-sm">
                  <span className="font-bold text-white">Amount Due:</span>
                  <span className="font-black text-emerald-400 text-base">{formatPrice(amount)}</span>
                </div>
              </div>

              {/* Simulated SIM Toolkit Prompt Mockup */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 font-bold">
                  <Lock className="w-4 h-4" />
                  <span>Enter M-Pesa PIN (Simulated STK Push):</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  A real STK Push prompt was dispatched to +{cleanPhone}. For this live preview demonstration, enter any 4-digit PIN to authenticate payment.
                </p>

                <div className="space-y-2">
                  <input
                    type="password"
                    maxLength={4}
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value.replace(/\D/g, ''));
                      setErrorMessage('');
                    }}
                    placeholder="Enter 4-Digit M-Pesa PIN"
                    className="w-full text-center tracking-widest text-lg font-black bg-slate-950 border border-slate-600 rounded-xl py-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
                    autoFocus
                  />
                  {errorMessage && (
                    <div className="text-rose-400 font-bold text-center">{errorMessage}</div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSimulatePin}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all active:scale-98"
                >
                  <Zap className="w-4 h-4" />
                  <span>Authorize KES {amount.toLocaleString()} Payment</span>
                </button>
              </div>
            </div>
          )}

          {step === 'simulating' && (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto" />
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Communicating with Safaricom Daraja...</h4>
                <p className="text-slate-400">Verifying transaction receipt {mpesaReceipt}</p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-950/80 border-2 border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black text-white">Payment Confirmed!</h4>
                <p className="text-xs text-emerald-400 font-mono">M-Pesa Receipt: {mpesaReceipt}</p>
                <p className="text-xs text-slate-300">Your order has been moved to Processing.</p>
              </div>
            </div>
          )}

          {step === 'failed' && (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-950 text-rose-400 mx-auto flex items-center justify-center">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Payment Incomplete</h4>
                <p className="text-xs text-rose-400">{errorMessage}</p>
              </div>
              <button
                type="button"
                onClick={() => setStep('prompt')}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
