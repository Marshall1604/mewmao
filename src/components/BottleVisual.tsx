"use client";

import React, { useState, useRef } from "react";
import { Sparkles, Wine, Droplets, ShieldCheck } from "lucide-react";

export default function BottleVisual() {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotateY(Math.max(-15, Math.min(15, x * 0.08)));
    setRotateX(Math.max(-15, Math.min(15, -y * 0.08)));
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-sm sm:max-w-md mx-auto aspect-[3/4] flex items-center justify-center cursor-pointer select-none perspective-[1000px]"
    >
      {/* Radiant Amber Glow aura behind bottle */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-amber-600/30 via-orange-500/25 to-yellow-400/20 blur-3xl animate-pulse-glow" />
      </div>

      {/* 3D Tilting Glass Bottle Container */}
      <div
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: "transform 0.15s ease-out",
          transformStyle: "preserve-3d",
        }}
        className="relative z-10 w-52 sm:w-60 h-[380px] sm:h-[440px] flex flex-col items-center justify-center"
      >
        {/* Bottle Neck Stopper (Natural Oak Wood) */}
        <div className="w-10 h-7 rounded-t-md bg-gradient-to-r from-[#8B5A2B] via-[#A06535] to-[#704214] border border-[#5C3317] shadow-sm relative z-30">
          <div className="w-full h-1 bg-amber-900/40 mt-3" />
        </div>

        {/* Bottle Neck (Heavy Glass) */}
        <div className="w-12 h-14 bg-gradient-to-r from-white/70 via-white/20 to-white/60 backdrop-blur-md border-x border-zinc-300/80 relative z-20 flex items-center justify-center">
          {/* Inner amber liquor column */}
          <div className="w-8 h-full bg-gradient-to-b from-amber-500/70 to-orange-600/90" />
        </div>

        {/* Bottle Shoulder & Body (Architectural Modern Minimalist Glass Flask) */}
        <div className="relative w-full flex-1 rounded-3xl overflow-hidden border-2 border-zinc-200/90 shadow-apple-lg bg-gradient-to-b from-white/50 via-white/10 to-white/40 backdrop-blur-xl">
          {/* Liquid Amber Filling */}
          <div className="absolute inset-x-0 bottom-0 top-6 bg-gradient-to-b from-amber-500/80 via-orange-600/90 to-amber-700/95 overflow-hidden">
            {/* Shimmer light reflection effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 transform -translate-x-full animate-[shimmer_5s_infinite]" />

            {/* Glowing amber liquid depth */}
            <div className="absolute bottom-4 inset-x-4 h-24 bg-gradient-to-t from-yellow-300/30 to-transparent blur-md pointer-events-none" />
          </div>

          {/* Craft Paper Label (Apple Minimalist Label Design) */}
          <div className="absolute inset-x-5 top-16 bottom-16 bg-[#FAFAF8] rounded-xl shadow-md border border-zinc-200/70 p-5 flex flex-col justify-between text-zinc-900 text-center z-20">
            {/* Label Header */}
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono tracking-[0.3em] uppercase text-zinc-400">
                HANDCRAFTED SPIRIT
              </span>
              <h2 className="text-xl font-black tracking-tighter text-zinc-950">
                MEWMAO
              </h2>
              <div className="w-8 h-0.5 bg-mewmao-orange mx-auto my-1" />
              <p className="text-[10px] font-medium text-zinc-600">
                RƯỢU MƠ MÁ ĐÀO
              </p>
            </div>

            {/* Label Center Icon */}
            <div className="py-2 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full border border-orange-200 bg-orange-50/50 flex items-center justify-center text-mewmao-orange">
                <Wine className="w-5 h-5" />
              </div>
            </div>

            {/* Label Footer Specs */}
            <div className="pt-2 border-t border-zinc-200/60 grid grid-cols-2 text-[9px] font-mono text-zinc-500">
              <div className="text-left">
                <span className="block text-[8px] text-zinc-400">BATCH</span>
                <strong className="text-zinc-800">01/2026</strong>
              </div>
              <div className="text-right">
                <span className="block text-[8px] text-zinc-400">ABV / VOL</span>
                <strong className="text-mewmao-orange">19% • 500ML</strong>
              </div>
            </div>
          </div>

          {/* Glass Specular Glare / Reflection (Gloss highlights) */}
          <div className="absolute top-0 bottom-0 left-3 w-3 bg-gradient-to-r from-white/70 to-transparent pointer-events-none rounded-full" />
          <div className="absolute top-0 bottom-0 right-4 w-1.5 bg-gradient-to-r from-transparent to-white/40 pointer-events-none rounded-full" />
        </div>

        {/* Heavy Glass Base */}
        <div className="w-[85%] h-4 bg-white/70 border-x border-b border-zinc-300 rounded-b-2xl backdrop-blur-md shadow-sm" />
      </div>

      {/* Floating Interactive Badge (Left) */}
      <div className="absolute -left-2 sm:left-4 top-1/4 z-30 p-2.5 rounded-2xl bg-white/90 border border-zinc-200/80 shadow-apple backdrop-blur-md text-left text-xs max-w-[140px] animate-float-slow hidden xs:block">
        <div className="flex items-center gap-1.5 text-mewmao-orange font-bold text-[11px]">
          <Droplets className="w-3.5 h-3.5" />
          <span>Mơ Má Đào</span>
        </div>
        <p className="text-[10px] text-zinc-500 mt-0.5 leading-tight">
          Hái tuyển từng quả chín mọng Mộc Châu.
        </p>
      </div>

      {/* Floating Interactive Badge (Right) */}
      <div className="absolute -right-2 sm:right-4 bottom-1/4 z-30 p-2.5 rounded-2xl bg-white/90 border border-zinc-200/80 shadow-apple backdrop-blur-md text-left text-xs max-w-[140px] animate-float-slow hidden xs:block">
        <div className="flex items-center gap-1.5 text-zinc-900 font-bold text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Ủ Chum 365 Ngày</span>
        </div>
        <p className="text-[10px] text-zinc-500 mt-0.5 leading-tight">
          Không cồn hóa học, êm say mượt mà.
        </p>
      </div>
    </div>
  );
}
