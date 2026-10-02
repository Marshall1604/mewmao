"use client";

import React, { useState } from "react";
import { BLOG_POSTS } from "@/data/mockData";
import { BlogPost } from "@/types";
import { useStore } from "@/context/StoreContext";
import { ArrowRight, X, ShoppingBag } from "lucide-react";

export default function BlogPage() {
  const { setIsQuickBuyOpen, language } = useStore();
  const isEn = language === "en";
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [readingPost, setReadingPost] = useState<BlogPost | null>(null);

  const categories = isEn
    ? ["All", "Cocktail Lab", "Artisanal Craft", "Underground Culture"]
    : ["Tất Cả", "Cocktail Lab", "Artisanal Craft", "Underground Culture"];

  const filteredPosts =
    selectedCategory === "All" || selectedCategory === "Tất Cả"
      ? BLOG_POSTS
      : BLOG_POSTS.filter((post) => post.category === selectedCategory);

  return (
    <div className="py-16 sm:py-24 bg-[#0a0a0a] text-white">

      {/* Header */}
      <section className="max-w-4xl mx-auto px-5 sm:px-8 text-center space-y-4">
        <span className="text-[10px] font-mono uppercase tracking-[0.35em] text-mewmao-orange font-bold block">
          {isEn ? "COCKTAIL LAB & EDITORIAL" : "TẠP CHÍ & PHA CHẾ COCKTAIL"}
        </span>
        <h1 className="font-serif text-5xl sm:text-7xl font-black text-white leading-none">
          {isEn ? (
            <>Stories by the <span className="text-amber-gradient">Glass.</span></>
          ) : (
            <>Chuyện Kể Bên <span className="text-amber-gradient">Ly Rượu.</span></>
          )}
        </h1>
        <p className="text-sm text-white/40 max-w-xl mx-auto font-light leading-relaxed">
          {isEn
            ? "Explore home mixology rituals, high mountain plum foraging memoirs, and the underground nocturnal ethos."
            : "Khám phá nghệ thuật pha chế mixology tại gia, những câu chuyện săn mơ Mộc Châu và phong cách sống của cộng đồng underground."}
        </p>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono tracking-wider uppercase transition-all ${
                selectedCategory === cat
                  ? "bg-white text-zinc-950 font-bold"
                  : "border border-white/10 text-white/40 hover:text-white hover:border-white/25"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Articles Grid */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 mt-16 sm:mt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              onClick={() => setReadingPost(post)}
              className="group cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="space-y-4">
                {/* Cover Image */}
                <div className="relative aspect-[16/11] overflow-hidden rounded-2xl bg-zinc-900">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-75 group-hover:opacity-100"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-zinc-950/80 backdrop-blur-md text-[9px] font-mono tracking-wider uppercase text-mewmao-orange border border-mewmao-orange/30">
                    {post.category}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono text-white/30">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>

                <h3 className="font-serif text-2xl font-black text-white group-hover:text-mewmao-orange transition-colors leading-snug">
                  {post.title}
                </h3>

                <p className="text-xs text-white/45 font-light line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-white/06">
                <span className="text-xs font-mono uppercase tracking-wider text-mewmao-orange group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  {isEn ? "Read Article" : "Đọc Bài Viết"} <ArrowRight className="w-3.5 h-3.5" />
                </span>
                <span className="text-[10px] font-mono text-white/25">#{post.tags[0]}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Reader Modal */}
      {readingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-3xl my-8 bg-zinc-950 border border-white/08 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-white/06 flex items-center justify-between sticky top-0 bg-zinc-950/95 backdrop-blur-md z-10">
              <span className="text-xs font-mono uppercase tracking-wider text-mewmao-orange">
                {readingPost.category}
              </span>
              <button
                onClick={() => setReadingPost(null)}
                className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/08 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-10 overflow-y-auto space-y-6">
              <div className="space-y-2">
                <div className="text-xs font-mono text-white/30">{readingPost.date} • {readingPost.readTime}</div>
                <h2 className="font-serif text-3xl sm:text-4xl font-black text-white leading-tight">{readingPost.title}</h2>
              </div>

              <div className="rounded-2xl overflow-hidden aspect-[16/9]">
                <img src={readingPost.coverImage} alt={readingPost.title} className="w-full h-full object-cover" />
              </div>

              <div className="space-y-4 text-sm text-white/55 font-light leading-relaxed">
                {readingPost.content.map((p, idx) => <p key={idx}>{p}</p>)}
              </div>

              <div className="mt-8 p-6 rounded-2xl bg-zinc-900 border border-white/06 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="font-serif text-lg font-black text-white">
                    {isEn ? "Craft this cocktail at home?" : "Tự tay pha chế ly cocktail này?"}
                  </h4>
                  <p className="text-xs text-white/40 font-light">
                    {isEn
                      ? "Order 1 bottle of Mewmao Mơ 500ml for 289,000₫."
                      : "Đặt ngay 1 chai Rượu Mewmao Mơ 500ml nguyên chất chỉ 289.000₫."}
                  </p>
                </div>
                <button
                  onClick={() => { setReadingPost(null); setIsQuickBuyOpen(true); }}
                  className="btn-vandal shrink-0 py-2.5 px-5 text-xs"
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
