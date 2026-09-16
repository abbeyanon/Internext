import React, { useEffect, useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface Invite {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
  acceptedAt?: string | null;
  revokedAt?: string | null;
  createdAt?: string;
}

export const AdminStaff: React.FC = () => {
  const { showToast } = useToast();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  const load = () => {
    fetch('/api/admin/invites')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.invites) setInvites(data.invites);
      })
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    try {
      const res = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Invite sent to ${email.trim()}`, 'success');
        setEmail('');
        load();
      } else {
        showToast(data.message || 'Could not send invite', 'error');
      }
    } catch {
      showToast('Error sending invite', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!window.confirm('Revoke this invite?')) return;
    try {
      const res = await fetch(`/api/admin/invites/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Invite revoked', 'success');
        load();
      }
    } catch {
      showToast('Error revoking invite', 'error');
    }
  };

  const statusOf = (invite: Invite) => {
    if (invite.revokedAt) return { label: 'Revoked', className: 'bg-rose-950 text-rose-400 border-rose-800' };
    if (invite.acceptedAt) return { label: 'Accepted', className: 'bg-emerald-950 text-emerald-400 border-emerald-800' };
    if (new Date(invite.expiresAt) < new Date()) return { label: 'Expired', className: 'bg-slate-800 text-slate-400 border-slate-700' };
    return { label: 'Pending', className: 'bg-amber-950 text-amber-400 border-amber-800' };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-white">Staff invites</h2>
        <p className="text-xs text-slate-400">Invite sales managers. Admins can only be created from the server bootstrap script.</p>
      </div>

      <form onSubmit={handleInvite} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="sales.manager@company.co.ke"
          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white"
          required
        />
        <button
          type="submit"
          disabled={sending}
          className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Invite sales manager
        </button>
      </form>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800">
            <tr>
              <th className="p-3.5">Email</th>
              <th className="p-3.5">Role</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Expires</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {invites.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  No invites sent yet
                </td>
              </tr>
            )}
            {invites.map((invite) => {
              const status = statusOf(invite);
              return (
                <tr key={invite.id} className="hover:bg-slate-800/40">
                  <td className="p-3.5 font-bold text-white">{invite.email}</td>
                  <td className="p-3.5 text-slate-300 font-mono">{invite.role.replace('_', ' ')}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400 font-mono">{new Date(invite.expiresAt).toLocaleDateString()}</td>
                  <td className="p-3.5 text-right">
                    {!invite.acceptedAt && !invite.revokedAt && (
                      <button
                        type="button"
                        onClick={() => handleRevoke(invite.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400"
                        title="Revoke invite"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
