"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { Seller, Order, PayoutRequest } from "@/types";
import {
  Lock,
  ArrowRight,
  Copy,
  Check,
  ExternalLink,
  ShoppingBag,
  TrendingUp,
  CreditCard,
  Wine,
  Sparkles,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  HelpCircle,
  Smartphone,
  Send,
  Building,
  X,
} from "lucide-react";

export default function SellerPortalPage() {
  const { language, registerSeller, requestPayout } = useStore();
  const isEn = language === "en";
  const formatPrice = (val: number) =>
    isEn ? `${val.toLocaleString("en-US")}₫` : `${val.toLocaleString("vi-VN")}₫`;

  // Authentication State
  const [authenticatedSeller, setAuthenticatedSeller] = useState<Seller | null>(null);
  const [loadedSellerOrders, setLoadedSellerOrders] = useState<Order[]>([]);
  const [loadedSellerPayouts, setLoadedSellerPayouts] = useState<PayoutRequest[]>([]);
  const [pinDigits, setPinDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [pinError, setPinError] = useState<string>("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Registration Modal State
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [registerForm, setRegisterForm] = useState({ name: "", phone: "", email: "" });
  const [isSubmittingRegister, setIsSubmittingRegister] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registerError, setRegisterError] = useState("");

  // UI States
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [mobileLayout, setMobileLayout] = useState<"card" | "table">("card");
  const [payoutAmount, setPayoutAmount] = useState<string>("");
  const [payoutMessage, setPayoutMessage] = useState<string>("");

  // Tải thông tin phiên đăng nhập của Seller từ máy chủ
  const refreshSellerSession = async () => {
    try {
      const res = await fetch("/api/auth/seller/me");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.seller) {
          setAuthenticatedSeller(data.seller);
          if (Array.isArray(data.orders)) setLoadedSellerOrders(data.orders);
          if (Array.isArray(data.payouts)) setLoadedSellerPayouts(data.payouts);
          if (typeof window !== "undefined") {
            sessionStorage.setItem("mewmao_active_seller_id", data.seller.id);
          }
        }
      }
    } catch {}
  };

  useEffect(() => {
    refreshSellerSession();
  }, []);

  const currentSeller = authenticatedSeller;

  // Origin URL for affiliate links
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://mewmao.com";
  const affiliateUrl = currentSeller
    ? `${origin}/?ref=${currentSeller.affiliateCode}`
    : "";

  // Filter orders made through this seller's affiliate link
  const sellerOrders: Order[] = loadedSellerOrders;

  // Calculate realtime metrics
  const bottlesSoldFromOrders = sellerOrders.reduce(
    (sum, o) => sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );
  const totalBottlesSold = sellerOrders.length > 0
    ? bottlesSoldFromOrders
    : (currentSeller?.bottlesSoldCount || 0);

  const totalCommissionFromOrders = sellerOrders.reduce(
    (sum, o) => sum + (o.sellerCommission || 0),
    0
  );
  const totalCommissionEarned = sellerOrders.length > 0
    ? totalCommissionFromOrders
    : (currentSeller?.totalEarned || 0);


  // Filter payouts requested by this seller
  const sellerPayouts = loadedSellerPayouts;

  // PIN Input Handlers
  const handlePinChange = (index: number, val: string) => {
    if (val.length > 1) {
      val = val.slice(-1);
    }
    if (!/^\d*$/.test(val)) return;

    const newDigits = [...pinDigits];
    newDigits[index] = val;
    setPinDigits(newDigits);
    setPinError("");

    // Auto-focus next input
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Verify when 6 digits are complete
    const fullPin = newDigits.join("");
    if (fullPin.length === 6) {
      verifyPin(fullPin);
    }
  };

  const handlePinKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !pinDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyPin = async (pin: string) => {
    try {
      const res = await fetch("/api/auth/seller/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.seller) {
        setAuthenticatedSeller(data.seller);
        setPinError("");
        if (typeof window !== "undefined") {
          sessionStorage.setItem("mewmao_active_seller_id", data.seller.id);
        }
        await refreshSellerSession();
      } else {
        setPinError(
          data.error ||
            (isEn
              ? "Incorrect PIN or not yet issued by Admin. Please try again!"
              : "Mã PIN không đúng hoặc chưa được Admin cấp. Vui lòng thử lại!")
        );
        setTimeout(() => {
          setPinDigits(["", "", "", "", "", ""]);
          inputRefs.current[0]?.focus();
        }, 700);
      }
    } catch {
      setPinError(isEn ? "Connection error" : "Lỗi kết nối máy chủ. Vui lòng thử lại!");
    }
  };

  const handleRegisterSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.name.trim()) {
      setRegisterError(isEn ? "Please enter your name" : "Vui lòng nhập họ và tên");
      return;
    }
    if (!registerForm.phone.trim()) {
      setRegisterError(isEn ? "Please enter your phone number" : "Vui lòng nhập số điện thoại");
      return;
    }
    if (!registerForm.email.trim()) {
      setRegisterError(isEn ? "Please enter your email" : "Vui lòng nhập địa chỉ email");
      return;
    }

    setIsSubmittingRegister(true);
    setRegisterError("");
    try {
      await registerSeller({
        name: registerForm.name.trim(),
        phone: registerForm.phone.trim(),
        email: registerForm.email.trim(),
      });
      setRegisterSuccess(true);
    } catch (err: any) {
      setRegisterError(
        err.message ||
          (isEn
            ? "Registration failed. Please try again."
            : "Đăng ký thất bại. Vui lòng thử lại.")
      );
    } finally {
      setIsSubmittingRegister(false);
    }
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const pin = pinDigits.join("");
    if (pin.length < 6) {
      setPinError(
        isEn
          ? "Please enter the full 6-digit PIN"
          : "Vui lòng nhập đủ 6 chữ số mã PIN"
      );
      return;
    }
    verifyPin(pin);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/seller/me", { method: "POST" });
    } catch {}
    setAuthenticatedSeller(null);
    setLoadedSellerOrders([]);
    setLoadedSellerPayouts([]);
    setPinDigits(["", "", "", "", "", ""]);
    setPinError("");
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("mewmao_active_seller_id");
    }
  };

  const handleCopyLink = () => {
    if (!affiliateUrl) return;
    navigator.clipboard.writeText(affiliateUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    if (!currentSeller?.affiliateCode) return;
    navigator.clipboard.writeText(currentSeller.affiliateCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSeller) return;
    const amount = Number(payoutAmount);
    if (!amount || isNaN(amount) || amount <= 0) {
      setPayoutMessage(
        isEn
          ? "Please enter a valid amount"
          : "Vui lòng nhập số tiền hợp lệ"
      );
      return;
    }
    if (amount > currentSeller.balance) {
      setPayoutMessage(
        isEn
          ? "Requested amount exceeds available balance."
          : "Số tiền yêu cầu vượt quá số dư khả dụng hiện tại."
      );
      return;
    }

    const success = await requestPayout(currentSeller.id, amount);
    if (success) {
      setPayoutMessage(
        isEn
          ? "Payout request submitted! Admin will verify and transfer."
          : "Đã gửi yêu cầu rút hoa hồng thành công! Admin sẽ duyệt và chuyển khoản."
      );
      setPayoutAmount("");
      await refreshSellerSession();
      setTimeout(() => setPayoutMessage(""), 5000);
    } else {
      setPayoutMessage(
        isEn
          ? "Unable to submit payout request. Please try again."
          : "Không thể gửi yêu cầu rút tiền. Vui lòng thử lại."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-950 font-sans selection:bg-zinc-900 selection:text-white">
      {/* ========================================================================= */}
      {/* ── 1. MÀN HÌNH ĐĂNG NHẬP MÃ PIN DÀNH RIÊNG CHO SELLER ───────────────────── */}
      {/* ========================================================================= */}
      {!currentSeller ? (
        <div className="min-h-[calc(100vh-80px)] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
          {/* Centered Login Card */}
          <main className="w-full max-w-md mx-auto my-auto py-4">
            <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              {/* Ảnh Con Mèo Cầm Chai Rượu & Tiêu Đề Seller */}
              <div className="text-center space-y-3">
                <div className="w-48 sm:w-56 mx-auto aspect-[504/650] flex items-center justify-center -mt-1">
                  <img
                    src="/images/mewmao-seller-box-cat.png?v=1"
                    alt="Mewmao Seller Mascot Cat"
                    loading="eager"
                    className="w-full h-full object-contain select-none drop-shadow-[0_14px_28px_rgba(0,0,0,0.08)]"
                  />
                </div>
                <div className="space-y-1.5">
                  <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-zinc-950">
                    Seller
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-600 font-normal leading-relaxed max-w-xs sm:max-w-sm mx-auto">
                    {isEn
                      ? "Enter the ambassador PIN issued by Mewmao to track bottles sold and earn commissions."
                      : "Nhập mã PIN đại lý Mewmao cấp để theo dõi doanh số chai bán và nhận hoa hồng."}
                  </p>
                </div>
              </div>

              {/* PIN Inputs */}
              <form onSubmit={handleManualLogin} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider block text-center">
                    {isEn ? "6-Digit Security PIN" : "Mã PIN 6 Chữ Số"}
                  </label>
                  <div className="flex justify-center gap-1.5 sm:gap-2.5">
                    {pinDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        type="password"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        autoFocus={index === 0}
                        onChange={(e) => handlePinChange(index, e.target.value)}
                        onKeyDown={(e) => handlePinKeyDown(index, e)}
                        className="w-10 h-13 sm:w-12 sm:h-15 text-center text-xl sm:text-2xl font-bold font-mono rounded-xl sm:rounded-2xl border border-zinc-200 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 focus:outline-none transition-all shadow-xs bg-zinc-50/50"
                      />
                    ))}
                  </div>
                </div>

                {pinError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs text-center font-medium animate-fade-in flex items-center justify-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{pinError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-mewmao-black w-full justify-center py-3 text-xs font-bold font-sans shadow-sm"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isEn ? "Confirm Login" : "Xác Nhận Đăng Nhập"}</span>
                </button>
              </form>

              {/* Đăng ký làm đối tác Seller */}
              <div className="text-center pt-3 pb-1 border-t border-zinc-100 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRegisterModalOpen(true);
                    setRegisterSuccess(false);
                    setRegisterForm({ name: "", phone: "", email: "" });
                    setRegisterError("");
                  }}
                  className="text-xs text-mewmao-orange font-bold hover:underline transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{isEn ? "Register to become a Seller Partner" : "Đăng ký làm đối tác Seller"}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Contact Admin Support */}
              <div className="text-center pt-2">
                <span className="text-[11px] text-zinc-400">
                  {isEn ? "No PIN or forgot code? " : "Chưa có mã PIN hoặc quên mã? "}
                  <a
                    href="tel:0988776655"
                    className="text-zinc-950 font-semibold hover:underline"
                  >
                    {isEn ? "Contact Mewmao Admin" : "Liên hệ Admin Mewmao"}
                  </a>
                </span>
              </div>
            </div>
          </main>

          <footer className="text-center text-xs text-zinc-400 py-3">
            © {new Date().getFullYear()} Mewmao Distillery •{" "}
            {isEn
              ? "Single-Batch Artisanal Plum Spirit"
              : "Rượu Mơ Má Đào Thủ Công Độc Bản"}
          </footer>
        </div>
      ) : (
        /* ========================================================================= */
        /* ── 2. SELLER PERSONAL DASHBOARD (FLAT APPLE MINIMALIST) ────────────────── */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* Top Sticky Header */}
          <header className="border-b border-zinc-200/80 sticky top-0 bg-white/95 backdrop-blur-md z-30">
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 h-16 flex items-center justify-between gap-4">
              {/* Brand & Seller Welcome */}
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="w-8 h-8 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-bold text-sm shadow-xs hover:bg-mewmao-orange transition-colors"
                  title={isEn ? "Back to website" : "Về website"}
                >
                  M
                </Link>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-zinc-950 tracking-tight leading-tight">
                      MEWMAO DISTILLERY
                    </span>
                    <span className="text-[10px] font-mono text-mewmao-orange font-bold uppercase hidden sm:inline">
                      / SELLER PORTAL
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 font-medium">
                    {isEn ? "Welcome, " : "Xin chào, "}
                    <strong className="text-zinc-900">{currentSeller.name}</strong>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-xs text-zinc-600 hover:text-zinc-950 transition-colors font-medium"
                >
                  <ArrowRight className="w-3 h-3 rotate-180" />
                  <span>{isEn ? "Back to Website" : "Về Website"}</span>
                </Link>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200/60 hidden lg:inline-flex">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {isEn ? "Code: " : "Mã: "}
                  <strong className="font-mono">{currentSeller.affiliateCode}</strong>
                </span>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-xs text-zinc-600 hover:text-zinc-950 transition-colors"
                  title={isEn ? "Log out from account" : "Đăng xuất khỏi tài khoản"}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span className="font-medium text-[11px]">
                    {isEn ? "Lock / Log Out" : "Khóa / Đăng Xuất"}
                  </span>
                </button>
              </div>
            </div>
          </header>

          <main className="w-full px-3 sm:px-6 lg:px-8 xl:px-12 space-y-6 sm:space-y-8 pb-20">
            {/* ── BANNER LINK AFFILIATE (CỰC KỲ NỔI BẬT & NHỚ COOKIE 30 NGÀY) ────── */}
            <div className="w-full border border-orange-200/80 rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-orange-50/80 via-white to-amber-50/50 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Sparkles className="w-4 h-4 text-mewmao-orange" />
                  <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-mewmao-orange font-bold">
                    {isEn
                      ? "Personal Affiliate Referral Link"
                      : "ĐƯỜNG LINK GIỚI THIỆU AFFILIATE CÁ NHÂN"}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/80 px-2 py-0.5 rounded-full">
                    {isEn ? "✓ 30-Day Auto Cookie" : "✓ Cookie Tự Động 30 Ngày"}
                  </span>
                </div>

                {/* QR / Stats Quick badge */}
                <div className="shrink-0 flex items-center gap-2 self-start sm:self-center">
                  <span className="px-3 py-1.5 rounded-xl bg-white border border-orange-200 text-xs font-mono font-bold text-zinc-800 shadow-xs">
                    {isEn ? "Security PIN: " : "Mã PIN: "}
                    <strong className="text-mewmao-orange">{currentSeller.pin || "123456"}</strong>
                  </span>
                </div>
              </div>

              {/* Full URL & Copy Action */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-xl bg-white border border-orange-200 text-xs font-mono shadow-xs">
                <span className="text-zinc-600 truncate flex-1 px-2 select-all">
                  {affiliateUrl}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-sans font-bold transition-all shadow-xs ${
                      copiedLink
                        ? "bg-emerald-600 text-white"
                        : "bg-zinc-900 hover:bg-black text-white"
                    }`}
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>{isEn ? "Copied!" : "Đã Sao Chép!"}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{isEn ? "Copy Link" : "Sao Chép Link"}</span>
                      </>
                    )}
                  </button>

                  <a
                    href={affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-xs font-sans text-zinc-700 transition-colors"
                    title={isEn ? "Open in new tab to test buyer view" : "Mở tab mới xem giao diện website khi khách vào link"}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{isEn ? "Test Link" : "Mở Thử"}</span>
                  </a>
                </div>
              </div>

              {/* Ô Mã Affiliate Riêng * (Khách có thể nhập trực tiếp khi đặt hàng) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-xl bg-white border border-orange-200 text-xs shadow-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-600 font-bold">
                    {isEn ? "Personal Affiliate Code *:" : "Mã Affiliate Riêng *:"}
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-orange-50 border border-orange-200/80 text-mewmao-orange font-mono font-bold text-sm tracking-wider shadow-2xs">
                    {currentSeller.affiliateCode}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-normal">
                    {isEn ? "(Customers can enter this code at checkout)" : "(Khách có thể nhập mã này khi mua hàng)"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-sans font-bold transition-all shadow-xs shrink-0 ${
                    copiedCode
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200"
                  }`}
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{isEn ? "Copied Code!" : "Đã Chép Mã!"}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isEn ? "Copy Code" : "Sao Chép Mã"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* ── 1. DẢI CHỈ SỐ DOANH SỐ & HOA HỒNG (TRỌNG TÂM YÊU CẦU CỦA USER) ──── */}
            <div className="w-full border border-zinc-200/80 rounded-2xl p-4 sm:p-6 bg-white shadow-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-zinc-100">
                {/* 1. Số Chai Rượu Đã Bán */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Wine className="w-4 h-4 text-mewmao-orange" />
                    <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
                      {isEn ? "Bottles Sold" : "Số Chai Đã Bán"}
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 font-mono">
                    {totalBottlesSold}{" "}
                    <span className="text-sm font-normal text-zinc-500 font-sans">
                      {isEn ? "bottles" : "chai"}
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-medium block">
                    ✓ {currentSeller.ordersCount || sellerOrders.length}{" "}
                    {isEn ? "orders via link" : "đơn hàng qua link"}
                  </span>
                </div>

                {/* 2. Tổng Hoa Hồng Đã Kiếm */}
                <div className="space-y-1 pt-4 sm:pt-0 sm:pl-6">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
                      {isEn ? "Total Commission" : "Tổng Hoa Hồng Tích Lũy"}
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-600 font-mono">
                    {formatPrice(totalCommissionEarned)}
                  </div>
                  <span className="text-[11px] text-zinc-500 font-medium block">
                    {isEn
                      ? `${Math.round(currentSeller.commissionRate * 100)}% commission rate`
                      : `Tỷ lệ ${Math.round(currentSeller.commissionRate * 100)}% doanh thu`}
                  </span>
                </div>

                {/* 3. Số Dư Khả Dụng Có Thể Rút */}
                <div className="space-y-1 pt-4 sm:pt-0 sm:pl-6">
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-mewmao-orange" />
                    <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
                      {isEn ? "Available Balance" : "Số Dư Khả Dụng"}
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 font-mono">
                    {formatPrice(currentSeller.balance)}
                  </div>
                  <span className="text-[11px] text-mewmao-orange font-medium block">
                    {isEn ? "Available for withdrawal" : "Sẵn sàng rút về tài khoản"}
                  </span>
                </div>

                {/* 4. Đã Thanh Toán / Đã Rút */}
                <div className="space-y-1 pt-4 sm:pt-0 sm:pl-6">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
                      {isEn ? "Total Paid Out" : "Đã Được Thanh Toán"}
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-700 font-mono">
                    {formatPrice(currentSeller.totalWithdrawn)}
                  </div>
                  <span className="text-[11px] text-zinc-500 font-medium block">
                    {isEn ? "Transferred by Admin" : "Admin đã chuyển khoản"}
                  </span>
                </div>
              </div>
            </div>

            {/* ── 2. DANH SÁCH ĐƠN HÀNG CỦA KHÁCH MUA QUA LINK CỦA SELLER ─────────── */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h3 className="font-bold text-base text-zinc-950 flex items-center gap-2">
                    <span>
                      {isEn
                        ? "Orders Recorded Via Your Link"
                        : "Đơn Hàng Ghi Nhận Qua Link Của Bạn"}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-xs font-mono font-bold text-zinc-700">
                      {sellerOrders.length}
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {isEn
                      ? "List of customers who ordered Mewmao spirit through your affiliate link"
                      : "Danh sách khách hàng đặt mua rượu Mewmao qua đường link affiliate của bạn"}
                  </p>
                </div>

                {/* Chuyển đổi hiển thị trên Điện thoại: Thẻ / Bảng */}
                <div className="flex sm:hidden items-center gap-0.5 border border-zinc-200 rounded-lg p-0.5 bg-zinc-100 text-[10px] self-start font-mono">
                  <button
                    type="button"
                    onClick={() => setMobileLayout("card")}
                    className={`px-2 py-0.5 rounded ${
                      mobileLayout === "card"
                        ? "bg-white text-zinc-950 font-bold shadow-xs"
                        : "text-zinc-500"
                    }`}
                  >
                    {isEn ? "Cards" : "Thẻ"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileLayout("table")}
                    className={`px-2 py-0.5 rounded ${
                      mobileLayout === "table"
                        ? "bg-white text-zinc-950 font-bold shadow-xs"
                        : "text-zinc-500"
                    }`}
                  >
                    {isEn ? "Table" : "Bảng"}
                  </button>
                </div>
              </div>

              {/* Khi chưa có đơn hàng nào */}
              {sellerOrders.length === 0 ? (
                <div className="border border-dashed border-zinc-200 rounded-2xl p-10 text-center bg-white space-y-3">
                  <div className="w-12 h-12 rounded-full bg-orange-50 text-mewmao-orange flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-zinc-900">
                      {isEn ? "No Orders Yet" : "Chưa Có Đơn Hàng Mới"}
                    </h4>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                      {isEn
                        ? "Share your affiliate link on social media or send it to friends to receive your first order!"
                        : "Hãy chia sẻ đường link affiliate của bạn lên mạng xã hội hoặc gửi cho bạn bè để nhận đơn hàng đầu tiên!"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="btn-mewmao-black text-xs py-2 px-4 mx-auto"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{isEn ? "Copy Link Now" : "Sao Chép Link Ngay"}</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* 1. Dạng Thẻ trên Điện Thoại (Tối ưu vuốt chạm) */}
                  <div
                    className={`space-y-3 ${
                      mobileLayout === "table" ? "hidden" : "block sm:hidden"
                    }`}
                  >
                    {sellerOrders.map((ord) => {
                      const totalBottles = ord.items.reduce(
                        (s, i) => s + i.quantity,
                        0
                      );
                      return (
                        <div
                          key={ord.id}
                          className="border border-zinc-200/80 rounded-2xl p-4 bg-white shadow-xs space-y-3"
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs text-zinc-950">
                                {ord.id}
                              </span>
                              <span className="text-[10px] text-zinc-400 font-mono">
                                {ord.createdAt}
                              </span>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                ord.status === "delivered"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : ord.status === "shipping"
                                  ? "bg-blue-50 text-blue-700"
                                  : ord.status === "confirmed"
                                  ? "bg-purple-50 text-purple-700"
                                  : ord.status === "cancelled"
                                  ? "bg-red-50 text-red-600"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {ord.status === "delivered"
                                ? isEn
                                  ? "Delivered"
                                  : "Đã giao thành công"
                                : ord.status === "shipping"
                                ? isEn
                                  ? "In Transit"
                                  : "Đang giao hàng"
                                : ord.status === "confirmed"
                                ? isEn
                                  ? "Confirmed"
                                  : "Đã xác nhận"
                                : ord.status === "cancelled"
                                ? isEn
                                  ? "Cancelled"
                                  : "Đã hủy"
                                : isEn
                                ? "Processing"
                                : "Chờ xử lý"}
                            </span>
                          </div>

                          <div className="flex items-start justify-between text-xs">
                            <div className="space-y-0.5">
                              <span className="font-medium text-zinc-900 block">
                                {isEn ? "Customer: " : "Khách: "}
                                {ord.customerName}
                              </span>
                              <span className="text-[11px] text-zinc-500 font-mono block">
                                {ord.customerPhone.slice(0, 4)}***{ord.customerPhone.slice(-3)}
                              </span>
                            </div>

                            <div className="text-right space-y-0.5">
                              <span className="font-bold text-zinc-950 font-mono block">
                                {totalBottles} {isEn ? "bottles" : "chai"} •{" "}
                                {formatPrice(ord.totalAmount)}
                              </span>
                              <span className="text-[10px] text-zinc-400 font-mono block">
                                {ord.paymentMethod === "vietqr"
                                  ? isEn
                                    ? "VietQR (Paid)"
                                    : "VietQR (Đã trả)"
                                  : "COD"}
                              </span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                            <span className="text-[11px] text-zinc-500">
                              {isEn ? "Commission earned:" : "Hoa hồng bạn nhận:"}
                            </span>
                            <span className="text-sm font-bold font-mono text-emerald-600">
                              +{formatPrice(ord.sellerCommission)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 2. Dạng Bảng Dàn Rộng cho Máy Tính & Màn hình lớn */}
                  <div
                    className={`overflow-x-auto border border-zinc-200/80 rounded-2xl bg-white shadow-xs w-full ${
                      mobileLayout === "table" ? "block" : "hidden sm:block"
                    }`}
                  >
                    <table className="w-full min-w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-200 bg-zinc-50/70 text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
                          <th className="py-3 px-4 whitespace-nowrap">
                            {isEn ? "Order ID" : "Mã Đơn"}
                          </th>
                          <th className="py-3 px-4 whitespace-nowrap">
                            {isEn ? "Date & Time" : "Thời Gian Đặt"}
                          </th>
                          <th className="py-3 px-4 whitespace-nowrap">
                            {isEn ? "Customer" : "Tên Khách Hàng"}
                          </th>
                          <th className="py-3 px-4 whitespace-nowrap">
                            {isEn ? "Bottles" : "Số Chai Rượu"}
                          </th>
                          <th className="py-3 px-4 whitespace-nowrap">
                            {isEn ? "Order Total" : "Tổng Tiền Đơn"}
                          </th>
                          <th className="py-3 px-4 whitespace-nowrap">
                            {isEn ? "Payment" : "Thanh Toán"}
                          </th>
                          <th className="py-3 px-4 whitespace-nowrap font-bold text-emerald-700">
                            {isEn ? "Commission" : "Hoa Hồng Nhận Lại"}
                          </th>
                          <th className="py-3 px-4 whitespace-nowrap text-right">
                            {isEn ? "Order Status" : "Trạng Thái Đơn"}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {sellerOrders.map((ord) => {
                          const totalBottles = ord.items.reduce(
                            (s, i) => s + i.quantity,
                            0
                          );
                          return (
                            <tr
                              key={ord.id}
                              className="hover:bg-zinc-50/60 transition-colors"
                            >
                              <td className="py-3.5 px-4 font-mono font-bold text-zinc-950 whitespace-nowrap">
                                {ord.id}
                              </td>
                              <td className="py-3.5 px-4 font-mono text-zinc-500 text-[11px] whitespace-nowrap">
                                {ord.createdAt}
                              </td>
                              <td className="py-3.5 px-4 font-medium text-zinc-900 whitespace-nowrap">
                                {ord.customerName}
                                <span className="block text-[10px] font-mono text-zinc-400">
                                  {ord.customerPhone.slice(0, 4)}***{ord.customerPhone.slice(-3)}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 font-bold text-zinc-900 whitespace-nowrap">
                                {totalBottles} {isEn ? "bottles (500ml)" : "chai (500ml)"}
                              </td>
                              <td className="py-3.5 px-4 font-bold text-zinc-950 whitespace-nowrap font-mono">
                                {formatPrice(ord.totalAmount)}
                              </td>
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    ord.paymentMethod === "vietqr"
                                      ? "bg-blue-50 text-blue-700"
                                      : "bg-zinc-100 text-zinc-700"
                                  }`}
                                >
                                  {ord.paymentMethod === "vietqr"
                                    ? "VietQR"
                                    : "COD"}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 font-mono text-emerald-600 font-bold whitespace-nowrap text-sm">
                                +{formatPrice(ord.sellerCommission)}
                              </td>
                              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                                    ord.status === "delivered"
                                      ? "bg-emerald-50 text-emerald-800"
                                      : ord.status === "shipping"
                                      ? "bg-blue-50 text-blue-800"
                                      : ord.status === "confirmed"
                                      ? "bg-purple-50 text-purple-800"
                                      : ord.status === "cancelled"
                                      ? "bg-red-50 text-red-700"
                                      : "bg-amber-50 text-amber-800"
                                  }`}
                                >
                                  {ord.status === "delivered"
                                    ? isEn
                                      ? "✓ Delivered"
                                      : "✓ Đã giao thành công"
                                    : ord.status === "shipping"
                                    ? isEn
                                      ? "• In Transit"
                                      : "• Đang giao hàng"
                                    : ord.status === "confirmed"
                                    ? isEn
                                      ? "• Confirmed"
                                      : "• Đã xác nhận"
                                    : ord.status === "cancelled"
                                    ? isEn
                                      ? "✕ Cancelled"
                                      : "✕ Đã hủy"
                                    : isEn
                                    ? "• Processing"
                                    : "• Chờ xử lý"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* ── 3. KHU VỰC TÀI KHOẢN NGÂN HÀNG & RÚT TIỀN HOA HỒNG ───────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Thẻ Thông Tin Ngân Hàng Đã Đăng Ký */}
              <div className="border border-zinc-200/80 rounded-2xl p-5 sm:p-6 bg-white shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-zinc-100">
                  <Building className="w-4 h-4 text-zinc-700" />
                  <h4 className="font-bold text-sm text-zinc-950">
                    {isEn
                      ? "Registered Payout Bank Account"
                      : "Tài Khoản Ngân Hàng Nhận Hoa Hồng"}
                  </h4>
                </div>

                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/60 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">{isEn ? "Bank:" : "Ngân hàng:"}</span>
                    <strong className="text-zinc-900 font-mono text-sm">
                      {currentSeller.bankInfo.bankName}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">{isEn ? "Account No.:" : "Số tài khoản:"}</span>
                    <strong className="text-zinc-950 font-mono text-sm tracking-wider">
                      {currentSeller.bankInfo.accountNumber}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">{isEn ? "Account Name:" : "Chủ tài khoản:"}</span>
                    <strong className="text-zinc-900 uppercase">
                      {currentSeller.bankInfo.accountHolder}
                    </strong>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
                  {isEn
                    ? "* To update your payout bank account, please contact Admin via verified channels for secure processing."
                    : "* Để thay đổi số tài khoản ngân hàng nhận tiền, vui lòng liên hệ Admin qua kênh hỗ trợ để được cập nhật an toàn."}
                </p>
              </div>

              {/* Form Yêu Cầu Rút Hoa Hồng */}
              <div className="border border-zinc-200/80 rounded-2xl p-5 sm:p-6 bg-white shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-mewmao-orange" />
                    <h4 className="font-bold text-sm text-zinc-950">
                      {isEn ? "Request Commission Payout" : "Yêu Cầu Rút Hoa Hồng"}
                    </h4>
                  </div>
                  <span className="text-xs text-zinc-500 font-mono">
                    {isEn ? "Available: " : "Khả dụng: "}
                    <strong>{formatPrice(currentSeller.balance)}</strong>
                  </span>
                </div>

                <form onSubmit={handleRequestPayout} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-600 block">
                      {isEn
                        ? "Withdrawal Amount (VNĐ):"
                        : "Số tiền muốn rút (VNĐ):"}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={100000}
                        max={currentSeller.balance}
                        value={payoutAmount}
                        onChange={(e) => setPayoutAmount(e.target.value)}
                        placeholder={isEn ? "e.g. 500000" : "VD: 500000"}
                        className="flex-1 px-3 py-2 rounded-xl border border-zinc-200 text-xs font-mono font-bold focus:border-zinc-950 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setPayoutAmount(currentSeller.balance.toString())}
                        className="px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-semibold text-zinc-700 transition-colors"
                      >
                        {isEn ? "All" : "Rút hết"}
                      </button>
                    </div>
                  </div>

                  {payoutMessage && (
                    <div
                      className={`p-3 rounded-xl text-xs text-center font-medium ${
                        payoutMessage.includes("thành công") ||
                        payoutMessage.includes("submitted")
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-600 border border-red-200"
                      }`}
                    >
                      {payoutMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={currentSeller.balance <= 0}
                    className="btn-mewmao-black w-full justify-center py-2.5 text-xs font-bold font-sans disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {isEn
                        ? "Submit Bank Payout Request"
                        : "Gửi Yêu Cầu Rút Tiền Về Ngân Hàng"}
                    </span>
                  </button>
                </form>

                {/* Lịch sử yêu cầu rút gần đây */}
                {sellerPayouts.length > 0 && (
                  <div className="pt-2 border-t border-zinc-100 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
                      {isEn ? "Recent Payout Requests" : "Lịch Sử Yêu Cầu Rút Tiền"}
                    </span>
                    <div className="space-y-1.5">
                      {sellerPayouts.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-zinc-50 border border-zinc-100"
                        >
                          <div className="space-y-0.5">
                            <span className="font-mono font-bold text-zinc-900 block">
                              {formatPrice(p.amount)}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono block">
                              {isEn ? `Date ${p.requestedAt}` : `Ngày ${p.requestedAt}`}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.status === "completed"
                                ? "bg-emerald-50 text-emerald-700"
                                : p.status === "rejected"
                                ? "bg-red-50 text-red-600"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {p.status === "completed"
                              ? isEn
                                ? "✓ Transferred"
                                : "✓ Đã chuyển"
                              : p.status === "rejected"
                              ? isEn
                                ? "✕ Rejected"
                                : "✕ Đã từ chối"
                              : isEn
                              ? "• Pending Approval"
                              : "• Chờ Admin duyệt"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      )}

      {/* ── MODAL: ĐĂNG KÝ LÀM ĐỐI TÁC SELLER ── */}
      {registerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-white rounded-3xl max-w-sm sm:max-w-md w-full p-6 sm:p-8 shadow-2xl relative space-y-5 border border-zinc-100">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-zinc-100">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-mewmao-orange font-bold">
                  MEWMAO DISTILLERY
                </div>
                <h3 className="text-base sm:text-lg font-bold text-zinc-950 mt-0.5">
                  {isEn ? "Seller Partner Registration" : "Đăng Ký Làm Đối Tác Seller"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRegisterModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!registerSuccess ? (
              <form onSubmit={handleRegisterSeller} className="space-y-4">
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {isEn
                    ? "Fill in your details below to register as a Mewmao Seller Partner. Our team will verify and activate your account."
                    : "Điền thông tin của bạn bên dưới để đăng ký làm đối tác Đại Sứ Mewmao. Đội ngũ quản trị sẽ liên hệ và duyệt kích hoạt tài khoản của bạn."}
                </p>

                {/* 1. Họ và Tên Seller * */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-700 block">
                    {isEn ? "Full Name *" : "Họ và Tên Seller *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    placeholder={isEn ? "e.g. John Doe" : "VD: Nguyễn Văn A"}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs sm:text-sm focus:outline-none focus:border-zinc-950 transition-colors bg-white"
                  />
                </div>

                {/* 2. Số Điện Thoại * */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-700 block">
                    {isEn ? "Phone Number *" : "Số Điện Thoại *"}
                  </label>
                  <input
                    type="tel"
                    required
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    placeholder={isEn ? "e.g. 0988 888 888" : "VD: 0988 888 888"}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs sm:text-sm focus:outline-none focus:border-zinc-950 transition-colors bg-white"
                  />
                </div>

                {/* 3. Email * */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-700 block">
                    {isEn ? "Email *" : "Email *"}
                  </label>
                  <input
                    type="email"
                    required
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    placeholder={isEn ? "e.g. seller@example.com" : "VD: seller@mewmao.vn"}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs sm:text-sm focus:outline-none focus:border-zinc-950 transition-colors bg-white"
                  />
                </div>

                {registerError && (
                  <p className="text-xs text-rose-600 font-medium">{registerError}</p>
                )}

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRegisterModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 text-xs font-medium transition-colors"
                  >
                    {isEn ? "Cancel" : "Hủy Bỏ"}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingRegister}
                    className="btn-mewmao-black flex-1 sm:flex-initial px-6 py-2.5 text-xs font-bold shadow-md hover:scale-[1.02] active:scale-98 transition-all disabled:opacity-50"
                  >
                    {isSubmittingRegister
                      ? (isEn ? "Submitting..." : "Đang gửi...")
                      : (isEn ? "Submit Registration" : "Gửi Đăng Ký Đối Tác")}
                  </button>
                </div>
              </form>
            ) : (
              /* THÔNG BÁO SAU KHI ĐĂNG KÝ XONG */
              <div className="text-center py-4 space-y-4 animate-fade-in">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-xs">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-base sm:text-lg font-bold text-zinc-950">
                    {isEn ? "Registration Submitted Successfully!" : "Đăng Ký Đối Tác Thành Công!"}
                  </h4>
                  <p className="text-sm font-semibold text-mewmao-orange">
                    {isEn
                      ? "Mewmao will contact you as soon as possible."
                      : "Mewmao sẽ liên hệ với lại với bạn sớm nhất."}
                  </p>
                  <p className="text-xs text-zinc-500 leading-relaxed pt-1">
                    {isEn
                      ? "Your account is awaiting Admin approval. Once approved, you will receive your personal Affiliate code and PIN to access the Seller Portal."
                      : "Hồ sơ của bạn đang được Admin xem xét và kích hoạt. Sau khi được duyệt, bạn sẽ nhận được mã Affiliate và mã PIN để bắt đầu bán hàng và theo dõi hoa hồng."}
                  </p>
                </div>
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => setRegisterModalOpen(false)}
                    className="btn-mewmao-black w-full justify-center py-3 text-xs font-bold"
                  >
                    {isEn ? "Done / Close" : "Đã Hiểu / Hoàn Tất"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
