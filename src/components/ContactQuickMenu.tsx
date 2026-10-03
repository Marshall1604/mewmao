"use client";

import React, { useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Facebook,
  Instagram,
  MessageSquare,
  X,
  ArrowUpRight,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";

// Apple-style decelerating cubic-bezier easing (chậm dần đều)
const easeDecelerate = [0.16, 1, 0.3, 1] as const;

export default function ContactQuickMenu() {
  const pathname = usePathname();
  const { language } = useStore();
  const isEn = language === "en";

  const [isOpen, setIsOpen] = useState(false);
  const isDraggingRef = useRef(false);

  if (pathname === "/admin" || pathname === "/dashboard" || pathname === "/seller") {
    return null;
  }

  const contactChannels = [
    {
      id: "facebook",
      name: "Facebook Fanpage",
      handle: "@Mewmaodistillery",
      badge: isEn ? "Replies in 5m" : "Phản hồi trong 5 phút",
      iconBg: "bg-[#1877F2]/10 text-[#1877F2] group-hover:bg-[#1877F2] group-hover:text-white",
      href: "https://www.facebook.com/Mewmaodistillery",
      icon: Facebook,
    },
    {
      id: "instagram",
      name: "Instagram Direct",
      handle: "@mewmaodistillery",
      badge: isEn ? "Stories & Lookbook" : "Stories & Lookbook",
      iconBg: "bg-[#E4405F]/10 text-[#E4405F] group-hover:bg-[#E4405F] group-hover:text-white",
      href: "https://www.instagram.com/mewmaodistillery",
      icon: Instagram,
    },
    {
      id: "sms",
      name: isEn ? "SMS Message" : "Tin Nhắn SMS",
      handle: "0988.776.655",
      badge: isEn ? "24/7 Support" : "Hỗ trợ 24/7",
      iconBg: "bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
      href: isEn
        ? "sms:0988776655?&body=Hi%20Mewmao,%20I%20would%20like%20to%20order%20Mewmao%20Plum%20Liqueur!"
        : "sms:0988776655?&body=Ch%C3%A0o%20Mewmao,%20t%C3%B4i%20mu%E1%BB%91n%20t%C6%B0%20v%E1%BA%A5n%20%C4%91%E1%BA%B7t%20r%C6%B0%E1%BB%A3u%20m%C6%A1%20m%C3%A1%20%C4%91%C3%A0o!",
      icon: MessageSquare,
    },
  ];

  return (
    <>
      {/* 1. Draggable Floating Contact Widget */}
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.08}
        onDragStart={() => {
          isDraggingRef.current = true;
        }}
        onDragEnd={() => {
          setTimeout(() => {
            isDraggingRef.current = false;
          }, 120);
        }}
        className="fixed right-4 sm:right-7 top-[52%] z-40 touch-none select-none"
        style={{ cursor: "grab" }}
        whileTap={{ cursor: "grabbing" }}
      >
        <motion.button
          type="button"
          onClick={() => {
            if (!isDraggingRef.current) {
              setIsOpen(true);
            }
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/80 backdrop-blur-xl border border-white/60 text-zinc-950 flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all group shrink-0"
          title={isEn ? "Contact Mewmao (Facebook, Instagram, SMS) — Drag to move" : "Liên hệ Mewmao (Facebook, Instagram, SMS) — Kéo để di chuyển vị trí"}
          aria-label={isEn ? "Contact Mewmao" : "Liên hệ Mewmao"}
        >
          {/* Amber pulsing indicator */}
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-mewmao-orange border-2 border-white animate-pulse" />

          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-950 group-hover:text-mewmao-orange transition-colors" />
        </motion.button>
      </motion.div>

      {/* 2. Decelerating Modal / Popup Menu (Glassmorphism tinh tế, phẳng, không đóng khung) */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with smooth fade */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: easeDecelerate }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />

            {/* Modal Card with subtle, refined glassmorphism */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{
                duration: 0.5,
                ease: easeDecelerate,
              }}
              className="relative w-full max-w-sm bg-white/80 backdrop-blur-2xl rounded-[32px] p-6 sm:p-7 shadow-[0_24px_70px_-15px_rgba(0,0,0,0.22)] border border-white/70 z-10 space-y-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-1">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 font-semibold block">
                    {isEn ? "Get In Touch" : "Kết Nối Nhanh"}
                  </span>
                  <h3 className="font-serif text-2xl font-black text-zinc-950 leading-tight">
                    {isEn ? "Contact Mewmao" : "Liên Hệ Mewmao"}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-950 hover:bg-black/[0.05] transition-colors"
                  aria-label={isEn ? "Close" : "Đóng"}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 3 Channels: Giao diện phẳng, tinh tế, không bị đóng khung */}
              <div className="space-y-1">
                {contactChannels.map((ch, idx) => {
                  const IconComp = ch.icon;
                  return (
                    <motion.a
                      key={ch.id}
                      href={ch.href}
                      target={ch.id === "sms" ? "_self" : "_blank"}
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.08 + idx * 0.06,
                        ease: easeDecelerate,
                      }}
                      className="group flex items-center justify-between p-3 rounded-2xl hover:bg-black/[0.035] active:bg-black/[0.06] transition-all text-left"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${ch.iconBg}`}
                        >
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <strong className="text-sm font-bold text-zinc-900 block group-hover:text-black transition-colors">
                            {ch.name}
                          </strong>
                          <span className="text-xs text-zinc-500 font-mono block">
                            {ch.handle}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pl-2 shrink-0">
                        <span className="text-[10px] font-mono text-zinc-400 hidden sm:inline">
                          {ch.badge}
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-950 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                      </div>
                    </motion.a>
                  );
                })}
              </div>

              {/* Footer Notice */}
              <div className="pt-3 border-t border-black/[0.06] text-center">
                <span className="text-[11px] font-mono text-zinc-500 font-normal">
                  Mewmao Hotline: •{" "}
                  <a
                    href="tel:0988776655"
                    className="text-zinc-600 hover:text-zinc-950 font-normal transition-colors"
                  >
                    0988.776.655
                  </a>{" "}
                  •{" "}
                  <a
                    href="tel:0931233639"
                    className="text-zinc-600 hover:text-zinc-950 font-normal transition-colors"
                  >
                    0931.233.639
                  </a>
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
