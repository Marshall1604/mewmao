"use client";

import React, { useState } from "react";
import { BLOG_POSTS } from "@/data/mockData";
import { BlogPost } from "@/types";
import { useStore } from "@/context/StoreContext";
import { ArrowRight, X, ShoppingBag, Search, Sparkles, GlassWater } from "lucide-react";

function renderMarkdownText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-zinc-950 font-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export default function BlogPage() {
  const { setIsQuickBuyOpen, language } = useStore();
  const isEn = language === "en";
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [readingPost, setReadingPost] = useState<BlogPost | null>(null);

  const categories = isEn
    ? ["All", "Cocktail Lab", "Artisanal Craft", "Underground Culture"]
    : ["Tất Cả", "Cocktail Lab", "Artisanal Craft", "Underground Culture"];

  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesCategory =
      selectedCategory === "All" ||
      selectedCategory === "Tất Cả" ||
      post.category === selectedCategory;

    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesCategory;

    const matchesSearch =
      post.title.toLowerCase().includes(query) ||
      post.excerpt.toLowerCase().includes(query) ||
      post.tags.some((t) => t.toLowerCase().includes(query)) ||
      post.content.some((c) => c.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="py-16 sm:py-24 bg-[#fbfbfd] text-zinc-950 min-h-screen">
      {/* Header */}
      <section className="max-w-4xl mx-auto px-5 sm:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/70 text-mewmao-orange text-[10px] font-mono uppercase tracking-[0.25em] font-bold">
          <Sparkles className="w-3 h-3 text-mewmao-orange" />
          {isEn ? "COCKTAIL LAB & EDITORIAL" : "TẠP CHÍ & PHA CHẾ COCKTAIL"}
        </div>
        <h1 className="font-serif text-5xl sm:text-7xl font-black text-zinc-950 leading-tight">
          {isEn ? (
            <>
              Stories by the <span className="text-amber-gradient">Glass.</span>
            </>
          ) : (
            <>
              Chuyện Kể Bên <span className="text-amber-gradient">Ly Rượu.</span>
            </>
          )}
        </h1>
        <p className="text-sm sm:text-base text-zinc-500 max-w-xl mx-auto font-light leading-relaxed">
          {isEn
            ? "Explore home mixology rituals, high mountain plum foraging memoirs, and the underground nocturnal ethos."
            : "Khám phá nghệ thuật pha chế mixology tại gia, 10 công thức cocktail rượu mơ má đào cực đỉnh và phong cách thưởng rượu underground."}
        </p>

        {/* Search Bar */}
        <div className="max-w-md mx-auto pt-3">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isEn
                  ? "Search recipes, ingredients (soda, tea, yakult, beer)..."
                  : "Tìm công thức, nguyên liệu (soda, trà, yakult, dừa, bia)..."
              }
              className="w-full pl-11 pr-10 py-3 rounded-full bg-white border border-black/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-xs font-mono text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-mewmao-orange/70 focus:ring-4 focus:ring-orange-500/10 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-mono tracking-wider uppercase transition-all ${
                selectedCategory === cat
                  ? "bg-zinc-950 text-white font-bold shadow-[0_4px_14px_rgba(0,0,0,0.12)]"
                  : "border border-black/[0.08] bg-white text-zinc-600 hover:text-zinc-950 hover:border-black/20 shadow-xs"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Articles Grid */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 mt-14 sm:mt-18">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-200 bg-white rounded-3xl max-w-lg mx-auto space-y-3 shadow-xs">
            <GlassWater className="w-10 h-10 text-zinc-300 mx-auto" />
            <p className="text-sm font-mono text-zinc-500">
              {isEn
                ? "No recipes or stories found matching your search."
                : "Không tìm thấy công thức hay bài viết phù hợp."}
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="text-xs font-mono text-mewmao-orange underline hover:text-orange-700 font-semibold"
            >
              {isEn ? "Reset search filters" : "Xem tất cả bài viết"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                onClick={() => setReadingPost(post)}
                className="group cursor-pointer flex flex-col justify-between bg-white border border-black/[0.06] hover:border-black/15 p-6 rounded-[28px] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_-10px_rgba(0,0,0,0.08)]"
              >
                <div className="space-y-4">
                  {/* Cover Image */}
                  <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-zinc-100">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[9px] font-mono tracking-wider uppercase text-zinc-950 border border-black/5 font-bold shadow-xs">
                      {post.category}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl font-black text-zinc-950 group-hover:text-mewmao-orange transition-colors leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-zinc-500 font-light line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 mt-5 flex items-center justify-between border-t border-black/[0.05]">
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-950 group-hover:text-mewmao-orange group-hover:translate-x-1 transition-transform inline-flex items-center gap-1.5 font-bold">
                    {isEn ? "Read Recipe" : "Xem Chi Tiết"} <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                  <div className="flex items-center gap-1.5">
                    {post.tags.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="text-[9px] font-mono text-zinc-500 bg-zinc-100 px-2.5 py-0.5 rounded-full"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Reader Modal (Tone Trắng, Kính Mờ Tinh Tế, Phẳng Sang Trọng) */}
      {readingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/45 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-3xl my-6 bg-white/95 backdrop-blur-2xl border border-white/80 rounded-[32px] sm:rounded-[36px] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.25)] overflow-hidden max-h-[92vh] flex flex-col text-zinc-900">
            {/* Modal Header */}
            <div className="px-6 sm:px-8 py-4 border-b border-black/[0.06] flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-xl z-10">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-orange-50 text-mewmao-orange text-[10px] font-mono uppercase tracking-wider font-bold border border-orange-200/60">
                  {readingPost.category}
                </span>
                <span className="text-xs font-mono text-zinc-400 hidden sm:inline">
                  {readingPost.readTime}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setReadingPost(null)}
                className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-950 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-10 overflow-y-auto space-y-6">
              <div className="space-y-2.5">
                <div className="text-xs font-mono text-zinc-400">
                  {readingPost.date} • {readingPost.readTime}
                </div>
                <h2 className="font-serif text-2xl sm:text-4xl font-black text-zinc-950 leading-tight">
                  {readingPost.title}
                </h2>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {readingPost.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-mono text-mewmao-orange bg-orange-50/80 px-2.5 py-0.5 rounded-full border border-orange-200/50 font-medium"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Cover Image */}
              <div className="rounded-2xl overflow-hidden aspect-[16/9] border border-black/[0.06] bg-zinc-100">
                <img
                  src={readingPost.coverImage}
                  alt={readingPost.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Formatted Content */}
              <div className="space-y-3.5 pt-2">
                {readingPost.content.map((p, idx) => {
                  if (p.startsWith("### ")) {
                    return (
                      <div key={idx} className="pt-4 pb-1">
                        <h4 className="font-serif text-xl font-black text-zinc-950 border-b border-black/[0.06] pb-2.5">
                          {p.replace(/^###\s*/, "")}
                        </h4>
                      </div>
                    );
                  }
                  if (p.startsWith("> ")) {
                    return (
                      <blockquote
                        key={idx}
                        className="border-l-4 border-mewmao-orange pl-4 sm:pl-5 py-3 italic text-zinc-700 bg-orange-50/50 rounded-r-2xl text-sm leading-relaxed"
                      >
                        {renderMarkdownText(p.replace(/^>\s*/, ""))}
                      </blockquote>
                    );
                  }
                  if (
                    p.startsWith("* ") ||
                    p.startsWith("• ") ||
                    p.startsWith("- ")
                  ) {
                    return (
                      <div
                        key={idx}
                        className="flex items-start gap-3 text-zinc-700 text-sm leading-relaxed pl-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-mewmao-orange shrink-0 mt-2" />
                        <span className="flex-1">
                          {renderMarkdownText(p.replace(/^[*•-]\s*/, ""))}
                        </span>
                      </div>
                    );
                  }
                  return (
                    <p
                      key={idx}
                      className="text-sm text-zinc-600 font-light leading-relaxed"
                    >
                      {renderMarkdownText(p)}
                    </p>
                  );
                })}
              </div>

              {/* Call to Action: Order bottle */}
              <div className="mt-8 p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-zinc-50 to-orange-50/40 border border-orange-100 flex flex-col sm:flex-row items-center justify-between gap-5">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="font-serif text-lg font-black text-zinc-950">
                    {isEn ? "Craft this cocktail at home?" : "Tự tay pha chế ly cocktail này?"}
                  </h4>
                  <p className="text-xs text-zinc-500 font-light">
                    {isEn
                      ? "Order 1 bottle of Mewmao Mơ Má Đào 500ml for 289,000₫."
                      : "Đặt ngay 1 chai Rượu Mơ Má Đào Mewmao 500ml nguyên chất chỉ 289.000₫."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setReadingPost(null);
                    setIsQuickBuyOpen(true);
                  }}
                  className="btn-mewmao-black shrink-0 py-3 px-6 text-xs shadow-md hover:scale-105 transition-all"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  {isEn ? "Order Bottle" : "Mua Rượu Ngay"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

