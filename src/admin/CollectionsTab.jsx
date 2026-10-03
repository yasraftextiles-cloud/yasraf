import React, { useState, useEffect } from 'react';
import { Layers, Plus, Check, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase.js';
import { getCollections } from '../services/supabaseService.js';

export default function CollectionsTab() {
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBadge, setNewBadge] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchCollectionsList = async () => {
    setIsLoading(true);
    try {
      const data = await getCollections();
      setCollections(data || []);
    } catch (err) {
      console.warn('Failed to load collections:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollectionsList();
  }, []);

  const handleAddCollection = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSaving(true);
    setErrorMsg(null);

    const slug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const id = `col-${slug}`;

    try {
      const { error } = await supabase
        .from('collections')
        .insert({
          id,
          slug,
          title: newTitle.trim(),
          badge: newBadge.trim() || null,
          is_active: true
        });

      if (error) throw error;
      setNewTitle('');
      setNewBadge('');
      await fetchCollectionsList();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add collection.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 text-left">
      
      {/* Header */}
      <div className="border-b border-[#ebe6e0] pb-3">
        <h1 
          className="text-2xl sm:text-3xl text-[#1a1814] font-normal tracking-wide"
          style={{ fontFamily: 'var(--font-family-editorial)' }}
        >
          Collections & Edits
        </h1>
        <p className="text-[12px] text-[#67615c] mt-0.5">
          Curated brand edits and thematic drops featured across navigation bars and lookbooks.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-[#fdf2f2] border border-[#f5c6cb] text-[#721c24] text-[12.5px]">
          {errorMsg}
        </div>
      )}

      {/* Add New Collection Mini-Form */}
      <div className="bg-white border border-[#ebe6e0] p-6 shadow-2xs space-y-4">
        <h2 className="text-[12px] uppercase tracking-[0.16em] font-semibold text-[#1a1814]">
          Add New Collection
        </h2>
        <form onSubmit={handleAddCollection} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Collection title (e.g. Eid Luxe Prêt 2026)"
            className="flex-1 px-3.5 py-2.5 text-[13px] border border-[#ebe6e0] bg-[#faf8f6] focus:bg-white focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880]/30 transition-all"
          />
          <input
            type="text"
            value={newBadge}
            onChange={(e) => setNewBadge(e.target.value)}
            placeholder="Badge (e.g. HOT, LUXE)"
            className="sm:w-36 px-3.5 py-2.5 text-[13px] border border-[#ebe6e0] bg-[#faf8f6] focus:bg-white focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880]/30 transition-all"
          />
          <button
            type="submit"
            disabled={isSaving}
            className="admin-btn-primary h-11 px-5 text-[11.5px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={15} />}
            <span>Add Edit</span>
          </button>
        </form>
      </div>

      {/* Collections Grid */}
      <div className="bg-white border border-[#ebe6e0] overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-[#ebe6e0] bg-[#faf8f6] text-[11px] uppercase tracking-[0.16em] text-[#8c867f] font-medium">
          Active Storefront Collections
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-[#8c867f]">
            <Loader2 size={20} className="animate-spin mx-auto mb-2 text-[#c5a880]" />
            <span className="text-[12px]">Loading Collections...</span>
          </div>
        ) : (
          <div className="divide-y divide-[#ebe6e0]">
            {collections.map((col) => (
              <div key={col.id || col.slug} className="p-4 flex items-center justify-between hover:bg-[#faf8f6]/50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#1a1814] text-[13.5px]">{col.title}</span>
                    {col.badge && (
                      <span className="px-2 py-0.5 bg-[#c5a880]/20 text-[#c5a880] text-[9.5px] uppercase tracking-wider font-semibold">
                        {col.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#8c867f] font-mono mt-0.5">
                    Slug: {col.slug}
                  </div>
                </div>

                <span className="text-[11px] uppercase tracking-wider text-[#2c6e56] font-medium flex items-center gap-1">
                  <Check size={13} /> Active
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
