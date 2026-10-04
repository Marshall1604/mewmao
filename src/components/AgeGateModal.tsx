"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/context/StoreContext";

const easeLuxury = [0.16, 1, 0.3, 1] as const;

export default function AgeGateModal() {
  const pathname = usePathname();
  const { isAgeVerified, verifyAge, language } = useStore();
  const isEn = language === "en";
  const [showPreview, setShowPreview] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);

  // CHỈ hiển thị popup 18+ khi đang ở trang chủ Home ("/")
  // Tất cả các trang khác (/seller, /admin, /about, /blog, /partners, /dashboard...) KHÔNG cần xác minh
  const isHomePage = pathname === "/" || pathname === "";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("age_gate") === "true") {
        setShowPreview(true);
      }
    }
  }, []);

  const isOpen = (isHomePage || showPreview) && (!isAgeVerified || showPreview) && !isDismissing;

  // Lock scroll while age gate is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleVerify = () => {
    setIsDismissing(true);
    // Allow the smooth Framer Motion exit animation to play completely
    setTimeout(() => {
      setShowPreview(false);
      verifyAge();
      setIsDismissing(false);
    }, 850);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="age-gate-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            backdropFilter: "blur(0px)",
            transition: { duration: 0.8, ease: easeLuxury },
          }}
          transition={{ duration: 0.5, ease: easeLuxury }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-white/95 backdrop-blur-xl overflow-y-auto selection:bg-orange-500 selection:text-white"
        >
          <motion.div
            key="age-gate-card"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{
              opacity: 0,
              scale: 0.96,
              y: -24,
              transition: { duration: 0.65, ease: easeLuxury },
            }}
            transition={{ duration: 0.6, ease: easeLuxury }}
            className="w-full max-w-sm mx-auto flex flex-col items-center text-center space-y-4 sm:space-y-6 my-auto py-6"
          >
            {/* 1. Header: Mewmao xuống hàng Distillery. To và thật bự */}
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6, ease: easeLuxury }}
              className="font-serif text-4xl sm:text-5xl font-black tracking-tight text-zinc-950 leading-[0.95]"
            >
              Mewmao <br />
              <span className="italic font-normal text-amber-gradient font-serif">
                Distillery.
              </span>
            </motion.h1>

            {/* 2. Ảnh chú mèo bỉm hồng không nền, to rõ, liền mạch nền trắng */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.7, ease: easeLuxury }}
              className="relative w-64 sm:w-72 md:w-80 aspect-[622/1081] flex items-center justify-center select-none my-1 animate-float-cat"
            >
              <img
                src="/images/mewmao-baby-cat.png?v=3"
                alt="Mewmao Mascot Cat"
                className="w-full h-full object-contain filter drop-shadow-[0_14px_28px_rgba(0,0,0,0.06)]"
                loading="eager"
              />
            </motion.div>

            {/* 3. Text nhỏ dưới ảnh: Age Verification • 18+ */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.25em] text-zinc-500 font-semibold"
            >
              {isEn ? "Age Verification • 18+" : "Xác nhận độ tuổi • 18+"}
            </motion.p>

            {/* 4. Button xác nhận: Màu cam text đen */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5, ease: easeLuxury }}
              className="pt-1 w-full max-w-xs"
            >
              <button
                type="button"
                onClick={handleVerify}
                className="w-full py-4 px-6 rounded-2xl bg-[#FF5E00] hover:bg-[#ff701a] active:scale-[0.97] text-zinc-950 font-black text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition-all duration-200 cursor-pointer"
              >
                {isEn ? "Over 18 Years Old" : "Đã trên 18 tuổi"}
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


