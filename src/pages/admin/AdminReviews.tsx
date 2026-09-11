import React, { useState, useEffect } from 'react';
import { Star, ShieldCheck, Trash2, CheckCircle2, MapPin } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { Review } from '../../types';
import { initialReviews } from '../../data/mockData';

export const AdminReviews: React.FC = () => {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);

  const fetchReviews = () => {
    fetch('/api/reviews')
      .then((res) => {
        if (!res.ok) return null;
        const ct = res.headers.get('content-type');
        return ct && ct.includes('application/json') ? res.json() : null;
      })
      .then((data) => {
        if (data && data.reviews && data.reviews.length > 0) setReviews(data.reviews);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this customer review?')) return;
    try {
      await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      showToast('Review removed', 'success');
      fetchReviews();
    } catch (e) {
      showToast('Error removing review', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-white">Customer Review Moderation</h2>
        <p className="text-xs text-slate-400">Inspect verified purchase feedback and customer ratings across Kenya</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-xl relative"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-amber-400 gap-1">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(rev.id)}
                  className="p-1 text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h4 className="text-xs font-bold text-white leading-snug">"{rev.title}"</h4>
              <p className="text-xs text-slate-300 italic leading-relaxed">{rev.comment}</p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-bold text-white">{rev.userName} ({rev.userCity})</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified Buyer
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
