import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { BlogPost } from '../../types';
import { initialBlogPosts } from '../../data/mockData';

export const BuyingGuidesGrid: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>(initialBlogPosts.slice(0, 3));

  useEffect(() => {
    fetch('/api/blog')
      .then((res) => {
        if (!res.ok) return null;
        const ct = res.headers.get('content-type');
        return ct && ct.includes('application/json') ? res.json() : null;
      })
      .then((data) => {
        if (data && data.posts && data.posts.length > 0) setPosts(data.posts.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  if (posts.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 bg-[#070b18] border-t border-slate-800 px-3 sm:px-4 lg:px-5">
      <div className="max-w-[1520px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider mb-1">
              Tech Knowledge Base
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Buying Guides & Tech Reviews
            </h2>
          </div>

          <a
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>Read All Articles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* 3 Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <a
              key={post.id}
              href={`/blog/${post.slug}`}
              className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl overflow-hidden flex flex-col justify-between group transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-950/20"
            >
              <div className="relative h-48 bg-slate-950 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-cyan-300 border border-slate-700 font-bold text-[10px] uppercase tracking-wider">
                  {post.category}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-3 text-slate-400 text-[11px] mb-2 font-mono">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" /> {post.readTime}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-cyan-400 group-hover:text-cyan-300">
                  <span>Read Full Guide</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
