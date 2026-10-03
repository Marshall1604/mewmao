"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/context/StoreContext";
import { ShoppingBag, Download, Eye, X, Sparkles, Check, ArrowRight } from "lucide-react";

interface StickerItem {
  id: string;
  num: string;
  titleVi: string;
  titleEn: string;
  tagVi: string;
  tagEn: string;
  descVi: string;
  descEn: string;
  src: string;
}

const STICKERS: StickerItem[] = [
  {
    id: "sticker-bottle-hug",
    num: "01",
    titleVi: "Mewmao Ôm Bình Rượu Mơ",
    titleEn: "Mewmao Hugging Plum Bottle",
    tagVi: "Signature",
    tagEn: "Signature",
    descVi: "Mèo Mewmao ôm chặt chai rượu mơ má đào 500ml nguyên bản, không buông một giọt.",
    descEn: "Mewmao cat clutching tight to the iconic 500ml blush plum spirit bottle.",
    src: "/images/stickers/mewmao-sticker-bottle-hug.jpg",
  },
  {
    id: "sticker-baby-angry",
    num: "02",
    titleVi: "Mewmao Em Bé Giận Dỗi",
    titleEn: "Grumpy Baby Mewmao",
    tagVi: "Mood",
    tagEn: "Mood",
    descVi: "Bé mèo mặc bỉm chấm bi hồng, khoanh tay phồng má giận cả thế giới.",
    descEn: "Pink polka-dot diaper, arms crossed, grumpy cheeks taking on the world.",
    src: "/images/stickers/mewmao-sticker-baby-angry.jpg",
  },
  {
    id: "sticker-baby-sneaky",
    num: "03",
    titleVi: "Mewmao Tinh Quái Đắc Ý",
    titleEn: "Sneaky Grin Baby",
    tagVi: "Cheeky",
    tagEn: "Cheeky",
    descVi: "Xoa xoa hai tay với nụ cười nham hiểm siêu quậy đầy toan tính.",
    descEn: "Rubbing paws with a sly, devious little grin plotting the next mischief.",
    src: "/images/stickers/mewmao-sticker-baby-sneaky.jpg",
  },
  {
    id: "sticker-baby-chill",
    num: "04",
    titleVi: "Mewmao Chill Nằm Nghiêng",
    titleEn: "Laidback Chill Pose",
    tagVi: "Vibe",
    tagEn: "Vibe",
    descVi: "Tư thế nằm nghiêng quyến rũ, thần thái thư giãn bất cần đời bên ly rượu ngon.",
    descEn: "Reclining sideway pose with effortless chill vibes after a good sip.",
    src: "/images/stickers/mewmao-sticker-baby-chill.jpg",
  },
  {
    id: "sticker-baby-boss",
    num: "05",
    titleVi: "Mewmao Trùm Nhí Hống Hách",
    titleEn: "Little Boss Mewmao",
    tagVi: "Boss Mode",
    tagEn: "Boss Mode",
    descVi: "Chống nạnh hiên ngang, nhướng mày tự tin đúng chuẩn đại ca ngầm.",
    descEn: "Hands on hips with an arched brow — absolute underground boss energy.",
    src: "/images/stickers/mewmao-sticker-baby-boss.jpg",
  },
];

