"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { Instagram, Facebook, ArrowUpRight, ShieldCheck } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  const { t } = useStore();

  if (pathname === "/admin" || pathname === "/dashboard" || pathname === "/seller") {
    return null;
  }

  return (
    <footer className="w-full bg-zinc-950 text-white border-t border-white/06">

      {/* Top CTA banner with huge typography */}
      <div className="border-b border-white/06 py-14 sm:py-20 px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto relative overflow-hidden">
        {/* Background grunge mark */}
        <div className="absolute inset-0 flex items-center justify-end pointer-events-none overflow-hidden">
          <span className="font-serif text-[200px] sm:text-[300px] font-black text-white/[0.02] leading-none select-none pr-4">
            M
          </span>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div className="space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.35em] text-mewmao-orange font-bold block">
              {t("footer_tag")}
            </span>
            <h3 className="font-serif text-3xl sm:text-5xl font-black text-white leading-none">
              {t("footer_tagline")}
            </h3>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://www.facebook.com/Mewmaodistillery"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/10 hover:bg-white hover:text-zinc-950 text-xs font-semibold text-white/60 hover:text-white transition-all group"
            >
              <Facebook className="w-4 h-4" />
              <span>Facebook</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-50 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
            <a
              href="https://www.instagram.com/mewmaodistillery"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/10 hover:bg-white hover:text-zinc-950 text-xs font-semibold text-white/60 hover:text-white transition-all group"
            >
              <Instagram className="w-4 h-4" />
              <span>Instagram</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-50 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      {/* Main footer nav grid */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-14 grid grid-cols-1 md:grid-cols-3 gap-10 text-xs">
        {/* Brand column */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-2.5">
            <img
              src="/images/mewmao-logo-orange.png"
              alt="Mewmao Logo"
              className="h-8 w-auto object-contain"
            />
            <span className="text-[9px] tracking-[0.35em] uppercase text-white/50 font-sans font-semibold border-l border-white/20 pl-2">
              Distillery
            </span>
          </div>
          <p className="text-white/35 font-light leading-relaxed">{t("footer_desc")}</p>
          <div className="pt-1 font-mono text-white/20 text-[11px]">{t("footer_spec")}</div>
        </div>

        {/* Explore */}
        <div className="space-y-3">
          <h4 className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/25">{t("footer_explore")}</h4>
          <ul className="space-y-2 text-white/40 font-light">
            {[
              { label: `${t("nav_home")} — Mewmao 500ml`, href: "/" },
              { label: t("nav_about"), href: "/about" },
              { label: t("nav_blog"), href: "/blog" },
              { label: "SELLER", href: "/seller" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div className="space-y-3">
          <h4 className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/25 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-mewmao-orange" />
            {t("footer_legal")}
          </h4>
          <p className="text-[11px] text-white/25 font-light leading-relaxed">{t("footer_legal_desc")}</p>
          <div className="pt-2 text-[10px] font-mono text-white/20">Mewmao Distillery • Vietnam</div>
        </div>
      </div>

      {/* Bottom copyright — ink horizontal rule */}
      <div className="border-t border-white/06 py-6 text-center text-[11px] font-mono text-white/20">
        <p>© {new Date().getFullYear()} Mewmao Distillery. {t("footer_rights")}</p>
      </div>
    </footer>
  );
}
