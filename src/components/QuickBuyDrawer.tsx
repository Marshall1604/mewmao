"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/context/StoreContext";
import {
  X,
  Minus,
  Plus,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export default function QuickBuyDrawer() {
  const {
    product,
    cartQuantity,
    setCartQuantity,
    isQuickBuyOpen,
    setIsQuickBuyOpen,
    activeRefCode,
    setActiveRefCode,
    sellers,
    placeOrder,
    t,
    language,
  } = useStore();
  const isEn = language === "en";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [manualRefCode, setManualRefCode] = useState(activeRefCode || "");
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);

  // Đồng bộ manualRefCode khi activeRefCode thay đổi (từ cookie hoặc URL)
  useEffect(() => {
    if (activeRefCode && !manualRefCode) {
      setManualRefCode(activeRefCode);
    }
  }, [activeRefCode]);

  if (!isQuickBuyOpen) return null;

  // Xác định mã affiliate hiệu lực & Seller tương ứng
  const effectiveRefCode =
    manualRefCode.trim().toUpperCase() || (activeRefCode || "").trim().toUpperCase();
  const matchedSeller = effectiveRefCode
    ? sellers.find(
        (s) => s.affiliateCode && s.affiliateCode.trim().toUpperCase() === effectiveRefCode
      )
    : null;
  const subtotal = product.price * cartQuantity;
  const totalAmount = subtotal; // Bỏ giảm giá: mua đúng giá niêm yết 289.000₫/chai

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      alert(
        isEn
          ? "Please fill in your Name, Phone Number, and Delivery Address."
          : "Vui lòng điền Họ tên, Số điện thoại và Địa chỉ nhận hàng."
      );
      return;
    }

    const finalRefCode =
      manualRefCode.trim().toUpperCase() ||
      (activeRefCode ? activeRefCode.trim().toUpperCase() : "");

    if (finalRefCode) {
      setActiveRefCode(finalRefCode);
    }

    const order = placeOrder({
      customerName: name,
      customerPhone: phone,
      customerAddress: address,
      customerNote: note,
      quantity: cartQuantity,
      paymentMethod: "cod",
      affiliateCode: finalRefCode || undefined,
    });
    setConfirmedOrder(order);
  };

  const handleClose = () => {
    setIsQuickBuyOpen(false);
    setConfirmedOrder(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-over panel — Vandal Bar light detail card style */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div className="w-screen max-w-md flex flex-col overflow-y-auto" style={{ background: "#f5f5f0" }}>
          
          {/* Header */}
          <div className="px-6 py-5 flex items-center justify-between sticky top-0 z-10" style={{ background: "#f5f5f0", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-zinc-950 flex items-center justify-center text-white text-xs font-serif font-black">
                M
              </div>
              <h2 className="font-serif text-xl font-black text-zinc-950">
                {t("drawer_title")}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {confirmedOrder ? (
            /* ── ORDER SUCCESS (ĐƠN HÀNG ĐÃ LƯU, SHOP SẼ LIÊN HỆ LẠI) ── */
            <div className="p-6 sm:p-8 space-y-6 flex-1 flex flex-col justify-center text-center animate-fade-in">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-emerald-600 font-bold block">
                  {isEn ? "ORDER SAVED TO SYSTEM" : "ĐÃ LƯU ĐƠN HÀNG VÀO HỆ THỐNG"}
                </span>
                <h3 className="font-serif text-3xl font-black text-zinc-950">
                  {isEn ? "Order Confirmed!" : "Đặt Hàng Thành Công!"}
                </h3>
                <p className="text-xs text-zinc-600 font-light max-w-xs mx-auto leading-relaxed">
                  {isEn
                    ? "We have recorded your order into the system. Mewmao will contact you directly by phone shortly to confirm and arrange prompt delivery."
                    : "Chúng tôi đã lưu đơn hàng vào hệ thống. Mewmao sẽ sớm liên hệ trực tiếp qua số điện thoại để xác nhận đơn và giao hàng cho bạn."}
                </p>
                <div className="pt-2 text-xs text-zinc-500 font-mono">
                  {isEn ? "Order ID:" : "Mã đơn hàng:"}{" "}
                  <strong className="text-zinc-950 font-bold font-mono text-sm">{confirmedOrder.id}</strong>
                </div>
              </div>

              {/* Order summary info */}
              <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 text-left space-y-2 text-xs shadow-xs">
                <div className="flex justify-between pb-2 border-b border-zinc-100">
                  <span className="text-zinc-500">{isEn ? "Recipient:" : "Người nhận:"}</span>
                  <strong className="text-zinc-900">{confirmedOrder.customerName}</strong>
                </div>
                <div className="flex justify-between pb-2 border-b border-zinc-100">
                  <span className="text-zinc-500">{isEn ? "Phone Number:" : "Số điện thoại:"}</span>
                  <strong className="text-zinc-900 font-mono">{confirmedOrder.customerPhone}</strong>
                </div>
                <div className="flex justify-between pb-2 border-b border-zinc-100">
                  <span className="text-zinc-500">{isEn ? "Delivery Address:" : "Địa chỉ nhận:"}</span>
                  <span className="text-zinc-800 text-right max-w-[200px] truncate" title={confirmedOrder.customerAddress}>{confirmedOrder.customerAddress}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-zinc-100">
                  <span className="text-zinc-500">{isEn ? "Quantity:" : "Số lượng chai:"}</span>
                  <strong className="text-zinc-900">
                    {confirmedOrder.items.reduce((s: number, i: any) => s + i.quantity, 0)} {isEn ? "bottles (500ml)" : "chai Mewmao (500ml)"}
                  </strong>
                </div>
                {confirmedOrder.affiliateCode && (
                  <div className="flex justify-between pb-2 border-b border-zinc-100">
                    <span className="text-zinc-500">{isEn ? "Ambassador Code:" : "Mã giới thiệu:"}</span>
                    <strong className="text-mewmao-orange font-mono font-bold">
                      {confirmedOrder.affiliateCode} (Đã ghi nhận hoa hồng)
                    </strong>
                  </div>
                )}
                <div className="flex justify-between items-center pt-1">
                  <span className="text-zinc-500 font-semibold">{isEn ? "Total Amount:" : "Tổng thanh toán:"}</span>
                  <strong className="text-lg font-black text-mewmao-orange font-mono">
                    {confirmedOrder.totalAmount.toLocaleString(isEn ? "en-US" : "vi-VN")}₫
                  </strong>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="btn-mewmao-black w-full justify-center py-3.5 text-xs font-bold font-sans shadow-sm"
              >
                {isEn ? "Done & Continue Exploring" : "Hoàn Tất & Xem Tiếp Website"}
              </button>
            </div>
          ) : (
            /* ── ORDER FORM ── */
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-6">

                {/* Product summary — Clean Apple luxury white card */}
                <div className="rounded-2xl bg-white border border-black/10 overflow-hidden shadow-xs">
                  <div className="flex items-center gap-4 p-4">
                    {/* Bottle thumbnail */}
                    <div className="w-16 h-20 flex-shrink-0 flex items-center justify-center bg-[#FAF9F6] rounded-xl p-1">
                      <img
                        src="/images/mewmao-bottle-standing.png?v=hd1"
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Star rating */}
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-mewmao-orange text-xs tracking-widest">★★★★★</span>
                        <span className="text-[9px] font-mono text-zinc-400">185 Reviews</span>
                      </div>
                      <h3 className="font-serif text-lg font-black text-zinc-950 truncate">
                        {product.name}
                      </h3>
                      <p className="text-xs text-zinc-400 font-mono">{product.volume} • {product.abv}</p>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-lg font-black text-mewmao-orange font-mono">
                          {product.price.toLocaleString(isEn ? "en-US" : "vi-VN")}₫
                        </span>
                        <span className="text-xs text-zinc-400 line-through font-mono">
                          {product.originalPrice.toLocaleString(isEn ? "en-US" : "vi-VN")}₫
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity stepper — pill style */}
                  <div className="flex items-center justify-between px-4 py-3 border-t border-black/5 bg-zinc-50">
                    <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider font-semibold">{t("drawer_qty")}</span>
                    <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-white border border-black/10 shadow-xs">
                      <button
                        type="button"
                        onClick={() => setCartQuantity(Math.max(1, cartQuantity - 1))}
                        className="text-zinc-500 hover:text-black font-bold text-base w-5 text-center transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono font-black text-sm text-zinc-950 w-5 text-center">
                        {String(cartQuantity).padStart(2, "0")}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCartQuantity(cartQuantity + 1)}
                        className="text-zinc-500 hover:text-black font-bold text-base w-5 text-center transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── MÃ AFFILIATE & LINK GIỚI THIỆU (COOKIE 30 NGÀY) ── */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-500 font-bold">
                      {isEn ? "Ambassador / Referral Code" : "Mã Đại Sứ Giới Thiệu (Nếu có)"}
                    </label>
                    {activeRefCode && (
                      <span className="text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {isEn ? "Cookie 30 Days Active" : "Cookie 30 ngày đang lưu"}
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={manualRefCode}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        setManualRefCode(val);
                        if (val.trim()) {
                          setActiveRefCode(val.trim());
                        }
                      }}
                      placeholder={t("drawer_ref_placeholder") || "Nhập mã affiliate (VD: LMN, HOAI...)"}
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-950 bg-white uppercase font-mono tracking-widest text-zinc-800 placeholder:text-zinc-300 transition-colors"
                    />
                    {manualRefCode && (
                      <button
                        type="button"
                        onClick={() => {
                          setManualRefCode("");
                          setActiveRefCode(null);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 text-xs p-1"
                        title="Xóa mã"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Real-time Recognition Badge */}
                  {matchedSeller ? (
                    <div className="flex items-center justify-between text-xs px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 animate-fade-in">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <span className="font-bold text-[11px] block text-emerald-950">
                            {isEn ? `Ambassador: ${matchedSeller.name}` : `Đại sứ: ${matchedSeller.name}`}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-mono">
                            {isEn
                              ? `Code: ${matchedSeller.affiliateCode} • Commission credited: ${Math.round(matchedSeller.commissionRate * 100)}%`
                              : `Mã: ${matchedSeller.affiliateCode} • Hoa hồng trích: ${Math.round(matchedSeller.commissionRate * 100)}%`}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                        {isEn ? "✓ Verified" : "✓ Đã nhận diện"}
                      </span>
                    </div>
                  ) : effectiveRefCode ? (
                    <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl bg-orange-50/80 border border-orange-200/80 text-zinc-800 animate-fade-in">
                      <Sparkles className="w-3.5 h-3.5 text-mewmao-orange shrink-0" />
                      <span className="text-[11px] text-zinc-700 font-mono">
                        {isEn
                          ? `Code "${effectiveRefCode}" will be credited to Ambassador upon order completion.`
                          : `Mã "${effectiveRefCode}" sẽ được ghi nhận tính hoa hồng khi bạn đặt hàng.`}
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* Customer Info */}
                <div className="space-y-3">
                  <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-400">
                    {t("drawer_info_header")}
                  </div>
                  {[
                    { value: name, onChange: setName, placeholder: t("drawer_name"), type: "text" },
                    { value: phone, onChange: setPhone, placeholder: t("drawer_phone"), type: "tel" },
                    { value: address, onChange: setAddress, placeholder: t("drawer_address"), type: "text" },
                    { value: note, onChange: setNote, placeholder: t("drawer_note"), type: "text", required: false },
                  ].map((field, i) => (
                    <input
                      key={i}
                      type={field.type}
                      required={field.required !== false}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3 text-sm rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-950 bg-white text-zinc-800 placeholder:text-zinc-300 transition-colors"
                    />
                  ))}
                </div>
              </div>

              {/* Total + Submit */}
              <div className="pt-5 border-t border-zinc-200/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider font-semibold">
                    {isEn ? "Total Amount:" : "Tổng Thanh Toán:"}
                  </span>
                  <span className="font-serif text-3xl font-black text-zinc-950">
                    {totalAmount.toLocaleString(isEn ? "en-US" : "vi-VN")}₫
                  </span>
                </div>
                <button
                  type="submit"
                  className="btn-mewmao-black w-full justify-center py-4 text-xs font-bold uppercase tracking-wider shadow-lg active:scale-98 transition-all"
                >
                  BUY — {totalAmount.toLocaleString(isEn ? "en-US" : "vi-VN")}₫ <ArrowRight className="w-4 h-4 ml-1" />
                </button>
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>
                    {isEn
                      ? "Official Guarantee • 100% Transit Breakage Protection"
                      : "Cam kết chính hãng • Đóng gói chống vỡ 100%"}
                  </span>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
