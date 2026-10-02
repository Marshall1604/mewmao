"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useStore } from "@/context/StoreContext";
import {
  ShoppingBag,
  ArrowRight,
  ArrowDown,
  Sparkles,
  Droplets,
  ShieldCheck,
  CheckCircle2,
  Minus,
  Plus,
  Flame,
  Wine,
  Truck,
} from "lucide-react";

// Luxury Motion Presets (Apple-style Cubic Bezier easeOutExpo)
const easeLuxury = [0.16, 1, 0.3, 1] as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (custom: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.85,
      delay: custom * 0.12,
      ease: easeLuxury,
    },
  }),
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.96, y: 20 },
  visible: (custom: number = 0) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.9,
      delay: custom * 0.12,
      ease: easeLuxury,
    },
  }),
};

export default function HomePage() {
  const { product, cartQuantity, setCartQuantity, setIsQuickBuyOpen, t, language } = useStore();
  const isEn = language === "en";

  const handleScrollToBuy = () => {
    const el = document.getElementById("buy-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative bg-white text-zinc-950 overflow-hidden font-sans">

      {/* ========================================================================= */}
      {/* 1. HERO SECTION: ICONIC MEWMAO CAT (FIRST VIEW ON LOAD)                    */}
      {/* ========================================================================= */}
      <section className="relative min-h-[85vh] sm:min-h-screen flex flex-col justify-between pt-2 sm:pt-6 pb-8 px-5 sm:px-8 lg:px-12 bg-white">
        {/* Centerpiece Hero: Cat Mascot & Massive Typography */}
        <div className="max-w-6xl mx-auto w-full my-auto py-4 sm:py-8 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-14">
          
          {/* Left Text / Editorial Intro */}
          <div className="w-full lg:w-1/2 space-y-5 text-center lg:text-left order-2 lg:order-1">
            <motion.h1
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              custom={0}
              className="font-serif text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-zinc-950 leading-[0.95]"
            >
              Mewmao <br />
              <span className="italic font-normal text-amber-gradient font-serif">Distillery.</span>
            </motion.h1>

            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              custom={1}
              className="text-sm sm:text-base text-zinc-600 font-light leading-relaxed max-w-lg mx-auto lg:mx-0"
            >
              {isEn
                ? "Naturally fermented Moc Chau blush plums aged for 365 days in unvarnished Bat Trang earthenware urns. An unconventional spirit for the nocturnal and the free."
                : "Quả mơ má đào Mộc Châu chín sương lên men tự nhiên và ủ chum sành tĩnh lặng suốt 365 ngày. Dòng rượu mang đậm cá tính underground, phóng khoáng và êm mượt."}
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              custom={2}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <button
                onClick={handleScrollToBuy}
                className="btn-mewmao-black"
              >
                <span>{isEn ? "View Bottle & Order" : "Xem Chai & Mua Rượu"}</span>
                <ArrowDown className="w-4 h-4 animate-bounce" />
              </button>

              <button
                onClick={() => setIsQuickBuyOpen(true)}
                className="btn-mewmao-white"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isEn ? "Quick Buy — 289,000₫" : "Mua Nhanh — 289.000₫"}</span>
              </button>
            </motion.div>
          </div>

          {/* Right: The Iconic Cat Holding Mewmao Bottle (Static — No Floating) */}
          <div className="w-full lg:w-1/2 flex items-center justify-center order-1 lg:order-2 my-2 sm:my-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: easeLuxury }}
              className="relative w-[300px] sm:w-[380px] lg:w-[480px] aspect-[472/685] flex items-center justify-center"
            >
              <img
                src="/images/mewmao-cat.png?v=hd4"
                alt="Mewmao Cat Mascot holding Artisanal Plum Spirit"
                loading="eager"
                decoding="async"
                className="w-full h-full object-contain select-none drop-shadow-[0_16px_32px_rgba(0,0,0,0.06)]"
                style={{ imageRendering: "-webkit-optimize-contrast" }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* MARQUEE TICKER TAPE (BLACK & WHITE CONTRAST)                              */}
      {/* ========================================================================= */}
      <div className="ticker-wrap py-3.5 bg-zinc-950 text-white overflow-hidden">
        <div className="ticker-track">
          {(isEn
            ? [
                "MEWMAO DISTILLERY",
                "★★★★★ 4.9 RATING",
                "MOC CHAU BLUSH PLUMS",
                "OFFICIAL PRICE 289,000₫",
                "19% ABV • 500ML",
                "365 DAYS AGED IN CLAY URNS",
                "FREE SHIPPING OVER 2 BOTTLES",
                "100% TRANSIT GUARANTEE",
                "MEWMAO DISTILLERY",
                "★★★★★ 4.9 RATING",
                "MOC CHAU BLUSH PLUMS",
                "OFFICIAL PRICE 289,000₫",
                "19% ABV • 500ML",
                "365 DAYS AGED IN CLAY URNS",
              ]
            : [
                "MEWMAO DISTILLERY",
                "★★★★★ 4.9 RATING",
                "MƠ MÁ ĐÀO MỘC CHÂU",
                "GIÁ CHÍNH HÃNG 289.000₫",
                "19% ABV • 500ML",
                "Ủ CHUM SÀNH 365 NGÀY",
                "FREESHIP TỪ 2 CHAI",
                "BẢO HIỂM NỨT VỠ 100%",
                "MEWMAO DISTILLERY",
                "★★★★★ 4.9 RATING",
                "MƠ MÁ ĐÀO MỘC CHÂU",
                "GIÁ CHÍNH HÃNG 289.000₫",
                "19% ABV • 500ML",
                "Ủ CHUM SÀNH 365 NGÀY",
              ]
          ).map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-8 px-8 text-xs font-mono uppercase tracking-[0.25em] text-white/70"
            >
              <span>{item}</span>
              <span className="text-mewmao-orange font-bold">•</span>
            </span>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. BOTTLE SHOWCASE & PURCHASE SECTION (SCROLL DOWN CONTENT)                */}
      {/* ========================================================================= */}
      <section id="buy-section" className="py-20 sm:py-32 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 bg-white">
        
        {/* Section Heading with Scroll Motion */}
        <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20 space-y-3">
          <motion.span
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={fadeInUp}
            custom={0}
            className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.35em] text-mewmao-orange font-bold block"
          >
            {isEn ? "THE SIGNATURE BOTTLE" : "CHI TIẾT CHAI RƯỢU & ĐẶT MUA"}
          </motion.span>
          
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={fadeInUp}
            custom={1}
            className="font-serif text-4xl sm:text-6xl font-black tracking-tight text-zinc-950 leading-none"
          >
            {isEn ? "Artisanal Plum Spirit" : "Rượu Mơ Má Đào Mewmao"}
          </motion.h2>

          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={fadeInUp}
            custom={2}
            className="text-xs sm:text-sm text-zinc-500 font-light leading-relaxed"
          >
            {isEn
              ? "Each flask is filled from single batches aged patiently in Bat Trang clay urns. Sealed with care, delivered directly to your doorstep."
              : "Từng chai rượu được chiết rót từ mẻ ủ chum sành tĩnh tại xưởng, bảo toàn trọn vẹn hương thơm mật mơ má đào và hậu vị êm mượt tự nhiên."}
          </motion.p>
        </div>

        {/* Grid: Bottle Image (Left) + Purchasing Panel (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* LEFT: Authentic Real Bottle Photography (Seamless Transparent on White) */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeInScale}
            className="lg:col-span-6 flex items-center justify-center p-4 sm:p-8 relative group"
          >
            <div className="relative w-64 sm:w-80 lg:w-[380px] h-[440px] sm:h-[540px] flex items-center justify-center">
              <img
                src="/images/mewmao-bottle-standing.png?v=hd1"
                alt="Chai Rượu Mơ Má Đào Mewmao 500ml"
                loading="eager"
                decoding="async"
                className="w-full h-full object-contain select-none drop-shadow-[0_20px_40px_rgba(0,0,0,0.10)] group-hover:scale-105 transition-transform duration-500"
                style={{ imageRendering: "-webkit-optimize-contrast" }}
              />

              {/* Spec Tag floating next to bottle */}
              <div className="absolute bottom-2 right-2 sm:right-6 px-3.5 py-1.5 rounded-full bg-zinc-950 text-white text-[10px] font-mono font-bold tracking-wider shadow-sm">
                19% ABV • 500ML
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Complete Purchase Interface with Smooth Motion */}
          <div className="lg:col-span-6 space-y-8">
            
            {/* Title & Ratings */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeInUp}
              custom={0}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center text-mewmao-orange text-sm">
                  ★★★★★
                </div>
                <span className="text-xs font-mono font-bold text-zinc-900">4.9 / 5.0</span>
                <span className="text-xs text-zinc-400 font-mono">
                  {isEn ? "(185 verified reviews)" : "(185 đánh giá đã xác thực)"}
                </span>
              </div>

              <h3 className="font-serif text-3xl sm:text-4xl font-black text-zinc-950">
                {product.name}
              </h3>
              <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                {product.volume} • {product.abv} • Mộc Châu Highlands
              </p>
            </motion.div>

            {/* PRICE DISPLAY: 289.000₫ */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeInUp}
              custom={1}
              className="p-6 rounded-3xl bg-zinc-50 border border-black/[0.06] space-y-2"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-3xl sm:text-4xl font-black text-zinc-950">
                  {product.price.toLocaleString(isEn ? "en-US" : "vi-VN")}₫
                </span>
                <span className="font-mono text-base text-zinc-400 line-through">
                  {product.originalPrice.toLocaleString(isEn ? "en-US" : "vi-VN")}₫
                </span>
                <span className="px-2.5 py-1 rounded-full bg-mewmao-orange text-white text-[11px] font-mono font-bold uppercase tracking-wider">
                  {isEn ? "−17% Savings" : "−17% Tiết Kiệm"}
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-light">
                {isEn
                  ? "Direct distillery release price. Free insured shipping for orders of 2 or more bottles."
                  : "Giá phát hành trực tiếp từ xưởng chưng cất. Miễn phí vận chuyển toàn quốc khi đặt từ 2 chai."}
              </p>
            </motion.div>

            {/* Quantity Selector + Instant Order */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeInUp}
              custom={2}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-600 font-bold">
                  {isEn ? "Select Quantity:" : "Số Lượng Chai:"}
                </span>

                {/* Pill Counter Stepper */}
                <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-black/15 bg-white shadow-xs">
                  <button
                    onClick={() => setCartQuantity(Math.max(1, cartQuantity - 1))}
                    className="w-6 h-6 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-700 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono font-black text-base text-zinc-950 w-6 text-center">
                    {String(cartQuantity).padStart(2, "0")}
                  </span>
                  <button
                    onClick={() => setCartQuantity(cartQuantity + 1)}
                    className="w-6 h-6 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="flex items-center justify-between text-xs font-mono py-2 border-y border-black/[0.06]">
                <span className="text-zinc-500">{isEn ? "Order Subtotal:" : "Tổng Tiền Tạm Tính:"}</span>
                <span className="font-bold text-lg text-mewmao-orange font-mono">
                  {(product.price * cartQuantity).toLocaleString(isEn ? "en-US" : "vi-VN")}₫
                </span>
              </div>

              {/* Primary Call to Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => setIsQuickBuyOpen(true)}
                  className="btn-mewmao-black justify-center py-4 w-full text-xs tracking-wider font-bold"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    {isEn
                      ? `Quick Buy — ${(product.price * cartQuantity).toLocaleString("en-US")}₫`
                      : `Mua Nhanh — ${(product.price * cartQuantity).toLocaleString("vi-VN")}₫`}
                  </span>
                </button>
              </div>
            </motion.div>

            {/* Guarantees List */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeInUp}
              custom={3}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono text-zinc-600"
            >
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#FAF9F6] border border-black/[0.04]">
                <Truck className="w-4 h-4 text-mewmao-orange flex-shrink-0" />
                <span className="text-[11px] leading-tight">
                  {isEn ? "Fast 1–3 days nationwide delivery" : "Giao nhanh 1–3 ngày toàn quốc"}
                </span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#FAF9F6] border border-black/[0.04]">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="text-[11px] leading-tight">
                  {isEn ? "100% transit breakage guarantee" : "Bảo hiểm bể vỡ 100% khi nhận"}
                </span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#FAF9F6] border border-black/[0.04]">
                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="text-[11px] leading-tight">
                  {isEn ? "Direct order • Prompt confirmation" : "Đặt mua trực tiếp • Chốt đơn nhanh"}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. TASTING SPECTRUM & SENSORY SPECIFICATIONS                              */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-28 border-t border-black/[0.06] bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left 3 Aromatic Tiers */}
            <div className="lg:col-span-7 space-y-10">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={fadeInUp}
                className="space-y-3"
              >
                <span className="text-[10px] font-mono uppercase tracking-[0.35em] text-mewmao-orange font-bold block">
                  {t("tasting_tag")}
                </span>
                <h3 className="font-serif text-3xl sm:text-5xl font-black tracking-tight text-zinc-950">
                  {t("tasting_title")}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 font-light max-w-lg leading-relaxed">
                  {t("tasting_subtitle")}
                </p>
              </motion.div>

              <div className="space-y-6 divide-y divide-black/[0.06]">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={fadeInUp}
                  custom={0}
                  className="pt-6 first:pt-0 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-serif text-xl font-bold text-zinc-950 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-mewmao-orange" />
                      {t("taste_nose_title")}
                    </span>
                    <span className="text-zinc-400 text-[10px] tracking-wider uppercase">
                      {t("taste_nose_tag")}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-600 font-light leading-relaxed">
                    {product.tastingNotes.nose}
                  </p>
                </motion.div>

                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={fadeInUp}
                  custom={1}
                  className="pt-6 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-serif text-xl font-bold text-zinc-950 flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-mewmao-orange" />
                      {t("taste_palate_title")}
                    </span>
                    <span className="text-zinc-400 text-[10px] tracking-wider uppercase">
                      {t("taste_palate_tag")}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-600 font-light leading-relaxed">
                    {product.tastingNotes.palate}
                  </p>
                </motion.div>

                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={fadeInUp}
                  custom={2}
                  className="pt-6 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-serif text-xl font-bold text-zinc-950 flex items-center gap-2">
                      <Flame className="w-4 h-4 text-mewmao-orange" />
                      {t("taste_finish_title")}
                    </span>
                    <span className="text-zinc-400 text-[10px] tracking-wider uppercase">
                      {t("taste_finish_tag")}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-600 font-light leading-relaxed">
                    {product.tastingNotes.finish}
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Right: Flavor Sliders Card */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeInScale}
              className="lg:col-span-5 p-8 sm:p-10 rounded-3xl bg-white border border-black/[0.08] shadow-apple space-y-8"
            >
              <div className="space-y-1">
                <span className="text-[9px] font-mono tracking-[0.3em] text-mewmao-orange uppercase font-bold block">
                  SPECTRUM SENSORY
                </span>
                <h4 className="font-serif text-2xl font-black text-zinc-950">
                  {t("matrix_title")}
                </h4>
              </div>

              <div className="space-y-5">
                {[
                  { label: t("matrix_acidity"), val: 88 },
                  { label: t("matrix_sweetness"), val: 75 },
                  { label: t("matrix_smoothness"), val: 96 },
                  { label: t("matrix_warmth"), val: 82 },
                ].map((row, idx) => (
                  <div key={row.label} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-600">{row.label}</span>
                      <span className="font-bold text-zinc-950">{row.val}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${row.val}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.1, delay: idx * 0.15, ease: easeLuxury }}
                        className="h-full bg-zinc-950 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Service Recommendations */}
              <div className="pt-6 border-t border-black/[0.06] space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400 font-mono">
                    {isEn ? "Serving Temperature:" : "Nhiệt độ thưởng thức:"}
                  </span>
                  <strong className="text-zinc-900 font-mono">
                    {isEn ? "8 – 12 °C (Chilled)" : "8 – 12 °C (Ướp lạnh)"}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400 font-mono">
                    {isEn ? "Recommended Glass:" : "Ly đề xuất:"}
                  </span>
                  <strong className="text-zinc-900 font-mono">
                    {isEn ? "Rock tumbler with clear ice" : "Rock Tumbler với đá khối"}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400 font-mono">
                    {isEn ? "Culinary Pairing:" : "Món ăn kèm:"}
                  </span>
                  <strong className="text-zinc-900">
                    {isEn ? "BBQ, artisanal cheese, charcuterie" : "Thịt nướng, phô mai, đồ nguội"}
                  </strong>
                </div>
              </div>

              <button
                onClick={() => setIsQuickBuyOpen(true)}
                className="btn-mewmao-black w-full justify-center text-xs py-3 font-bold"
              >
                <span>
                  {isEn
                    ? `Order 500ml Bottle — ${product.price.toLocaleString("en-US")}₫`
                    : `Đặt Mua Chai 500ml — ${product.price.toLocaleString("vi-VN")}₫`}
                </span>
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. UNDERGROUND CULTURE & STORY SNIPPET                                     */}
      {/* ========================================================================= */}
      <section className="py-24 sm:py-32 bg-zinc-950 text-white relative overflow-hidden">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeInUp}
          className="max-w-4xl mx-auto px-5 sm:px-8 text-center space-y-8 relative z-10"
        >
          <span className="text-[10px] font-mono uppercase tracking-[0.35em] text-mewmao-orange font-bold block">
            {t("culture_tag")}
          </span>
          <h3 className="font-serif text-4xl sm:text-6xl font-black text-white leading-tight">
            {t("culture_title")}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">
            {t("culture_desc")}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setIsQuickBuyOpen(true)}
              className="px-8 py-3.5 rounded-full bg-white hover:bg-mewmao-orange text-zinc-950 hover:text-white text-xs uppercase tracking-wider font-bold transition-all shadow-md"
            >
              {isEn ? "Acquire Bottle — 289,000₫" : "Đặt Mua Ngay — 289.000₫"}
            </button>
            <Link
              href="/about"
              className="px-8 py-3.5 rounded-full border border-white/20 hover:border-white text-zinc-300 hover:text-white text-xs uppercase tracking-wider font-bold transition-colors"
            >
              {isEn ? "The Mewmao Story" : "Câu Chuyện Mewmao"}
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ========================================================================= */}
      {/* 5. CLOSING PURCHASE CTA                                                   */}
      {/* ========================================================================= */}
      <section className="py-24 sm:py-32 bg-white text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeInUp}
          className="max-w-3xl mx-auto px-5 sm:px-8 space-y-8"
        >
          <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-950">
            <Wine className="w-6 h-6 text-mewmao-orange" />
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.35em] text-mewmao-orange font-bold block">
              {t("closing_tag")}
            </span>
            <h3 className="font-serif text-4xl sm:text-6xl font-black text-zinc-950 leading-none">
              {t("closing_title")}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-lg mx-auto font-light leading-relaxed pt-1">
              {t("closing_desc")}
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setIsQuickBuyOpen(true)}
              className="btn-mewmao-black text-sm px-10 py-4 mx-auto"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t("closing_cta")}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] text-zinc-400 font-mono pt-4">
            <span>{isEn ? "✓ Free shipping on 2+ bottles" : "✓ Miễn phí giao hàng từ 2 chai"}</span>
            <span>{isEn ? "✓ 100% transit breakage guarantee" : "✓ Đổi mới 100% nếu nứt vỡ trong vận chuyển"}</span>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
