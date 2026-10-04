"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, Sparkles, X, Check, Copy, ArrowRight, Gift } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { Voucher } from "@/types";

const easeDecelerate = [0.16, 1, 0.3, 1] as const;

export default function VoucherFloatingWidget() {
  const pathname = usePathname();
  const {
    isAgeVerified,
    vouchers,
    selectedVoucherCode,
    setSelectedVoucherCode,
    setIsQuickBuyOpen,
    language,
  } = useStore();

  const isEn = language === "en";
  const [isOpen, setIsOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. Chỉ hiển thị khi đã xác nhận đủ 18+ và không ở các trang quản trị
  if (!isAgeVerified) return null;
  if (pathname === "/admin" || pathname === "/dashboard" || pathname === "/seller") {
    return null;
  }

  // 2. Chỉ hiển thị nếu hệ thống thực sự có ít nhất 1 voucher hợp lệ
  const activeVouchers = vouchers.filter((v) => {
    if (v.status !== "active") return false;
    if (v.endDate && new Date(v.endDate).getTime() < new Date().setHours(0, 0, 0, 0)) return false;
    if (typeof v.usageLimit === "number" && v.usedCount >= v.usageLimit) return false;
    return true;
  });

  if (activeVouchers.length === 0) return null;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setSelectedVoucherCode(code);
    setToastMessage(isEn ? `Copied code "${code}"!` : `Đã sao chép mã "${code}"!`);
    setTimeout(() => setCopiedCode(null), 2500);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUseNow = (code: string) => {
    setSelectedVoucherCode(code);
    setIsOpen(false);
    setIsQuickBuyOpen(true);
  };

  return (
    <>
      {/* ── 1. FLOATING ICON TINH TẾ (GÓC DƯỚI BÊN TRÁI) ── */}
      <div className="fixed left-4 sm:left-7 bottom-6 sm:bottom-8 z-40 select-none">
        {/* Vòng hào quang sáng chớp nhẹ định kỳ */}
        <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-mewmao-orange/30 to-amber-500/20 blur-sm animate-pulse pointer-events-none" />

        <motion.button
          type="button"
          onClick={() => setIsOpen(true)}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative group flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 rounded-full bg-zinc-950/90 text-white backdrop-blur-xl border border-white/20 shadow-[0_10px_35px_rgba(0,0,0,0.35)] transition-all overflow-hidden"
          title={isEn ? "View Available Discount Vouchers" : "Xem Mã Giảm Giá Đang Có"}
        >
          {/* Hiệu ứng tia sáng lướt qua chớp chớp định kỳ (Shimmer sweep) */}
          <motion.div
            className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 pointer-events-none"
            animate={{
              x: ["-150%", "300%"],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              repeatDelay: 5.5, // Cứ mỗi ~6-7 giây chớp nhẹ 1 lần
              ease: "easeInOut",
            }}
          />

          {/* Icon Tag / Quà tặng với hiệu ứng rung nhẹ theo chu kỳ */}
          <motion.div
            animate={{
              rotate: [0, -10, 10, -6, 6, 0],
              scale: [1, 1.15, 1, 1.1, 1],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              repeatDelay: 5.5,
              ease: "easeInOut",
            }}
            className="w-7 h-7 rounded-full bg-gradient-to-br from-mewmao-orange to-amber-500 flex items-center justify-center text-white shrink-0 shadow-sm"
          >
            <Tag className="w-3.5 h-3.5" />
          </motion.div>

          {/* Nhãn chữ phẳng tinh tế */}
          <div className="flex flex-col text-left leading-none">
            <span className="text-[9px] font-mono tracking-wider uppercase text-zinc-400 font-medium">
              {isEn ? "Voucher" : "Ưu Đãi"}
            </span>
            <span className="text-xs font-bold text-white tracking-tight flex items-center gap-1 mt-0.5">
              <span>{isEn ? "Discounts" : "Giảm Giá"}</span>
              <span className="inline-flex items-center justify-center px-1.5 py-0.2 bg-mewmao-orange text-[10px] font-mono font-black rounded-full leading-tight">
                {activeVouchers.length}
              </span>
            </span>
          </div>

          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse ml-0.5 hidden sm:inline-block" />
        </motion.button>
      </div>

      {/* ── 2. TOAST THÔNG BÁO COPY NHANH ── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.3, ease: easeDecelerate }}
            className="fixed bottom-20 sm:bottom-24 left-4 sm:left-7 z-50 px-4 py-2 rounded-2xl bg-zinc-950 text-white text-xs font-semibold shadow-xl border border-zinc-800 flex items-center gap-2 pointer-events-none"
          >
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 3. POPUP / BOTTOM-SHEET DANH SÁCH VOUCHER PHẲNG & TRỰC QUAN ── */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
            {/* Backdrop mờ mịn */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Modal Card / Bottom Sheet */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.96 }}
              transition={{ duration: 0.4, ease: easeDecelerate }}
              className="relative w-full sm:max-w-md bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-zinc-200/80 z-10 max-h-[85vh] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="px-5 sm:px-6 py-4 border-b border-zinc-100 flex items-center justify-between shrink-0 bg-white/90 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-mewmao-orange">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-950 leading-tight">
                      {isEn ? "Available Vouchers" : "Kho Mã Giảm Giá"}
                    </h3>
                    <p className="text-[11px] text-zinc-500 font-medium">
                      {isEn ? "1-Click copy or apply directly to your order" : "Chạm để sao chép hoặc áp dụng ngay khi mua"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body: Danh sách Voucher Tickets */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 text-xs">
                {activeVouchers.map((v) => {
                  const isCopied = copiedCode === v.code;
                  const isSelected = selectedVoucherCode === v.code;

                  return (
                    <div
                      key={v.id}
                      className="group relative bg-zinc-50 hover:bg-orange-50/30 rounded-2xl border border-zinc-200/90 hover:border-orange-200 p-4 transition-all shadow-xs space-y-3"
                    >
                      {/* Vết cắt vé Voucher thẩm mỹ (Notch) */}
                      <span className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border border-zinc-200" />
                      <span className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border border-zinc-200" />

                      {/* Header của vé: Mức giảm & Mã Voucher */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-lg sm:text-xl font-black text-mewmao-orange font-mono tracking-tight leading-none">
                            {v.discountType === "percent"
                              ? `Giảm ${v.discountValue}%`
                              : `Giảm ${v.discountValue.toLocaleString("vi-VN")}₫`}
                          </div>
                          <h4 className="font-bold text-zinc-900 text-xs sm:text-sm mt-1">
                            {v.name}
                          </h4>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-zinc-950 text-white tracking-wider shadow-xs">
                            {v.code}
                          </span>
                        </div>
                      </div>

                      {/* Điều kiện vé ngắn gọn, trực quan */}
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-zinc-500 pt-1 border-t border-zinc-200/60 font-mono">
                        <span>
                          {v.minOrderValue && v.minOrderValue > 0
                            ? `Đơn từ ${v.minOrderValue.toLocaleString("vi-VN")}₫`
                            : "Mọi đơn hàng"}
                        </span>
                        <span>•</span>
                        <span>
                          {v.endDate
                            ? `HSD: ${v.endDate.split("-").reverse().join("/")}`
                            : "Vô thời hạn"}
                        </span>
                        {typeof v.usageLimit === "number" && (
                          <>
                            <span>•</span>
                            <span className="text-zinc-600">
                              Còn {Math.max(0, v.usageLimit - v.usedCount)} lượt
                            </span>
                          </>
                        )}
                      </div>

                      {/* Nút thao tác: Sao chép & Dùng ngay */}
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleCopyCode(v.code)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                            isCopied
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200"
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Đã Chép</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-zinc-500" />
                              <span>Sao Chép</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleUseNow(v.code)}
                          className="px-3.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-all active:scale-98"
                        >
                          <span>{isSelected ? "Đang Chọn" : "Dùng Ngay"}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer Tip */}
              <div className="p-3.5 bg-zinc-50 border-t border-zinc-100 text-center text-[11px] text-zinc-500 font-medium shrink-0">
                {isEn
                  ? "Tip: Click 'Use Now' to pre-apply your discount instantly at checkout."
                  : "Mẹo: Nhấn 'Dùng Ngay' để hệ thống tự động trừ tiền giảm giá khi đặt hàng."}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
