"use client";

import React from "react";
import { useStore } from "@/context/StoreContext";
import { ShieldAlert, Wine } from "lucide-react";

export default function AgeGateModal() {
  const { isAgeVerified, verifyAge, t } = useStore();

  if (isAgeVerified) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-md p-8 sm:p-10 bg-zinc-950 border border-white/08 rounded-3xl shadow-2xl text-center">

        {/* Mewmao Mascot Cat Holding Bottle */}
        <div className="w-28 mx-auto mb-3 aspect-[472/685] flex items-center justify-center">
          <img
            src="/images/mewmao-cat.png?v=hd4"
            alt="Mewmao Mascot"
            className="w-full h-full object-contain select-none drop-shadow-[0_10px_25px_rgba(255,100,0,0.18)]"
          />
        </div>

        <div className="space-y-2 mb-6">
          <span className="text-[10px] font-mono uppercase tracking-[0.35em] text-mewmao-orange font-bold block">
            {t("age_tag")}
          </span>
          <h2 className="font-serif text-4xl font-black text-white leading-none">
            {t("age_title")}
          </h2>
          <p className="text-xs text-white/40 font-light leading-relaxed pt-2">
            {t("age_desc")}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={verifyAge}
            className="w-full py-3.5 px-6 rounded-2xl bg-mewmao-orange hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
          >
            <span>{t("age_confirm")}</span>
            <span>→</span>
          </button>

          <a
            href="https://google.com"
            className="block w-full py-2.5 px-4 text-[11px] text-white/25 hover:text-white/50 transition-colors font-mono"
          >
            {t("age_exit")}
          </a>
        </div>

        <div className="mt-8 pt-4 border-t border-white/06 flex items-center justify-center gap-2 text-[10px] text-white/25 font-mono">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>{t("age_warning")}</span>
        </div>
      </div>
    </div>
  );
}
