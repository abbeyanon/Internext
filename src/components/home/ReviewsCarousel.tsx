import React, { useState, useEffect } from 'react';
import { Star, ShieldCheck, CheckCircle2, Quote, MapPin } from 'lucide-react';
import { Review } from '../../types';
import { initialReviews } from '../../data/mockData';

export const ReviewsCarousel: React.FC = () => {
  const [reviewsList, setReviewsList] = useState<Review[]>(initialReviews);

  useEffect(() => {
    fetch('/api/reviews')
      .then((res) => {
        if (!res.ok) return null;
        const ct = res.headers.get('content-type');
        return ct && ct.includes('application/json') ? res.json() : null;
      })
      .then((data) => {
        if (data && data.reviews && data.reviews.length > 0) setReviewsList(data.reviews);
      })
      .catch(() => {});
  }, []);

  if (reviewsList.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 bg-slate-950 px-3 sm:px-4 lg:px-5">
      <div className="max-w-[1520px] mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" /> 1,500+ Verified Customer Ratings
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Trusted by Creators, Developers & Businesses Across Kenya
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Real feedback from verified buyers in Nairobi, Mombasa, Eldoret, Kisumu, and Nakuru.
          </p>
        </div>

        {/* Reviews Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviewsList.map((review) => (
            <div
              key={review.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all hover:shadow-xl hover:shadow-cyan-950/20"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-amber-400 gap-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  {review.verifiedPurchase && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                      <ShieldCheck className="w-3 h-3" /> Verified Buyer
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-bold text-white leading-snug">
                  "{review.title}"
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed italic">
                  {review.comment}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="font-bold text-white">{review.userName}</div>
                <div className="flex items-center gap-1 text-[11px] text-cyan-400 font-mono">
                  <MapPin className="w-3 h-3" /> {review.userCity}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