export default function StickersPage() {
  const { language, setIsQuickBuyOpen } = useStore();
  const isEn = language === "en";
  const [selectedSticker, setSelectedSticker] = useState<StickerItem | null>(null);
  const [downloadedId, setDownloadedId] = useState<string | null>(null);

  const handleDownload = (e: React.MouseEvent, sticker: StickerItem) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = sticker.src;
    link.download = `${sticker.id}-mewmao-hd.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadedId(sticker.id);
    setTimeout(() => setDownloadedId(null), 2200);
  };

  return (
    <div className="py-16 sm:py-24 bg-[#faf9f6] text-zinc-900 min-h-screen">
      {/* 1. Header Banner - Tone Trắng Sang Trọng */}
      <section className="max-w-4xl mx-auto px-5 sm:px-8 text-center space-y-4">
        <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.35em] text-mewmao-orange font-bold block">
          {isEn ? "MEWMAO COLLECTIBLES • DIE-CUT SERIES" : "BỘ SƯU TẬP STICKER • MEWMAO ATELIER"}
        </span>

        <h1 className="font-serif text-5xl sm:text-7xl font-black text-zinc-950 leading-tight">
          {isEn ? (
            <>
              Mewmao <span className="text-amber-gradient">Stickers.</span>
            </>
          ) : (
            <>
              Bộ Sticker <span className="text-amber-gradient">Mewmao.</span>
            </>
          )}
        </h1>

        <p className="text-sm sm:text-base text-zinc-600 max-w-xl mx-auto font-normal leading-relaxed">
          {isEn
            ? "Iconic expressions of the nocturnal feline mascot. High-resolution die-cut illustrations crafted for laptop stickers, phone cases, and bottle tags."
            : "Những biểu cảm độc bản của linh vật mèo Mewmao. Thiết kế viền die-cut sắc nét chuẩn in ấn, dán laptop, điện thoại và đóng gói quà tặng."}
        </p>

        {/* Gift badge info */}
        <div className="pt-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200/80 text-zinc-800 text-xs font-mono shadow-xs">
            <Sparkles className="w-4 h-4 text-mewmao-orange shrink-0" />
            <span>
              {isEn
                ? "Complimentary die-cut sticker pack included with every bottle order!"
                : "Tặng kèm bộ sticker die-cut cao cấp trong mỗi hộp rượu Mewmao!"}
            </span>
          </div>
        </div>
      </section>

      {/* 2. Responsive Grid: Điện thoại 1 hàng 2 ảnh | Máy tính 1 hàng 4 ảnh */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 mt-14 sm:mt-18">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {STICKERS.map((sticker) => {
            const title = isEn ? sticker.titleEn : sticker.titleVi;
            const desc = isEn ? sticker.descEn : sticker.descVi;
            const tag = isEn ? sticker.tagEn : sticker.tagVi;
            const isDownloaded = downloadedId === sticker.id;

            return (
              <motion.div
                key={sticker.id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                onClick={() => setSelectedSticker(sticker)}
                className="group cursor-pointer bg-white rounded-3xl p-4 sm:p-6 border border-stone-200/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.12)] flex flex-col justify-between transition-all"
              >
                {/* Image Canvas with clean background */}
                <div className="relative aspect-square w-full rounded-2xl bg-[#f5f4f0] flex items-center justify-center p-3 sm:p-5 overflow-hidden">
                  <img
                    src={sticker.src}
                    alt={title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-md"
                    loading="lazy"
                  />

                  {/* Badge Index */}
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-[9px] sm:text-[10px] font-mono font-bold text-zinc-600 shadow-xs border border-stone-200/60">
                    #{sticker.num}
                  </span>

                  {/* Quick View overlay on hover */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="w-10 h-10 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                      <Eye className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="pt-4 space-y-1.5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1 text-[10px] font-mono text-zinc-400 pb-1">
                      <span className="uppercase text-mewmao-orange font-bold">{tag}</span>
                      <span>HD High-Res</span>
                    </div>

                    <h3 className="font-serif text-base sm:text-xl font-black text-zinc-950 group-hover:text-mewmao-orange transition-colors line-clamp-1 leading-snug">
                      {title}
                    </h3>

                    <p className="text-xs text-zinc-500 font-normal line-clamp-2 leading-relaxed pt-0.5 hidden sm:block">
                      {desc}
                    </p>
                  </div>

                  {/* Action row */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono font-bold text-mewmao-orange inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      {isEn ? "View" : "Xem"} <ArrowRight className="w-3 h-3" />
                    </span>

                    <button
                      type="button"
                      onClick={(e) => handleDownload(e, sticker)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 ${
                        isDownloaded
                          ? "bg-emerald-600 text-white"
                          : "bg-zinc-100 hover:bg-zinc-900 text-zinc-700 hover:text-white"
                      }`}
                      title={isEn ? "Download Original HD" : "Tải ảnh gốc HD"}
                    >
                      {isDownloaded ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span className="hidden sm:inline">{isEn ? "Saved" : "Đã tải"}</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3 h-3" />
                          <span className="hidden sm:inline">HD</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 3. Bottom CTA - Đặt mua rượu kèm sticker */}
        <div className="mt-16 p-8 sm:p-10 rounded-3xl bg-white border border-stone-200/80 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.06)] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-mewmao-orange font-bold block">
              {isEn ? "EXCLUSIVE GIFT PACK" : "QUÀ TẶNG KÈM ĐẶC QUYỀN"}
            </span>
            <h4 className="font-serif text-2xl sm:text-3xl font-black text-zinc-950">
              {isEn ? "Get the Full Sticker Set with Your Bottle" : "Nhận Trọn Bộ Sticker Khi Đặt Rượu Mewmao"}
            </h4>
            <p className="text-sm text-zinc-600 font-normal max-w-xl">
              {isEn
                ? "Every bottle of Mewmao Mơ Má Đào 500ml includes an exclusive die-cut collectible sticker pack. Handcrafted in Vietnam."
                : "Mỗi chai Rượu Mơ Má Đào Mewmao 500ml đều được tặng kèm bộ sticker die-cut ngẫu nhiên phiên bản giới hạn."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsQuickBuyOpen(true)}
            className="btn-mewmao-black shrink-0 py-3.5 px-8 text-xs shadow-md hover:scale-105 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            {isEn ? "Order Bottle — 289,000₫" : "Đặt Mua Ngay — 289.000₫"}
          </button>
        </div>
      </section>

      {/* 4. Full-screen Lightbox Preview Modal */}
      <AnimatePresence>
        {selectedSticker && (() => {
          const title = isEn ? selectedSticker.titleEn : selectedSticker.titleVi;
          const desc = isEn ? selectedSticker.descEn : selectedSticker.descVi;

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md p-4 sm:p-8 flex items-center justify-center"
              onClick={() => setSelectedSticker(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6"
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedSticker(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* High Res Image */}
                <div className="aspect-square w-full rounded-2xl bg-[#faf9f6] flex items-center justify-center p-6 border border-stone-200/60">
                  <img
                    src={selectedSticker.src}
                    alt={title}
                    className="max-h-full max-w-full object-contain drop-shadow-xl"
                  />
                </div>

                {/* Info & Download */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono text-mewmao-orange font-bold uppercase tracking-wider">
                      STICKER #{selectedSticker.num} • 100% ORIGINAL QUALITY
                    </span>
                    <h3 className="font-serif text-2xl font-black text-zinc-950 pt-0.5">
                      {title}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-600 font-normal leading-relaxed pt-1">
                      {desc}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={(e) => handleDownload(e, selectedSticker)}
                      className="btn-mewmao-black flex-1 justify-center text-xs py-3.5"
                    >
                      <Download className="w-4 h-4" />
                      {isEn ? "Download HD Sticker" : "Tải Về Ảnh Gốc HD"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSticker(null);
                        setIsQuickBuyOpen(true);
                      }}
                      className="btn-mewmao-white flex-1 justify-center text-xs py-3.5"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      {isEn ? "Order Bottle" : "Mua Rượu Nhận Quà"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
