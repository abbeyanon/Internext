import React, { useEffect, useState } from 'react';
import { Plus, Newspaper, Save, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { ImageUploadField } from '../../components/admin/ImageUploadField';

interface BlogRow {
  id: string;
  title: string;
  slug: string;
  category?: string;
  author?: string;
  excerpt?: string;
  image?: string;
  imageUrl?: string;
  publishedAt?: string;
  date?: string;
}

export const AdminBlog: React.FC = () => {
  const { showToast } = useToast();
  const [posts, setPosts] = useState<BlogRow[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: 'Buying Guides',
    author: 'Internext Editorial',
    excerpt: '',
    content: '',
    image: '',
    readTime: '5 min read'
  });

  const load = () => {
    fetch('/api/blog')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.posts) setPosts(data.posts);
      })
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      showToast('Title and article body are required', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Article published', 'success');
        load();
        setIsModalOpen(false);
        setForm({
          title: '',
          category: 'Buying Guides',
          author: 'Internext Editorial',
          excerpt: '',
          content: '',
          image: '',
          readTime: '5 min read'
        });
      } else {
        showToast(data.message || 'Could not publish article', 'error');
      }
    } catch {
      showToast('Error publishing article', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Blog & Buying Guides</h2>
          <p className="text-xs text-slate-400">Publish storefront articles, product guides, and tech news</p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-cyan-600/30"
        >
          <Plus className="w-4 h-4" />
          New Article
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800">
            <tr>
              <th className="p-3.5">Article</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Author</th>
              <th className="p-3.5">Published</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {posts.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">
                  <Newspaper className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  No articles yet
                </td>
              </tr>
            )}
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-slate-800/40">
                <td className="p-3.5">
                  <div className="flex items-center gap-3">
                    {(post.image || post.imageUrl) && (
                      <img src={post.image || post.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    )}
                    <div>
                      <div className="font-bold text-white">{post.title}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{post.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3.5 text-slate-300">{post.category || '—'}</td>
                <td className="p-3.5 text-slate-300">{post.author || '—'}</td>
                <td className="p-3.5 text-slate-400 font-mono">
                  {post.date || post.publishedAt ? new Date(post.date || post.publishedAt || '').toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 space-y-4 my-8 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Publish Article</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <label className="block">
              <span className="block text-slate-300 font-bold mb-1">Title</span>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                required
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-slate-300 font-bold mb-1">Category</span>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                >
                  <option>Buying Guides</option>
                  <option>Laptop Reviews</option>
                  <option>Technology News</option>
                </select>
              </label>
              <label className="block">
                <span className="block text-slate-300 font-bold mb-1">Author</span>
                <input
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </label>
            </div>
            <ImageUploadField value={form.image} onChange={(url) => setForm({ ...form, image: url })} label="Cover image" />
            <label className="block">
              <span className="block text-slate-300 font-bold mb-1">Excerpt</span>
              <input
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </label>
            <label className="block">
              <span className="block text-slate-300 font-bold mb-1">Article body</span>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white min-h-32"
                required
              />
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-800 rounded-xl font-bold">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold text-white flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Publish
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
