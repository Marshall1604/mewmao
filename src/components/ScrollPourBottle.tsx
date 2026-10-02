"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useStore } from "@/context/StoreContext";
import { ShoppingBag, ArrowRight, Droplets } from "lucide-react";

export default function ScrollPourBottle() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { product, setIsQuickBuyOpen, t } = useStore();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 22,
    restDelta: 0.001,
  });

  // Standing bottle transforms
  const standingOpacity = useTransform(smoothProgress, [0, 0.3, 0.45], [1, 1, 0]);
  const standingRotateZ = useTransform(smoothProgress, [0, 0.35], [0, -18]);
  const standingScale = useTransform(smoothProgress, [0, 0.35], [1, 1.06]);

  // Pouring bottle transforms
  const pouringOpacity = useTransform(smoothProgress, [0.35, 0.48, 0.85], [0, 1, 1]);
  const pouringY = useTransform(smoothProgress, [0.35, 0.55], [-30, 0]);
  const pouringScale = useTransform(smoothProgress, [0.35, 0.6], [0.9, 1]);

  // Glass
  const glassOpacity = useTransform(smoothProgress, [0.42, 0.58], [0, 1]);
  const glassY = useTransform(smoothProgress, [0.42, 0.55], [40, 0]);
  const glassFillHeight = useTransform(smoothProgress, [0.55, 0.82], ["8%", "88%"]);

  // Ink brush background reveals (simulated with opacity on bg layers)
  const inkOpacity1 = useTransform(smoothProgress, [0, 0.15], [0, 0.8]);
  const inkOpacity2 = useTransform(smoothProgress, [0.3, 0.5], [0, 0.6]);

  // Text reveals
  const text1Opacity = useTransform(smoothProgress, [0, 0.22, 0.32], [1, 1, 0]);
  const text2Opacity = useTransform(smoothProgress, [0.35, 0.5, 0.68], [0, 1, 0]);
  const text3Opacity = useTransform(smoothProgress, [0.72, 0.82, 1], [0, 1, 1]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[240vh] sm:h-[270vh] bg-[#0a0a0a]"
    >
      {/* Pinned sticky viewport */}
      <div className="sticky top-0 h-screen w-full flex flex-col overflow-hidden select-none">

        {/* ── DARK BACKGROUND + AMBIENT GLOW ── */}
        <div className="absolute inset-0 z-0">
          {/* Ambient orange glow center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-radial from-orange-600/12 via-orange-900/06 to-transparent blur-3xl pointer-events-none animate-pulse-glow" />
          {/* Top-left dark gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
        </div>

        {/* ── INK BRUSH STROKES (SVG) ── */}
        <motion.div
          style={{ opacity: inkOpacity1 }}
          className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
        >
          {/* Large diagonal ink stroke — left side */}
          <svg
            className="absolute -left-10 top-0 h-full w-[55%] opacity-25"
            viewBox="0 0 400 800"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M-20 800 Q60 500 100 350 Q160 150 80 -20"
              stroke="white"
              strokeWidth="120"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </motion.div>

        <motion.div
          style={{ opacity: inkOpacity2 }}
          className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
        >
          {/* Large diagonal ink stroke — right side */}
          <svg
            className="absolute -right-10 bottom-0 h-full w-[50%] opacity-20"
            viewBox="0 0 400 800"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M420 -20 Q340 250 300 450 Q240 650 320 820"
              stroke="white"
              strokeWidth="90"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </motion.div>

        {/* ── MAIN LAYOUT (flex col, between) ── */}
        <div className="relative z-10 flex flex-col h-full px-5 sm:px-8 lg:px-12 pt-20 pb-8">
          
          {/* NARRATIVE HEADLINES */}
          <div className="relative w-full max-w-5xl mx-auto text-center pt-2 sm:pt-6 min-h-[140px] sm:min-h-[160px] flex items-center justify-center">
            
            {/* Stage 1 */}
            <motion.div
              style={{ opacity: text1Opacity }}
              className="absolute inset-x-0 space-y-3 pointer-events-none"
            >
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.35em] text-mewmao-orange font-bold block">
                {t("pour_step1_tag")}
              </span>
              {/* Vandal Bar style: huge display text, outline + filled mix */}
              <h1 className="font-serif leading-none tracking-tight">
                <span className="block text-5xl sm:text-7xl lg:text-8xl font-black text-white">
                  Survive in the
                </span>
                <span className="block text-6xl sm:text-8xl lg:text-[110px] font-black text-amber-gradient">
                  Mewmao
                </span>
                <span className="block text-4xl sm:text-6xl lg:text-7xl font-black text-white/20 tracking-widest uppercase" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.3)" }}>
                  Distillery
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-white/45 max-w-md mx-auto font-sans font-light tracking-wide">
                {t("pour_step1_desc")}
              </p>
            </motion.div>

            {/* Stage 2 */}
            <motion.div
              style={{ opacity: text2Opacity }}
              className="absolute inset-x-0 space-y-3 pointer-events-none"
            >
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.35em] text-mewmao-orange font-bold block">
                {t("pour_step2_tag")}
              </span>
              <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-none">
                {t("pour_step2_title")}
              </h2>
              <p className="text-xs sm:text-sm text-white/45 max-w-md mx-auto font-sans font-light">
                {t("pour_step2_desc")}
              </p>
            </motion.div>

            {/* Stage 3 — CTA */}
            <motion.div
              style={{ opacity: text3Opacity }}
              className="absolute inset-x-0 space-y-4 z-30"
            >
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.35em] text-emerald-400 font-bold block">
                {t("pour_step3_tag")}
              </span>
              <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-none">
                {t("pour_step3_title")}
              </h2>
              <div className="flex items-center justify-center gap-3 pt-2">
                {/* Star rating — Vandal Bar style */}
                <div className="flex items-center gap-2 text-xs text-white/50 font-mono">
                  <span className="text-mewmao-orange text-base tracking-widest">★★★★★</span>
                  <span>4.9 • 96 Reviews</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  onClick={() => setIsQuickBuyOpen(true)}
                  className="btn-vandal text-xs sm:text-[13px] px-7 py-3"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t("hero_cta")}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <span className="text-white/35 text-xs font-mono line-through">350,000₫</span>
              </div>
            </motion.div>
          </div>

          {/* BOTTLE STAGE */}
          <div className="relative flex-1 w-full max-w-lg mx-auto flex items-center justify-center my-2">
            {/* Standing bottle */}
            <motion.div
              style={{
                opacity: standingOpacity,
                rotateZ: standingRotateZ,
                scale: standingScale,
              }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="relative w-52 sm:w-72 h-[340px] sm:h-[460px] flex items-center justify-center">
                <img
                  src="/images/mewmao-bottle-standing.jpg"
                  alt="Mewmao Artisanal Plum Bottle"
                  className="w-full h-full object-contain drop-shadow-2xl mix-blend-lighten"
                  style={{ filter: "drop-shadow(0 0 40px rgba(255,94,0,0.15))" }}
                />
                {/* Info chip — left */}
                <div className="absolute -left-2 sm:left-0 top-1/4 px-2.5 py-2 rounded-xl bg-white/08 border border-white/10 backdrop-blur-md text-left text-xs max-w-[130px] hidden xs:block">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-mewmao-orange font-bold block">
                    HERITAGE
                  </span>
                  <p className="text-[11px] text-white/70 font-serif leading-tight mt-0.5">
                    Mơ má đào Mộc Châu ủ chum sành.
                  </p>
                </div>
                {/* Info chip — right */}
                <div className="absolute -right-2 sm:right-0 bottom-1/4 px-2.5 py-2 rounded-xl bg-white/08 border border-white/10 backdrop-blur-md text-left text-xs max-w-[130px] hidden xs:block">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-white/40 font-bold block">
                    STRENGTH
                  </span>
                  <p className="text-[11px] text-white font-mono font-bold leading-tight mt-0.5">
                    19% ABV • 500ml
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Pouring bottle */}
            <motion.div
              style={{
                opacity: pouringOpacity,
                y: pouringY,
                scale: pouringScale,
              }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="relative w-60 sm:w-80 h-[380px] sm:h-[500px] flex items-center justify-center">
                <img
                  src="/images/mewmao-bottle-pouring.jpg"
                  alt="Mewmao Plum Spirit Pouring"
                  className="w-full h-full object-contain drop-shadow-2xl mix-blend-lighten translate-x-3 sm:translate-x-6 -translate-y-4"
                  style={{ filter: "drop-shadow(0 0 60px rgba(255,120,0,0.2))" }}
                />
              </div>
            </motion.div>

            {/* Crystal glass receiving pour */}
            <motion.div
              style={{ opacity: glassOpacity, y: glassY }}
              className="absolute bottom-0 sm:bottom-4 right-4 sm:right-16 z-10 w-24 sm:w-32 h-24 sm:h-32 rounded-2xl border border-white/10 bg-white/05 backdrop-blur-md shadow-2xl flex flex-col justify-end p-2 overflow-hidden"
            >
              {/* Ice cube */}
              <div className="absolute bottom-4 left-3 w-8 sm:w-10 h-8 sm:h-10 rounded-lg border border-white/25 bg-white/10 backdrop-blur-md rotate-12 shadow-sm z-20" />
              {/* Rising amber liquid */}
              <motion.div
                style={{ height: glassFillHeight }}
                className="w-full rounded-xl bg-gradient-to-t from-orange-700 via-orange-500 to-amber-400/80 shadow-inner relative z-10"
              >
                <div className="absolute top-0 inset-x-0 h-0.5 bg-yellow-200/80 rounded-t-xl" />
              </motion.div>
              {/* Glass rim */}
              <div className="absolute top-0 inset-x-0 h-0.5 bg-white/30" />
              <span className="absolute bottom-1 right-2 text-[7px] font-mono text-white/40 z-20">
                MEWMAO
              </span>
            </motion.div>
          </div>

          {/* Bottom bar */}
          <div className="w-full flex items-center justify-between text-xs text-white/25 pt-3 border-t border-white/06 max-w-5xl mx-auto z-20">
            <div className="flex items-center gap-2 text-[11px] font-medium text-white/40">
              <Droplets className="w-3.5 h-3.5 text-mewmao-orange" />
              <span className="tracking-wide font-mono">EST 2023 • Moc Chau Blush Plums</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-white/30 hidden sm:inline">
                {t("hero_scroll_hint")}
              </span>
              <div className="w-4 h-7 rounded-full border border-white/15 p-0.5 flex justify-center">
                <motion.div
                  animate={{ y: [0, 9, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className="w-1.5 h-1.5 rounded-full bg-mewmao-orange"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
