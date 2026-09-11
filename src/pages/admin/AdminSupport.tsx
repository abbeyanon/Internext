import React, { useState, useEffect } from 'react';
import { HelpCircle, Send, CheckCircle2, MessageCircle, Clock, User } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { SupportTicket } from '../../types';

const defaultTickets: SupportTicket[] = [
  {
    id: 't-1',
    ticketNumber: 'TCK-8812',
    customerName: 'Dennis Mwangi',
    customerEmail: 'dennis.mwangi@gmail.com',
    customerPhone: '+254 759 508 348',
    subject: 'Warranty registration for MacBook Pro M3',
    category: 'Warranty',
    status: 'Open',
    priority: 'high',
    assignedTo: 'Support Team',
    messages: [
      {
        sender: 'customer',
        text: 'Hi, I received my MacBook Pro M3 Max today. How do I register the 1-year AppleCare warranty?',
        timestamp: '2026-08-27T10:15:00Z'
      },
      {
        sender: 'staff',
        staffName: 'Support Agent',
        text: 'Hello Dennis, your warranty was auto-registered with Apple East Africa upon dispatch. The serial number is active in Apple Support.',
        timestamp: '2026-08-27T10:30:00Z'
      }
    ],
    createdAt: '2026-08-27T10:15:00Z'
  }
];

export const AdminSupport: React.FC = () => {
  const { showToast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>(defaultTickets);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(defaultTickets[0]);
  const [replyText, setReplyText] = useState('');

  const fetchTickets = () => {
    fetch('/api/tickets')
      .then((res) => {
        if (!res.ok) return null;
        const ct = res.headers.get('content-type');
        return ct && ct.includes('application/json') ? res.json() : null;
      })
      .then((data) => {
        if (data && data.tickets && data.tickets.length > 0) {
          setTickets(data.tickets);
          if (!selectedTicket) setSelectedTicket(data.tickets[0]);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyText.trim() })
      });
      const data = await res.json();
      if (data.success && data.ticket) {
        showToast('Reply dispatched to customer!', 'success');
        setSelectedTicket(data.ticket);
        fetchTickets();
        setReplyText('');
      }
    } catch (e) {
      showToast('Error sending reply', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-white">Support Inquiries & Ticket Resolution</h2>
        <p className="text-xs text-slate-400">Manage customer pre-sales inquiries, compatibility questions, and warranty claims</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ticket List (4 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-2 max-h-[600px] overflow-y-auto">
          {tickets.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedTicket(t)}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all text-xs space-y-1 ${
                selectedTicket?.id === t.id
                  ? 'bg-cyan-950/80 border-cyan-500 text-white shadow-lg'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="font-mono text-cyan-400">{t.ticketNumber}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {t.status}
                </span>
              </div>
              <div className="font-bold text-white truncate">{t.subject}</div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                <span>{t.customerName}</span>
                <span>{new Date(t.createdAt).toLocaleDateString()}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Conversation Thread & Reply (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-6 min-h-[500px]">
          {selectedTicket ? (
            <>
              {/* Header */}
              <div className="border-b border-slate-800 pb-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-cyan-400">{selectedTicket.ticketNumber}</span>
                  <span className="text-xs text-slate-400 font-mono">{selectedTicket.customerEmail} • {selectedTicket.customerPhone}</span>
                </div>
                <h3 className="text-base font-bold text-white">{selectedTicket.subject}</h3>
                <span className="inline-block text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                  Category: {selectedTicket.category}
                </span>
              </div>

              {/* Messages Thread */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 text-xs">
                {selectedTicket.messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl ${
                      m.sender === 'staff'
                        ? 'bg-cyan-950/60 border border-cyan-800/50 text-cyan-100 ml-6'
                        : 'bg-slate-950 border border-slate-800 text-slate-300 mr-6'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-[11px] mb-1">
                      <span>{m.sender === 'staff' ? '👨‍💻 Internext Support Specialist' : `👤 ${selectedTicket.customerName}`}</span>
                      <span className="font-mono text-[10px] text-slate-400 font-normal">{new Date(m.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="leading-relaxed">{m.text}</p>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="pt-4 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type official staff response..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-20 text-slate-500 text-xs">Select a support ticket to review messages</div>
          )}
        </div>
      </div>
    </div>
  );
};
