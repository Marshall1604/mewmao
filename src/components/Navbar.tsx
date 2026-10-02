"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/context/StoreContext";
import {
  ShoppingBag,
  Menu,
  X,
  UserCheck,
  ChevronDown,
  Sparkles,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const {
    userRole,
    switchUserRole,
    sellers,
    currentSeller,
    setIsQuickBuyOpen,
    activeRefCode,
    language,
    setLanguage,
    t,
  } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  // Tạm ẩn: Tạp Chí (/blog), Điểm Bán (/partners), Quản Trị (/dashboard)
  const navLinks = [
    { label: t("nav_home"), href: "/" },
    { label: t("nav_about"), href: "/about" },
    { label: "SELLER", href: "/seller" },
  ];

  if (pathname === "/admin" || pathname === "/dashboard") {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full apple-glass transition-colors">
      {/* Affiliate banner */}
      {activeRefCode && (
        <div className="bg-zinc-950 text-white py-1 px-4 text-center text-xs font-medium flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-mewmao-orange animate-pulse" />
          <span>
            {t("nav_ref_banner")}{" "}
            <strong className="tracking-wider font-mono text-mewmao-orange">{activeRefCode}</strong>
          </span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-xl bg-zinc-950 flex items-center justify-center text-white font-serif font-black text-base shadow-sm group-hover:bg-mewmao-orange transition-colors">
              M
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-serif text-lg sm:text-xl font-black tracking-tight text-zinc-950 group-hover:text-mewmao-orange transition-colors">
                MEWMAO
              </span>
              <span className="text-[9px] tracking-[0.35em] uppercase text-zinc-400 font-sans font-medium">
                Distillery
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[11px] uppercase tracking-[0.2em] font-semibold transition-colors relative py-1 ${
                    isActive
                      ? "text-zinc-950 font-bold"
                      : "text-zinc-500 hover:text-zinc-950"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 inset-x-0 h-[2px] bg-zinc-950 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language toggle */}
            <div className="flex items-center rounded-full border border-black/10 p-0.5 bg-zinc-100/80 text-[11px] font-mono">
              <button
                onClick={() => setLanguage("en")}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  language === "en"
                    ? "bg-zinc-950 text-white font-bold shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("vi")}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  language === "vi"
                    ? "bg-zinc-950 text-white font-bold shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                VI
              </button>
            </div>

            {/* Role switcher (Tạm ẩn tính năng quản trị theo yêu cầu) */}

            {/* Quick Buy CTA */}
            <button
              onClick={() => setIsQuickBuyOpen(true)}
              className="btn-mewmao-black text-[11px] px-4 sm:px-5 py-2 sm:py-2.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t("nav_order")}</span>
              <span className="sm:hidden">Buy</span>
              <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-mono hidden sm:inline-block">
                289k
              </span>
            </button>

            {/* Mobile hamburger with smooth micro-rotation */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 transition-colors flex items-center justify-center w-10 h-10"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile menu with decelerating unfold animation (Chậm dần đều) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden border-t border-black/5 bg-white/95 backdrop-blur-2xl px-6 pt-3 pb-7 space-y-1 overflow-hidden shadow-2xl"
          >
            {navLinks.map((link, idx) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: 0.05 + idx * 0.04,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <Link
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block text-xs uppercase tracking-[0.22em] font-semibold py-3.5 border-b border-black/5 transition-colors ${
                    pathname === link.href
                      ? "text-mewmao-orange font-bold pl-1"
                      : "text-zinc-700 hover:text-zinc-950 hover:pl-1"
                  }`}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.38,
                delay: 0.05 + navLinks.length * 0.04,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="pt-4"
            >
              <button
                onClick={() => {
                  setIsQuickBuyOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="btn-mewmao-black w-full justify-center py-3.5 shadow-lg active:scale-98 transition-transform"
              >
                <ShoppingBag className="w-4 h-4" />
                {t("nav_order")} — {language === "vi" ? "289.000₫" : "289,000₫"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
