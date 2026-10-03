"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/context/StoreContext";
import { Download, X, Check } from "lucide-react";

interface StickerItem {
  id: string;
  num: string;
  titleVi: string;
  titleEn: string;
  src: string;
}

const STICKERS: StickerItem[] = [
  {
    id: "sticker-bottle-hug",
    num: "01",
    titleVi: "Mewmao Ôm Bình Rượu Mơ",
    titleEn: "Mewmao Hugging Plum Bottle",
    src: "/images/stickers/mewmao-sticker-bottle-hug.jpg",
  },
  {
    id: "sticker-sunglasses",
    num: "02",
    titleVi: "Mewmao Đeo Kính Râm Ngầu",
    titleEn: "Cool Shades Mewmao",
    src: "/images/stickers/mewmao-sticker-sunglasses.jpg",
  },
  {
    id: "sticker-baby-angry",
    num: "03",
    titleVi: "Mewmao Em Bé Giận Dỗi",
    titleEn: "Grumpy Baby Mewmao",
    src: "/images/stickers/mewmao-sticker-baby-angry.jpg",
  },
  {
    id: "sticker-smirk-crossed",
    num: "04",
    titleVi: "Mewmao Khoanh Tay Tự Đắc",
    titleEn: "Smug Arms-Crossed Cat",
    src: "/images/stickers/mewmao-sticker-smirk-crossed.jpg",
  },
  {
    id: "sticker-baby-sneaky",
    num: "05",
    titleVi: "Mewmao Tinh Quái Đắc Ý",
    titleEn: "Sneaky Grin Baby",
    src: "/images/stickers/mewmao-sticker-baby-sneaky.jpg",
  },
  {
    id: "sticker-baby-chill",
    num: "06",
    titleVi: "Mewmao Chill Nằm Nghiêng",
    titleEn: "Laidback Chill Pose",
    src: "/images/stickers/mewmao-sticker-baby-chill.jpg",
  },
  {
    id: "sticker-baby-boss",
    num: "07",
    titleVi: "Mewmao Trùm Nhí Hống Hách",
    titleEn: "Little Boss Mewmao",
    src: "/images/stickers/mewmao-sticker-baby-boss.jpg",
  },
];

export default function StickersPage() {
  const { language } = useStore();
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
    setTimeout(() => setDownloadedId(null), 2000);
  };

  return (
    <div className="py-14 sm:py-20 bg-[#faf9f6] text-zinc-900 min-h-screen">
      {/* 1. Header — Tinh gọn, tối giản, sang trọng tuyệt đối */}
      <section className="max-w-4xl mx-auto px-5 sm:px-8 text-center pt-2 pb-6 sm:pb-10">
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
      </section>

      {/* 2. Grid Sticker Phẳng — Không đóng khung nhiều lớp, hòa quyện tự nhiên */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {STICKERS.map((sticker) => {
            const title = isEn ? sticker.titleEn : sticker.titleVi;
            const isDownloaded = downloadedId === sticker.id;

            return (
              <motion.div
                key={sticker.id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                onClick={() => setSelectedSticker(sticker)}
                className="group cursor-pointer bg-white rounded-[26px] p-4 sm:p-6 border border-stone-200/70 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_-6px_rgba(0,0,0,0.08)] flex flex-col justify-between transition-all"
              >
                {/* Sticker Canvas — Nền trắng liền mạch, sticker nổi bật tự nhiên */}
                <div className="relative aspect-square w-full flex items-center justify-center p-2 sm:p-4 overflow-hidden">
                  <img
                    src={sticker.src}
                    alt={title}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* Minimalist Caption Row */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono text-zinc-400 font-semibold block leading-tight">
                      #{sticker.num}
                    </span>
                    <h3 className="font-serif text-sm sm:text-base font-bold text-zinc-950 group-hover:text-mewmao-orange transition-colors truncate leading-tight pt-0.5">
                      {title}
                    </h3>
                  </div>

                  {/* Clean Download Button */}
                  <button
                    type="button"
                    onClick={(e) => handleDownload(e, sticker)}
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isDownloaded
                        ? "bg-emerald-600 text-white"
                        : "bg-stone-100 hover:bg-zinc-950 text-zinc-600 hover:text-white"
                    }`}
                    title={isEn ? "Download Original HD" : "Tải ảnh gốc HD"}
                  >
                    {isDownloaded ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 3. Modal Phóng To Chi Tiết — Tinh gọn, chỉ có nút tải ảnh */}
      <AnimatePresence>
        {selectedSticker && (() => {
          const title = isEn ? selectedSticker.titleEn : selectedSticker.titleVi;
          const isDownloaded = downloadedId === selectedSticker.id;

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md p-4 sm:p-8 flex items-center justify-center"
              onClick={() => setSelectedSticker(null)}
            >
              <motion.div
                initial={{ scale: 0.94, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.94, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5"
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedSticker(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Sticker Canvas in Modal */}
                <div className="aspect-square w-full rounded-2xl bg-white flex items-center justify-center p-4">
                  <img
                    src={selectedSticker.src}
                    alt={title}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                {/* Info & Download Button */}
                <div className="space-y-4 pt-1">
                  <div>
                    <span className="text-[10px] font-mono text-mewmao-orange font-bold uppercase tracking-wider block">
                      STICKER #{selectedSticker.num} • HD ORIGINAL
                    </span>
                    <h3 className="font-serif text-2xl font-black text-zinc-950 pt-0.5">
                      {title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleDownload(e, selectedSticker)}
                    className="btn-mewmao-black w-full justify-center text-xs py-3.5"
                  >
                    {isDownloaded ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{isEn ? "Downloaded Successfully" : "Đã Tải Về Máy"}</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>{isEn ? "Download HD Sticker" : "Tải Về Ảnh Gốc HD"}</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
