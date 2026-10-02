"use client";

import React, { useEffect, useState } from "react";
import { useStore } from "@/context/StoreContext";

export default function AgeGateModal() {
  const { isAgeVerified, verifyAge, language } = useStore();
  const isEn = language === "en";
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("age_gate") === "true") {
        setShowPreview(true);
      }
    }
  }, []);

  if (isAgeVerified && !showPreview) return null;

  const handleVerify = () => {
    setShowPreview(false);
    verifyAge();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-white/95 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-sm mx-auto flex flex-col items-center text-center space-y-4 sm:space-y-6 my-auto py-6">
        
        {/* 1. Header: Mewmao xuống hàng Distillery. To và thật bự */}
        <h1 className="font-serif text-4xl sm:text-5xl font-black tracking-tight text-zinc-950 leading-[0.95]">
          Mewmao <br />
          <span className="italic font-normal text-amber-gradient font-serif">Distillery.</span>
        </h1>

        {/* 2. Ảnh chú mèo bỉm hồng không nền, to rõ, liền mạch nền trắng */}
        <div className="relative w-64 sm:w-72 md:w-80 aspect-[622/1081] flex items-center justify-center select-none my-1">
          <img
            src="/images/mewmao-baby-cat.png?v=3"
            alt="Mewmao Mascot Cat"
            className="w-full h-full object-contain filter drop-shadow-[0_14px_28px_rgba(0,0,0,0.06)]"
            loading="eager"
          />
        </div>

        {/* 3. Text nhỏ dưới ảnh: Age Verification • 18+ */}
        <p className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.25em] text-zinc-500 font-semibold">
          Age Verification • 18+
        </p>

        {/* 4. Button xác nhận: Màu cam text đen */}
        <div className="pt-1 w-full max-w-xs">
          <button
            type="button"
            onClick={handleVerify}
            className="w-full py-4 px-6 rounded-2xl bg-[#FF5E00] hover:bg-[#ff701a] active:scale-[0.98] text-zinc-950 font-black text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition-all cursor-pointer"
          >
            {isEn ? "Over 18 Years Old" : "Đã trên 18 tuổi"}
          </button>
        </div>

      </div>
    </div>
  );
}

