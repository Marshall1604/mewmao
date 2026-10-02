"use client";

import React from "react";
import { useStore } from "@/context/StoreContext";

export default function AgeGateModal() {
  const { isAgeVerified, verifyAge, language } = useStore();
  const isEn = language === "en";

  if (isAgeVerified) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-white/95 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-sm mx-auto flex flex-col items-center text-center space-y-4 sm:space-y-5 my-auto py-6">
        
        {/* 1. Header: Mewmao Distillery (Cùng màu & font như trang Home) */}
        <h1 className="font-serif text-3xl sm:text-4xl font-black tracking-tight text-zinc-950 leading-none">
          Mewmao <span className="italic font-normal text-amber-gradient font-serif">Distillery.</span>
        </h1>

        {/* 2. Ảnh chú mèo bỉm hồng kẹo mút (Liền mạch nền trắng, không đóng khung, độ mờ vừa phải) */}
        <div className="relative w-48 sm:w-56 aspect-[571/1024] flex items-center justify-center select-none my-1">
          <img
            src="/images/mewmao-baby-cat.jpg?v=1"
            alt="Mewmao Under 18 Mascot Cat"
            className="w-full h-full object-contain mix-blend-multiply [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_98%)] drop-shadow-[0_10px_20px_rgba(0,0,0,0.05)]"
            loading="eager"
          />
        </div>

        {/* 3. Text nhỏ dưới ảnh */}
        <p className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.25em] text-zinc-500 font-semibold">
          Age Verification • 18+
        </p>

        {/* 4. Button xác nhận */}
        <div className="pt-1 w-full max-w-xs">
          <button
            type="button"
            onClick={verifyAge}
            className="btn-mewmao-black w-full justify-center py-3.5 text-xs font-bold font-sans shadow-md hover:shadow-lg transition-all"
          >
            {isEn ? "Over 18 Years Old" : "Đã trên 18 tuổi"}
          </button>
        </div>

      </div>
    </div>
  );
}
