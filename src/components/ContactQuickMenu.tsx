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

// Apple-style decelerating cubic-bezier easing (chậm dần đều)
const easeDecelerate = [0.16, 1, 0.3, 1] as const;

export default function ContactQuickMenu() {
  const pathname = usePathname();
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
      badge: "Phản hồi trong 5 phút",
      color: "bg-[#1877F2]/10 text-[#1877F2] border-[#1877F2]/20 hover:bg-[#1877F2] hover:text-white",
      href: "https://www.facebook.com/Mewmaodistillery",
      icon: Facebook,
    },
    {
      id: "instagram",
      name: "Instagram Direct",
      handle: "@mewmaodistillery",
      badge: "Stories & Lookbook",
      color: "bg-[#E4405F]/10 text-[#E4405F] border-[#E4405F]/20 hover:bg-[#E4405F] hover:text-white",
      href: "https://www.instagram.com/mewmaodistillery",
      icon: Instagram,
    },
    {
      id: "sms",
      name: "Tin Nhắn SMS",
      handle: "0988.776.655",
      badge: "Hỗ trợ 24/7",
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-600 hover:text-white",
      href: "sms:0988776655?&body=Ch%C3%A0o%20Mewmao,%20t%C3%B4i%20mu%E1%BB%91n%20t%C6%B0%20v%E1%BA%A5n%20%C4%91%E1%BA%B7t%20r%C6%B0%E1%BB%A3u%20m%C6%A1%20m%C3%A1%20%C4%91%C3%A0o!",
      icon: MessageSquare,
    },
  ];

  return (
    <>
      {/* 1. Draggable Floating Contact Widget (Xuất hiện full trang, đứng yên khi cuộn, có thể kéo di chuyển) */}
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
          className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/95 backdrop-blur-md border border-black/15 hover:border-black text-zinc-950 flex items-center justify-center shadow-xl transition-all group flex-shrink-0"
          title="Liên hệ Mewmao (Facebook, Instagram, SMS) — Kéo để di chuyển vị trí"
          aria-label="Liên hệ Mewmao"
        >
          {/* Amber pulsing indicator */}
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-mewmao-orange border-2 border-white animate-pulse" />

          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-950 group-hover:text-mewmao-orange transition-colors" />
        </motion.button>
      </motion.div>

      {/* 2. Decelerating Modal / Popup Menu (Animation chậm dần đều) */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with smooth fade */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: easeDecelerate }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Card with smooth ease-out deceleration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 35 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{
                duration: 0.65,
                ease: easeDecelerate,
              }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-black/10 z-10 space-y-6"
            >
              {/* Header: Đã bỏ badge "KẾT NỐI TRỰC TIẾP" và mô tả con theo yêu cầu */}
              <div className="flex items-center justify-between pb-1">
                <h3 className="font-serif text-2xl font-black text-zinc-950 leading-tight">
                  Liên Hệ Mewmao
                </h3>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-950 transition-colors"
                  aria-label="Đóng"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 3 Channels (Staggered Decelerating Animation) */}
              <div className="space-y-3">
                {contactChannels.map((ch, idx) => {
                  const IconComp = ch.icon;
                  return (
                    <motion.a
                      key={ch.id}
                      href={ch.href}
                      target={ch.id === "sms" ? "_self" : "_blank"}
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.5,
                        delay: 0.12 + idx * 0.08,
                        ease: easeDecelerate,
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-black/08 hover:border-black/20 bg-[#FAF9F6] hover:bg-white hover:shadow-md transition-all text-left"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-colors ${ch.color}`}
                        >
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <strong className="text-sm font-bold text-zinc-900 group-hover:text-black">
                              {ch.name}
                            </strong>
                          </div>
                          <p className="text-xs text-zinc-500 font-mono truncate">
                            {ch.handle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 pl-2 flex-shrink-0">
                        <span className="text-[10px] font-mono text-zinc-400 group-hover:text-zinc-800 hidden sm:inline">
                          {ch.badge}
                        </span>
                        <div className="w-7 h-7 rounded-full bg-zinc-100 group-hover:bg-zinc-950 group-hover:text-white flex items-center justify-center transition-colors">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </motion.a>
                  );
                })}
              </div>

              {/* Footer Notice */}
              <div className="pt-2 text-center border-t border-black/06">
                <span className="text-[11px] font-mono text-zinc-400">
                  Mewmao Hotline: <strong className="text-zinc-900">0988.776.655</strong> (Zalo/Call/SMS)
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
