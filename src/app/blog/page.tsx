"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BLOG_POSTS } from "@/data/mockData";
import { BlogPost } from "@/types";
import { useStore } from "@/context/StoreContext";
import { ArrowRight, ArrowLeft, X, ShoppingBag, Search, GlassWater } from "lucide-react";

function renderMarkdownText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-white font-bold">
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

  // Lock body scroll when reading full-screen
  useEffect(() => {
    if (readingPost) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [readingPost]);

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
    <div className="py-16 sm:py-24 bg-[#0a0a0a] text-white min-h-screen">
      {/* Header - Phẳng, không bị đóng khung */}
      <section className="max-w-4xl mx-auto px-5 sm:px-8 text-center space-y-4">
        <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.35em] text-mewmao-orange font-bold block">
          {isEn ? "COCKTAIL LAB & EDITORIAL" : "TẠP CHÍ & PHA CHẾ COCKTAIL"}
        </span>

        <h1 className="font-serif text-5xl sm:text-7xl font-black text-white leading-tight">
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
        <p className="text-sm sm:text-base text-white/50 max-w-xl mx-auto font-light leading-relaxed">
          {isEn
            ? "Explore home mixology rituals, high mountain plum foraging memoirs, and the underground nocturnal ethos."
            : "Khám phá nghệ thuật pha chế mixology tại gia, 10 công thức cocktail rượu mơ má đào cực đỉnh và phong cách thưởng rượu underground."}
        </p>

        {/* Search Bar - Tone tối tinh gọn, phẳng */}
        <div className="max-w-md mx-auto pt-3">
          <div className="relative">
            <Search className="w-4 h-4 text-white/35 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isEn
                  ? "Search recipes, ingredients (soda, tea, yakult, beer)..."
                  : "Tìm công thức, nguyên liệu (soda, trà, yakult, dừa, bia)..."
              }
              className="w-full pl-11 pr-10 py-3 rounded-full bg-white/05 border border-white/10 shadow-inner text-xs font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-mewmao-orange/70 focus:bg-white/08 focus:ring-4 focus:ring-orange-500/10 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Tabs - Tối ưu cho Mobile: Chỉ 1 hàng ngang duy nhất, không xuống hàng */}
        <div className="w-full max-w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pt-4 pb-1">
          <div className="flex flex-nowrap items-center justify-start sm:justify-center gap-2 px-1 sm:px-0 w-max mx-auto min-w-full sm:min-w-0">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 whitespace-nowrap px-3.5 sm:px-4 py-2 rounded-full text-[11px] sm:text-xs font-mono tracking-wider uppercase transition-all ${
                  selectedCategory === cat
                    ? "bg-white text-zinc-950 font-bold shadow-lg"
                    : "border border-white/10 bg-white/[0.03] text-white/50 hover:text-white hover:border-white/25 shadow-xs"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 mt-14 sm:mt-18">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 bg-zinc-900/30 rounded-3xl max-w-lg mx-auto space-y-3 shadow-xs">
            <GlassWater className="w-10 h-10 text-white/20 mx-auto" />
            <p className="text-sm font-mono text-white/40">
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
              className="text-xs font-mono text-mewmao-orange underline hover:text-amber-300 font-semibold"
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
                className="group cursor-pointer flex flex-col justify-between bg-zinc-900/40 hover:bg-zinc-900/80 border border-white/06 hover:border-white/15 p-6 rounded-[28px] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_-10px_rgba(0,0,0,0.6)]"
              >
                <div className="space-y-4">
                  {/* Cover Image */}
                  <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-zinc-950">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85 group-hover:opacity-100"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-zinc-950/85 backdrop-blur-md text-[9px] font-mono tracking-wider uppercase text-mewmao-orange border border-mewmao-orange/30 font-bold shadow-xs">
                      {post.category}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-mono text-white/35">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl font-black text-white group-hover:text-mewmao-orange transition-colors leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-white/45 font-light line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 mt-5 flex items-center justify-between border-t border-white/06">
                  <span className="text-xs font-mono uppercase tracking-wider text-mewmao-orange group-hover:translate-x-1 transition-transform inline-flex items-center gap-1.5 font-bold">
                    {isEn ? "Read Recipe" : "Xem Chi Tiết"} <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                  <div className="flex items-center gap-1.5">
                    {post.tags.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="text-[9px] font-mono text-white/35 bg-white/05 px-2.5 py-0.5 rounded-full border border-white/05"
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

      {/* Reader: TOÀN MÀN HÌNH (Full-Screen, Không bị đóng khung, Tone Đen Sang Trọng) */}
      <AnimatePresence>
        {readingPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-50 bg-[#0a0a0a] text-white overflow-y-auto"
          >
            {/* Top Sticky Full-Width Navigation Bar */}
            <div className="sticky top-0 z-30 w-full bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/08">
              <div className="max-w-4xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setReadingPost(null)}
                  className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-wider font-bold text-white/80 hover:text-mewmao-orange transition-colors group py-2"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-mewmao-orange" />
                  <span>{isEn ? "Back to Articles" : "Quay Lại Bài Viết"}</span>
                </button>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-white/40 hidden sm:inline">
                    {readingPost.readTime}
                  </span>
                  <button
                    type="button"
                    onClick={() => setReadingPost(null)}
                    className="w-9 h-9 rounded-full bg-white/08 hover:bg-white/15 text-white/70 hover:text-white flex items-center justify-center transition-colors"
                    aria-label={isEn ? "Close" : "Đóng"}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Main Reading Canvas - Tràn toàn màn hình, thoáng đãng, sang trọng */}
            <main className="max-w-3xl mx-auto px-5 sm:px-8 py-8 sm:py-14 space-y-8">
              {/* Header Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-xs font-mono text-white/40">
                  <span className="text-mewmao-orange font-bold uppercase tracking-wider">
                    {readingPost.category}
                  </span>
                  <span>•</span>
                  <span>{readingPost.date}</span>
                  <span>•</span>
                  <span>{readingPost.readTime}</span>
                </div>

                <h1 className="font-serif text-3xl sm:text-5xl font-black text-white leading-tight">
                  {readingPost.title}
                </h1>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {readingPost.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[11px] font-mono text-mewmao-orange/90 bg-mewmao-orange/10 border border-mewmao-orange/20 px-3 py-1 rounded-full font-medium"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Cover Image - Full Width, High Res */}
              <div className="rounded-3xl overflow-hidden aspect-[16/10] sm:aspect-[16/9] bg-zinc-900 border border-white/08 shadow-2xl">
                <img
                  src={readingPost.coverImage}
                  alt={readingPost.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Formatted Content - Trình bày tinh tế, dễ đọc */}
              <div className="space-y-4 pt-2">
                {readingPost.content.map((p, idx) => {
                  if (p.startsWith("### ")) {
                    return (
                      <div key={idx} className="pt-6 pb-1">
                        <h3 className="font-serif text-2xl font-black text-amber-400 border-b border-white/10 pb-2.5">
                          {p.replace(/^###\s*/, "")}
                        </h3>
                      </div>
                    );
                  }
                  if (p.startsWith("> ")) {
                    return (
                      <blockquote
                        key={idx}
                        className="border-l-4 border-mewmao-orange pl-5 sm:pl-6 py-4 italic text-amber-100/90 bg-white/[0.03] rounded-r-2xl text-base leading-relaxed"
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
                        className="flex items-start gap-3.5 text-white/85 text-base leading-relaxed pl-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-mewmao-orange shrink-0 mt-2.5" />
                        <span className="flex-1">
                          {renderMarkdownText(p.replace(/^[*•-]\s*/, ""))}
                        </span>
                      </div>
                    );
                  }
                  return (
                    <p
                      key={idx}
                      className="text-base text-white/65 font-light leading-relaxed"
                    >
                      {renderMarkdownText(p)}
                    </p>
                  );
                })}
              </div>

              {/* Call to Action: Order bottle */}
              <div className="mt-14 p-8 sm:p-10 rounded-3xl bg-zinc-900 border border-white/08 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-1.5 text-center sm:text-left">
                  <h4 className="font-serif text-xl sm:text-2xl font-black text-white">
                    {isEn ? "Craft this cocktail at home?" : "Tự tay pha chế ly cocktail này?"}
                  </h4>
                  <p className="text-sm text-white/50 font-light">
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
                  className="btn-vandal shrink-0 py-3.5 px-8 text-xs shadow-lg hover:scale-105 transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {isEn ? "Order Bottle" : "Mua Rượu Ngay"}
                </button>
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

