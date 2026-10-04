"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { OrderStatus, Seller, Order } from "@/types";
import {
  Lock,
  Unlock,
  KeyRound,
  Download,
  Printer,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  Package,
  TrendingUp,
  Users,
  CreditCard,
  Building2,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Search,
  X,
  RefreshCw,
  Percent,
  Tag,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Phone,
  Mail,
  User,
  ShoppingBag,
  Send,
  MessageSquare,
} from "lucide-react";

export default function AdminPage() {
  const {
    sellers,
    orders,
    updateOrderStatus,
    deleteOrder,
    refreshData,
    payouts,
    approvePayout,
    addSeller,
    deleteSeller,
    updateSeller,
    product,
    updateStock,
    b2bInquiries,
  } = useStore();

  // ── REFRESH & LIVE SYNC STATES ──
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>("");
  const [isDeletingOrder, setIsDeletingOrder] = useState<string | null>(null);

  // ── 1. PIN 6 SỐ BẢO MẬT (/admin) ──
  const MASTER_PIN = process.env.NEXT_PUBLIC_MASTER_ADMIN_PIN || "241091";
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [pinDigits, setPinDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [pinError, setPinError] = useState<string>("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPin = sessionStorage.getItem("mewmao_admin_session_unlocked");
      if (savedPin === "true") {
        setIsUnlocked(true);
      }
    }
  }, []);

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pinDigits];
    newPin[index] = value;
    setPinDigits(newPin);
    setPinError("");

    // Auto move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // If all 6 digits entered, verify automatically
    const fullPin = newPin.join("");
    if (fullPin.length === 6) {
      if (fullPin === MASTER_PIN) {
        setIsUnlocked(true);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("mewmao_admin_session_unlocked", "true");
        }
      } else {
        setPinError("Mã PIN không đúng. Vui lòng thử lại.");
        setTimeout(() => {
          setPinDigits(["", "", "", "", "", ""]);
          inputRefs.current[0]?.focus();
        }, 600);
      }
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pinDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    setPinDigits(["", "", "", "", "", ""]);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("mewmao_admin_session_unlocked");
    }
  };

  // ── MANUAL & AUTO SYNC WITH SUPABASE ──
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    const now = new Date();
    setLastRefreshedAt(
      `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`
    );
    setTimeout(() => setIsRefreshing(false), 400);
  };

  useEffect(() => {
    if (!isUnlocked) return;
    handleManualRefresh();
    const interval = setInterval(() => {
      refreshData();
    }, 15000);
    return () => clearInterval(interval);
  }, [isUnlocked]);

  const handleDeleteOrder = async (orderId: string, customerName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn đơn hàng ${orderId} của khách "${customerName}" khỏi hệ thống?`)) {
      setIsDeletingOrder(orderId);
      const success = await deleteOrder(orderId);
      setIsDeletingOrder(null);
      if (!success) {
        alert("Có lỗi khi xóa đơn hàng. Vui lòng thử lại!");
      }
    }
  };

  // ── 2. NAVIGATION TABS ──
  const [activeTab, setActiveTab] = useState<"overview" | "sellers" | "customers" | "inventory" | "payouts" | "b2b">("overview");

  // ── 3. SEARCH & FILTERS ──
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [sellerSearchQuery, setSellerSearchQuery] = useState<string>("");

  const [viewingSeller, setViewingSeller] = useState<Seller | null>(null);
  const [copiedSellerId, setCopiedSellerId] = useState<string | null>(null);
  const [mobileLayout, setMobileLayout] = useState<"card" | "table">("card");

  // ── 5. MODAL CREATE / EDIT SELLER ──
  const [sellerModalOpen, setSellerModalOpen] = useState(false);
  const [editingSellerId, setEditingSellerId] = useState<string | null>(null);
  const [commissionAmountInput, setCommissionAmountInput] = useState<string>("");
  const [sellerStatusFilter, setSellerStatusFilter] = useState<"all" | "pending" | "active">("all");
  const [sellerForm, setSellerForm] = useState<{
    name: string;
    email: string;
    phone: string;
    affiliateCode: string;
    pin: string;
    status: "active" | "pending" | "inactive";
    commissionRate: number;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  }>({
    name: "",
    email: "",
    phone: "",
    affiliateCode: "",
    pin: "123456",
    status: "active",
    commissionRate: 15,
    bankName: "",
    accountNumber: "",
    accountHolder: "",
  });
  const [autoNotifySeller, setAutoNotifySeller] = useState(true);
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [copiedSmsText, setCopiedSmsText] = useState(false);
  const [notificationResultModal, setNotificationResultModal] = useState<{
    open: boolean;
    sellerName: string;
    email: string;
    phone: string;
    affiliateCode: string;
    pin: string;
    emailSent: boolean;
    emailError?: string | null;
    emailWarning?: string | null;
    smsText: string;
    zaloShareUrl?: string | null;
    smsUri?: string | null;
  } | null>(null);

  // ── 6. MODAL PRINT PACKING SLIP ──
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);

  // ── 7. INVENTORY QUICK ADJUST ──
  const [stockInput, setStockInput] = useState<number>(product.stock);

  useEffect(() => {
    setStockInput(product.stock);
  }, [product.stock]);

  // Calculations
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalBottlesSold = orders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
    0
  );
  const totalCommissionsPaid = orders.reduce(
    (sum, o) => sum + (o.sellerCommission || 0),
    0
  );
  const pendingOrdersCount = orders.filter((o) => o.status === "pending").length;

  // Filter Orders
  const filteredOrders = orders.filter((o) => {
    const matchStatus = orderStatusFilter === "all" || o.status === orderStatusFilter;
    const q = orderSearchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      o.id.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.includes(q) ||
      (o.affiliateCode && o.affiliateCode.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  // Filter Sellers
  const pendingSellersCount = sellers.filter((s) => s.status === "pending").length;
  const filteredSellers = sellers.filter((s) => {
    const q = sellerSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.affiliateCode.toLowerCase().includes(q) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      (s.phone && s.phone.includes(q));

    const matchesStatus =
      sellerStatusFilter === "all" ||
      (sellerStatusFilter === "pending" && s.status === "pending") ||
      (sellerStatusFilter === "active" && s.status !== "pending");

    return matchesSearch && matchesStatus;
  });

  // ── EXPORT EXCEL (CSV UTF-8 BOM) ──
  const handleExportCSV = () => {
    const headers = [
      "Mã Đơn",
      "Ngày Đặt",
      "Tên Khách Hàng",
      "Số Điện Thoại",
      "Địa Chỉ",
      "Số Chai",
      "Tổng Tiền (VNĐ)",
      "Hình Thức Thanh Toán",
      "Trạng Thái",
      "Người Giới Thiệu (Seller)",
      "Hoa Hồng Seller (VNĐ)",
      "Ghi Chú",
    ];

    const rows = orders.map((o) => {
      const bottleQty = o.items.reduce((sum, item) => sum + item.quantity, 0);
      return [
        `"${o.id}"`,
        `"${o.createdAt}"`,
        `"${o.customerName}"`,
        `"${o.customerPhone}"`,
        `"${(o.customerAddress || "").replace(/"/g, '""')}"`,
        bottleQty,
        o.totalAmount,
        o.paymentMethod === "vietqr" ? "VietQR" : "COD",
        o.status,
        `"${o.affiliateCode || "Trực tiếp"}"`,
        o.sellerCommission,
        `"${(o.customerNote || "").replace(/"/g, '""')}"`,
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Mewmao_DonHang_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── AFFILIATE LINK HELPERS ──
  const origin = typeof window !== "undefined" ? window.location.origin : "https://mewmao.com";

  const handleCopySellerLink = (affiliateCode: string, sellerId: string) => {
    const link = `${origin}/?ref=${affiliateCode}`;
    navigator.clipboard.writeText(link);
    setCopiedSellerId(sellerId);
    setTimeout(() => setCopiedSellerId(null), 2000);
  };

  // ── SAVE SELLER ──
  const handleOpenCreateSeller = () => {
    setEditingSellerId(null);
    const defaultRate = 15;
    const defaultAmount = Math.round(product.price * (defaultRate / 100));
    setSellerForm({
      name: "",
      email: "",
      phone: "",
      affiliateCode: "",
      pin: Math.floor(100000 + Math.random() * 900000).toString(),
      status: "active",
      commissionRate: defaultRate,
      bankName: "",
      accountNumber: "",
      accountHolder: "",
    });
    setCommissionAmountInput(defaultAmount.toLocaleString("vi-VN"));
    setSellerModalOpen(true);
  };

  const handleOpenEditSeller = (seller: Seller, forceApprove = false) => {
    setEditingSellerId(seller.id);
    const ratePercent = Number((seller.commissionRate * 100).toFixed(1));
    const amountVal = Math.round(product.price * seller.commissionRate);
    setSellerForm({
      name: seller.name,
      email: seller.email,
      phone: seller.phone || "",
      affiliateCode: seller.affiliateCode,
      pin: seller.pin || "123456",
      status: forceApprove ? "active" : (seller.status || "active"),
      commissionRate: ratePercent,
      bankName: seller.bankInfo.bankName,
      accountNumber: seller.bankInfo.accountNumber,
      accountHolder: seller.bankInfo.accountHolder,
    });
    setCommissionAmountInput(amountVal > 0 ? amountVal.toLocaleString("vi-VN") : "");
    setSellerModalOpen(true);
  };

  const handleCommissionPercentChange = (valStr: string) => {
    if (valStr === "") {
      setSellerForm((prev) => ({ ...prev, commissionRate: 0 }));
      setCommissionAmountInput("");
      return;
    }
    const val = parseFloat(valStr);
    if (!isNaN(val)) {
      setSellerForm((prev) => ({ ...prev, commissionRate: val }));
      const calculatedAmount = Math.round(product.price * (val / 100));
      setCommissionAmountInput(calculatedAmount > 0 ? calculatedAmount.toLocaleString("vi-VN") : "0");
    }
  };

  const handleCommissionAmountChange = (valStr: string) => {
    const rawNumberStr = valStr.replace(/\D/g, "");
    if (!rawNumberStr) {
      setCommissionAmountInput("");
      setSellerForm((prev) => ({ ...prev, commissionRate: 0 }));
      return;
    }
    const num = parseInt(rawNumberStr, 10);
    setCommissionAmountInput(num.toLocaleString("vi-VN"));
    if (product.price > 0) {
      const calculatedPercent = Number(((num / product.price) * 100).toFixed(1));
      setSellerForm((prev) => ({ ...prev, commissionRate: calculatedPercent }));
    }
  };

  const handleSendSellerNotification = async (
    payload: {
      name: string;
      email?: string;
      phone?: string;
      affiliateCode: string;
      pin: string;
      commissionRatePercent?: number;
      commissionAmount?: number;
    },
    showModal = true
  ) => {
    setIsSendingNotification(true);
    try {
      const originUrl = typeof window !== "undefined" ? window.location.origin : "https://www.mewmao.com";
      const ratePct = payload.commissionRatePercent ?? 15;
      const amount = payload.commissionAmount ?? Math.round(product.price * (ratePct / 100));

      const res = await fetch("/api/notify-seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          affiliateCode: payload.affiliateCode,
          refLink: `${originUrl}/?ref=${payload.affiliateCode}`,
          pin: payload.pin,
          commissionRatePercent: ratePct,
          commissionAmountPerBottle: amount,
        }),
      });

      const data = await res.json();
      if (showModal) {
        setNotificationResultModal({
          open: true,
          sellerName: payload.name,
          email: payload.email || "",
          phone: payload.phone || "",
          affiliateCode: payload.affiliateCode,
          pin: payload.pin,
          emailSent: !!data.emailSent,
          emailError: data.emailError,
          emailWarning: data.emailWarning,
          smsText: data.smsText || "",
          zaloShareUrl: data.zaloShareUrl,
          smsUri: data.smsUri,
        });
      }
      return data;
    } catch (err: any) {
      console.error("Lỗi gửi thông báo cho Seller:", err);
      if (showModal) {
        alert("Lỗi khi kết nối dịch vụ gửi thông báo: " + (err.message || err));
      }
    } finally {
      setIsSendingNotification(false);
    }
  };

  const handleSaveSeller = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerForm.name.trim()) {
      alert("Vui lòng nhập họ và tên Seller");
      return;
    }

    const sellerPin = sellerForm.pin.trim() || Math.floor(1000 + Math.random() * 9000).toString();
    const finalAffiliateCode = sellerForm.affiliateCode.trim().toUpperCase() ||
      sellerForm.name
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase()
        .slice(0, 8) ||
      `SELLER${Math.floor(100 + Math.random() * 900)}`;

    const finalStatus = sellerForm.status === "pending" ? "active" : (sellerForm.status || "active");

    if (editingSellerId) {
      updateSeller(editingSellerId, {
        name: sellerForm.name.trim(),
        email: sellerForm.email.trim(),
        phone: sellerForm.phone.trim(),
        affiliateCode: finalAffiliateCode,
        pin: sellerPin,
        status: finalStatus,
        commissionRate: Number(sellerForm.commissionRate) / 100,
        promoDiscountPerBottle: 0,
        bankInfo: {
          bankName: sellerForm.bankName,
          accountNumber: sellerForm.accountNumber,
          accountHolder: sellerForm.accountHolder.toUpperCase(),
        },
      });
    } else {
      addSeller({
        name: sellerForm.name.trim(),
        email: sellerForm.email.trim(),
        phone: sellerForm.phone.trim(),
        affiliateCode: finalAffiliateCode,
        pin: sellerPin,
        status: finalStatus,
        commissionRate: Number(sellerForm.commissionRate) / 100,
        promoDiscountPerBottle: 0,
        bankInfo: {
          bankName: sellerForm.bankName,
          accountNumber: sellerForm.accountNumber,
          accountHolder: sellerForm.accountHolder.toUpperCase(),
        },
      });
    }

    setSellerModalOpen(false);

    // Tự động gửi Email & chuẩn bị tin nhắn SMS cho Seller ngay khi lưu
    if (autoNotifySeller && (sellerForm.email.trim() || sellerForm.phone.trim())) {
      handleSendSellerNotification(
        {
          name: sellerForm.name.trim(),
          email: sellerForm.email.trim(),
          phone: sellerForm.phone.trim(),
          affiliateCode: finalAffiliateCode,
          pin: sellerPin,
          commissionRatePercent: Number(sellerForm.commissionRate),
          commissionAmount: Math.round(product.price * (Number(sellerForm.commissionRate) / 100)),
        },
        true
      );
    }
  };

  const handleDeleteSeller = async (sellerId: string, sellerName: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn Seller "${sellerName}" khỏi hệ thống?`)) {
      const success = await deleteSeller(sellerId);
      if (viewingSeller?.id === sellerId) {
        setViewingSeller(null);
      }
      if (!success) {
        alert("Có lỗi khi xóa Seller. Vui lòng thử lại!");
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-950 font-sans selection:bg-zinc-900 selection:text-white">
      
      {/* ── SECURITY PIN GATE SCREEN (PIN: 6 SỐ) ── */}
      {!isUnlocked ? (
        <main className="min-h-[85vh] flex items-center justify-center p-4">
          <div className="max-w-sm w-full text-center space-y-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-100 border border-zinc-200/80 flex items-center justify-center shadow-xs">
              <KeyRound className="w-6 h-6 text-mewmao-orange" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-mewmao-orange font-bold block">
                BẢO MẬT QUẢN TRỊ /ADMIN
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
                Nhập Mã PIN 6 Số
              </h1>
              <p className="text-xs text-zinc-500 font-light">
                Hệ thống yêu cầu mã xác thực 6 số của xưởng để truy cập quyền Admin
              </p>
            </div>

            {/* 6 Digit PIN Inputs */}
            <div className="flex justify-center items-center gap-2 pt-2">
              {pinDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handlePinKeyDown(index, e)}
                  autoFocus={index === 0}
                  className={`w-11 h-13 text-center text-xl font-mono font-bold rounded-xl border transition-all ${
                    digit
                      ? "border-zinc-950 bg-zinc-50 text-zinc-950 ring-1 ring-zinc-950"
                      : "border-zinc-300 bg-white text-zinc-900 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
                  }`}
                />
              ))}
            </div>

            {pinError && (
              <p className="text-xs text-red-500 font-mono animate-fade-in">
                {pinError}
              </p>
            )}

            <button
              type="button"
              onClick={() => {
                const fullPin = pinDigits.join("");
                if (fullPin === MASTER_PIN) {
                  setIsUnlocked(true);
                  if (typeof window !== "undefined") {
                    sessionStorage.setItem("mewmao_admin_session_unlocked", "true");
                  }
                } else {
                  setPinError("Mã PIN không đúng. Vui lòng thử lại.");
                }
              }}
              className="btn-mewmao-black w-full justify-center py-3 text-xs font-bold font-sans"
            >
              Mở Khóa Quản Trị
            </button>
          </div>
        </main>
      ) : (
        /* ========================================================================= */
        /* ── MAIN ADMIN PORTAL (FLAT APPLE MINIMALIST - FONT PLUS JAKARTA SANS) ──   */
        /* ========================================================================= */
        <div className="space-y-6">
          
          {/* Header Bar */}
          <header className="border-b border-zinc-200/80 sticky top-0 bg-white/95 backdrop-blur-md z-30">
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 h-16 flex items-center justify-between gap-4">
              
              {/* Brand Title */}
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="w-8 h-8 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-bold text-sm shadow-xs hover:bg-mewmao-orange transition-colors"
                  title="Về trang chủ website"
                >
                  M
                </Link>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-zinc-950 tracking-tight leading-tight">
                      MEWMAO DISTILLERY
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase hidden md:inline">
                      / ADMIN
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400">
                    Trung Tâm Quản Trị Hệ Thống
                  </span>
                </div>
              </div>

              {/* Status & Lock Button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-xs text-zinc-700 hover:text-zinc-950 transition-colors font-medium cursor-pointer"
                  title="Đồng bộ dữ liệu thời gian thực từ Supabase"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-mewmao-orange" : "text-zinc-500"}`} />
                  <span>{isRefreshing ? "Đang đồng bộ..." : "Đồng bộ"}</span>
                  {lastRefreshedAt && (
                    <span className="text-[10px] text-zinc-400 font-mono hidden md:inline">({lastRefreshedAt})</span>
                  )}
                </button>

                <Link
                  href="/"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-xs text-zinc-600 hover:text-zinc-950 transition-colors font-medium"
                >
                  <ArrowRight className="w-3 h-3 rotate-180" />
                  <span>Về Website</span>
                </Link>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200/60 hidden lg:inline-flex">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Đã Xác Thực Admin
                </span>

                <button
                  type="button"
                  onClick={handleLock}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-xs text-zinc-600 hover:text-zinc-950 transition-colors"
                  title="Khóa bảo mật Admin"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span className="font-medium text-[11px]">Khóa Lại</span>
                </button>
              </div>

            </div>
          </header>

          <main className="w-full px-3 sm:px-6 lg:px-8 xl:px-12 space-y-6 sm:space-y-8 pb-20">
            
            {/* ── 1. FLAT METRICS STRIP (DÀN RỘNG TOÀN DIỆN & TỐI ƯU MOBILE) ── */}
            <div className="w-full border border-zinc-200/80 rounded-2xl p-4 sm:p-6 bg-white shadow-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6 divide-y sm:divide-y-0 lg:divide-x divide-zinc-100">
                
                {/* Tổng Doanh Thu */}
                <div className="space-y-1">
                  <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold block">
                    Tổng Doanh Thu Web
                  </span>
                  <div className="text-2xl font-bold tracking-tight text-zinc-950">
                    {totalRevenue.toLocaleString("vi-VN")}₫
                  </div>
                  <span className="text-[11px] text-emerald-600 font-medium">
                    ✓ {orders.length} đơn đặt hàng
                  </span>
                </div>

                {/* Số Chai Xuất Xưởng */}
                <div className="space-y-1 pt-4 lg:pt-0 lg:pl-6">
                  <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold block">
                    Số Chai Đã Bán
                  </span>
                  <div className="text-2xl font-bold tracking-tight text-zinc-950">
                    {totalBottlesSold} <span className="text-xs font-normal text-zinc-500">chai</span>
                  </div>
                  <span className="text-[11px] text-zinc-500">
                    Mewmao Mơ 500ml
                  </span>
                </div>

                {/* Tồn Kho */}
                <div className="space-y-1 pt-4 lg:pt-0 lg:pl-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
                      Tồn Kho Mẻ Rượu
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab("inventory")}
                      className="text-[11px] text-mewmao-orange hover:underline font-semibold"
                    >
                      + Nhập mẻ
                    </button>
                  </div>
                  <div className="text-2xl font-bold tracking-tight text-zinc-950">
                    {product.stock} <span className="text-xs font-normal text-zinc-500">chai</span>
                  </div>
                  <span className="text-[11px] text-zinc-500">
                    Tự động trừ khi có đơn
                  </span>
                </div>

                {/* Hoa Hồng Trả Seller */}
                <div className="space-y-1 pt-4 lg:pt-0 lg:pl-6">
                  <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold block">
                    Hoa Hồng Seller
                  </span>
                  <div className="text-2xl font-bold tracking-tight text-mewmao-orange">
                    {totalCommissionsPaid.toLocaleString("vi-VN")}₫
                  </div>
                  <span className="text-[11px] text-zinc-500">
                    {sellers.length} đại sứ đang bán
                  </span>
                </div>

                {/* Đơn Chờ Xử Lý */}
                <div className="space-y-1 pt-4 lg:pt-0 lg:pl-6 col-span-2 lg:col-span-1">
                  <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold block">
                    Đơn Cần Giao
                  </span>
                  <div className="text-2xl font-bold tracking-tight text-amber-600">
                    {pendingOrdersCount} <span className="text-xs font-normal text-zinc-500">đơn</span>
                  </div>
                  <span className="text-[11px] text-zinc-500">
                    Chờ đóng gói & xuất kho
                  </span>
                </div>

              </div>
            </div>

            {/* ── 2. FLAT TAB NAVIGATION ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-3">
              <nav className="flex items-center gap-6 overflow-x-auto text-xs uppercase tracking-wider font-semibold pb-1">
                
                <button
                  type="button"
                  onClick={() => { setActiveTab("overview"); setViewingSeller(null); }}
                  className={`py-1 transition-colors whitespace-nowrap ${
                    activeTab === "overview" && !viewingSeller
                      ? "text-zinc-950 font-bold border-b-2 border-zinc-950"
                      : "text-zinc-400 hover:text-zinc-800"
                  }`}
                >
                  Tổng Doanh Thu ({totalRevenue.toLocaleString("vi-VN")}₫)
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab("customers"); setViewingSeller(null); }}
                  className={`py-1 transition-colors whitespace-nowrap ${
                    activeTab === "customers"
                      ? "text-zinc-950 font-bold border-b-2 border-zinc-950"
                      : "text-zinc-400 hover:text-zinc-800"
                  }`}
                >
                  Danh Sách Khách Hàng Đã Mua ({orders.length})
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab("sellers"); }}
                  className={`py-1 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === "sellers"
                      ? "text-zinc-950 font-bold border-b-2 border-zinc-950"
                      : "text-zinc-400 hover:text-zinc-800"
                  }`}
                >
                  <span>Dashboard Seller & Users ({sellers.length})</span>
                  {pendingSellersCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold animate-pulse">
                      {pendingSellersCount} chờ duyệt
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab("inventory"); setViewingSeller(null); }}
                  className={`py-1 transition-colors whitespace-nowrap ${
                    activeTab === "inventory"
                      ? "text-zinc-950 font-bold border-b-2 border-zinc-950"
                      : "text-zinc-400 hover:text-zinc-800"
                  }`}
                >
                  Kho Rượu ({product.stock} chai)
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab("payouts"); setViewingSeller(null); }}
                  className={`py-1 transition-colors whitespace-nowrap ${
                    activeTab === "payouts"
                      ? "text-zinc-950 font-bold border-b-2 border-zinc-950"
                      : "text-zinc-400 hover:text-zinc-800"
                  }`}
                >
                  Duyệt Rút Tiền ({payouts.filter((p) => p.status === "pending").length})
                </button>
              </nav>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-xs font-semibold text-zinc-700 transition-colors whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Xuất File Excel</span>
                </button>

                {activeTab === "sellers" && (
                  <button
                    type="button"
                    onClick={handleOpenCreateSeller}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-black text-white text-xs font-bold transition-colors whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Thêm Seller Mới</span>
                  </button>
                )}
              </div>
            </div>

            {/* ── TAB CONTENT: OVERVIEW (BẢNG DASBOARD TỔNG DOANH THU & KÊNH BÁN) ── */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                
                {/* Revenue Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Doanh thu theo nguồn bán */}
                  <div className="border border-zinc-200/80 rounded-2xl p-6 bg-white shadow-xs space-y-4">
                    <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
                      Phân Bổ Nguồn Doanh Thu
                    </h3>

                    <div className="space-y-3">
                      {/* Qua Đại Sứ Seller */}
                      {(() => {
                        const sellerOrdersList = orders.filter((o) => !!o.affiliateCode);
                        const sellerRevenue = sellerOrdersList.reduce((s, o) => s + o.totalAmount, 0);
                        const sellerBottles = sellerOrdersList.reduce((s, o) => s + o.items.reduce((sum, i) => sum + i.quantity, 0), 0);
                        const sellerPercent = totalRevenue > 0 ? Math.round((sellerRevenue / totalRevenue) * 100) : 0;
                        
                        return (
                          <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-100 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-zinc-900">Qua Mạng Lưới Seller (Affiliate)</span>
                              <span className="font-bold text-mewmao-orange">{sellerPercent}% doanh số</span>
                            </div>
                            <div className="text-xl font-bold text-zinc-950">
                              {sellerRevenue.toLocaleString("vi-VN")}₫
                            </div>
                            <div className="flex justify-between text-[11px] text-zinc-500">
                              <span>Số đơn: {sellerOrdersList.length} đơn</span>
                              <span>Số chai bán: {sellerBottles} chai</span>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Trực tiếp qua Website */}
                      {(() => {
                        const directOrders = orders.filter((o) => !o.affiliateCode);
                        const directRevenue = directOrders.reduce((s, o) => s + o.totalAmount, 0);
                        const directBottles = directOrders.reduce((s, o) => s + o.items.reduce((sum, i) => sum + i.quantity, 0), 0);
                        const directPercent = totalRevenue > 0 ? 100 - (Math.round((orders.filter((o) => !!o.affiliateCode).reduce((s, o) => s + o.totalAmount, 0) / totalRevenue) * 100)) : 0;
                        
                        return (
                          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-zinc-900">Trực Tiếp Qua Website</span>
                              <span className="font-bold text-zinc-600">{directPercent}% doanh số</span>
                            </div>
                            <div className="text-xl font-bold text-zinc-950">
                              {directRevenue.toLocaleString("vi-VN")}₫
                            </div>
                            <div className="flex justify-between text-[11px] text-zinc-500">
                              <span>Số đơn: {directOrders.length} đơn</span>
                              <span>Số chai bán: {directBottles} chai</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Top Sellers Performance */}
                  <div className="border border-zinc-200/80 rounded-2xl p-6 bg-white shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
                        Top Seller Bán Chạy Nhất
                      </h3>
                      <button
                        type="button"
                        onClick={() => setActiveTab("sellers")}
                        className="text-xs text-mewmao-orange hover:underline font-semibold"
                      >
                        Xem tất cả ({sellers.length}) →
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {[...sellers]
                        .sort((a, b) => (b.bottlesSoldCount || 0) - (a.bottlesSoldCount || 0))
                        .slice(0, 4)
                        .map((s, idx) => (
                          <div
                            key={s.id}
                            className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 hover:bg-zinc-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-600">
                                #{idx + 1}
                              </span>
                              <div>
                                <h4 className="font-bold text-xs text-zinc-900">{s.name}</h4>
                                <span className="text-[11px] font-mono text-mewmao-orange font-semibold">
                                  Mã: {s.affiliateCode}
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-sm font-bold text-zinc-950 block">
                                {s.bottlesSoldCount || 0} chai
                              </span>
                              <span className="text-[11px] text-zinc-400">
                                {s.totalEarned.toLocaleString("vi-VN")}₫ hoa hồng
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                </div>

                {/* Đơn hàng mới nhất */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
                      Đơn Hàng Gần Đây
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab("customers")}
                      className="text-xs text-mewmao-orange hover:underline font-semibold"
                    >
                      Xem toàn bộ danh sách khách hàng ({orders.length}) →
                    </button>
                  </div>

                  {/* Mobile Recent Orders Cards */}
                  <div className="space-y-3 sm:hidden">
                    {orders.slice(0, 5).map((ord) => (
                      <div key={ord.id} className="border border-zinc-200/80 rounded-2xl p-3.5 bg-white shadow-xs space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-bold text-zinc-950">{ord.id}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.status === "delivered"
                              ? "bg-emerald-50 text-emerald-700"
                              : ord.status === "shipping"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-amber-50 text-amber-700"
                          }`}>
                            {ord.status === "delivered" ? "Đã giao" : ord.status === "shipping" ? "Đang giao" : "Chờ xử lý"}
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between text-xs">
                          <span className="font-bold text-zinc-900">{ord.customerName}</span>
                          <span className="font-mono text-zinc-500">{ord.customerPhone}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-zinc-100 text-xs">
                          <span className="font-bold text-zinc-950 font-mono">
                            {ord.items.reduce((s, i) => s + i.quantity, 0)} chai • {ord.totalAmount.toLocaleString("vi-VN")}₫
                          </span>
                          <span className="text-[11px] text-zinc-500">
                            {ord.affiliateCode ? `Mã: ${ord.affiliateCode}` : "Trực tiếp"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Wide Table */}
                  <div className="hidden sm:block overflow-x-auto border border-zinc-200/80 rounded-2xl bg-white shadow-xs w-full">
                    <table className="w-full min-w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-200 bg-zinc-50/70 text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
                          <th className="py-3 px-4 whitespace-nowrap">Mã Đơn</th>
                          <th className="py-3 px-4 whitespace-nowrap">Thời Gian</th>
                          <th className="py-3 px-4 whitespace-nowrap">Khách Hàng</th>
                          <th className="py-3 px-4 whitespace-nowrap">Số Điện Thoại</th>
                          <th className="py-3 px-4 whitespace-nowrap">Số Chai</th>
                          <th className="py-3 px-4 whitespace-nowrap">Tổng Tiền</th>
                          <th className="py-3 px-4 whitespace-nowrap">Thanh Toán</th>
                          <th className="py-3 px-4 whitespace-nowrap">Người Giới Thiệu</th>
                          <th className="py-3 px-4 whitespace-nowrap text-right">Trạng Thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {orders.slice(0, 5).map((ord) => (
                          <tr key={ord.id} className="hover:bg-zinc-50/60">
                            <td className="py-3 px-4 font-mono font-bold text-zinc-950 whitespace-nowrap">{ord.id}</td>
                            <td className="py-3 px-4 text-zinc-500 whitespace-nowrap text-[11px]">{ord.createdAt}</td>
                            <td className="py-3 px-4 font-medium text-zinc-900 whitespace-nowrap">{ord.customerName}</td>
                            <td className="py-3 px-4 font-mono text-zinc-600 whitespace-nowrap">{ord.customerPhone}</td>
                            <td className="py-3 px-4 font-bold text-zinc-900 whitespace-nowrap">
                              {ord.items.reduce((s, i) => s + i.quantity, 0)} chai
                            </td>
                            <td className="py-3 px-4 font-bold text-zinc-950 whitespace-nowrap">
                              {ord.totalAmount.toLocaleString("vi-VN")}₫
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                ord.paymentMethod === "vietqr" ? "bg-blue-50 text-blue-700" : "bg-zinc-100 text-zinc-700"
                              }`}>
                                {ord.paymentMethod === "vietqr" ? "VietQR (Đã trả)" : "COD"}
                              </span>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              {ord.affiliateCode ? (
                                <span className="px-2 py-0.5 rounded bg-orange-50 text-mewmao-orange font-bold text-[10px]">
                                  {ord.affiliateCode}
                                </span>
                              ) : (
                                <span className="text-zinc-400 text-[11px]">Trực tiếp</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                ord.status === "delivered"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : ord.status === "shipping"
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}>
                                {ord.status === "delivered" ? "Đã giao" : ord.status === "shipping" ? "Đang giao" : "Chờ xử lý"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* ── TAB CONTENT: CUSTOMERS (DASBOARD DANH SÁCH KHÁCH HÀNG ĐÃ CLICK MUA TRÊN WEB) ── */}
            {activeTab === "customers" && (
              <div className="space-y-4">
                
                {/* Search & Status Filters + Mobile View Toggle */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      placeholder="Tìm theo tên khách, SĐT, mã đơn, mã seller..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-zinc-950 placeholder:text-zinc-400 bg-white"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 overflow-x-auto">
                    <div className="flex items-center gap-1 text-[11px]">
                      {[
                        { key: "all", label: "Tất cả" },
                        { key: "pending", label: "Chờ xác nhận" },
                        { key: "confirmed", label: "Đã xác nhận" },
                        { key: "shipping", label: "Đang giao" },
                        { key: "delivered", label: "Đã giao" },
                        { key: "cancelled", label: "Đã hủy" },
                      ].map((st) => (
                        <button
                          key={st.key}
                          type="button"
                          onClick={() => setOrderStatusFilter(st.key)}
                          className={`px-2.5 py-1 rounded-full transition-colors whitespace-nowrap ${
                            orderStatusFilter === st.key
                              ? "bg-zinc-950 text-white font-bold"
                              : "text-zinc-500 hover:text-zinc-900 bg-zinc-100"
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>

                    {/* Chuyển đổi hiển thị trên Điện thoại: Thẻ / Bảng */}
                    <div className="flex sm:hidden items-center gap-0.5 border border-zinc-200 rounded-lg p-0.5 bg-zinc-100 text-[10px] shrink-0 font-mono">
                      <button
                        type="button"
                        onClick={() => setMobileLayout("card")}
                        className={`px-2 py-0.5 rounded ${mobileLayout === "card" ? "bg-white text-zinc-950 font-bold shadow-xs" : "text-zinc-500"}`}
                      >
                        Thẻ
                      </button>
                      <button
                        type="button"
                        onClick={() => setMobileLayout("table")}
                        className={`px-2 py-0.5 rounded ${mobileLayout === "table" ? "bg-white text-zinc-950 font-bold shadow-xs" : "text-zinc-500"}`}
                      >
                        Bảng
                      </button>
                    </div>
                  </div>
                </div>

                {/* 1. Mobile Cards List (Tối ưu cực đẹp cho màn hình điện thoại) */}
                <div className={`space-y-3 ${mobileLayout === "table" ? "hidden" : "block sm:hidden"}`}>
                  {filteredOrders.length === 0 ? (
                    <div className="py-10 text-center text-zinc-400 font-mono text-xs border border-dashed border-zinc-200 rounded-2xl">
                      Không tìm thấy khách hàng nào theo bộ lọc.
                    </div>
                  ) : (
                    filteredOrders.map((ord) => {
                      const totalBottles = ord.items.reduce((s, i) => s + i.quantity, 0);
                      return (
                        <div key={ord.id} className="border border-zinc-200/80 rounded-2xl p-4 bg-white shadow-xs space-y-3">
                          <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100">
                            <div>
                              <span className="font-mono font-bold text-xs text-zinc-950">{ord.id}</span>
                              <span className="block text-[10px] text-zinc-400 font-mono">{ord.createdAt}</span>
                            </div>
                            <select
                              value={ord.status}
                              onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                              className={`text-[11px] font-bold py-1 px-2 rounded-lg border focus:outline-none ${
                                ord.status === "delivered"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : ord.status === "shipping"
                                  ? "bg-blue-50 text-blue-800 border-blue-200"
                                  : ord.status === "confirmed"
                                  ? "bg-purple-50 text-purple-800 border-purple-200"
                                  : ord.status === "cancelled"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-amber-50 text-amber-800 border-amber-200"
                              }`}
                            >
                              <option value="pending">Chờ xác nhận</option>
                              <option value="confirmed">Đã xác nhận</option>
                              <option value="shipping">Đang giao</option>
                              <option value="delivered">Đã giao</option>
                              <option value="cancelled">Đã hủy</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-sm text-zinc-950">{ord.customerName}</h4>
                              <a
                                href={`tel:${ord.customerPhone}`}
                                className="inline-flex items-center gap-1 text-xs font-mono font-bold text-mewmao-orange bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/60"
                              >
                                <Phone className="w-3 h-3" />
                                {ord.customerPhone}
                              </a>
                            </div>
                            <p className="text-xs text-zinc-600 leading-relaxed pt-0.5">
                              {ord.customerAddress}
                            </p>
                          </div>

                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 text-xs">
                            <div>
                              <span className="font-bold text-zinc-900">{totalBottles} chai</span>
                              <span className="mx-1 text-zinc-300">•</span>
                              <span className="font-bold text-zinc-950 font-mono text-sm">{ord.totalAmount.toLocaleString("vi-VN")}₫</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ord.paymentMethod === "vietqr" ? "bg-blue-100 text-blue-800" : "bg-zinc-200 text-zinc-800"
                            }`}>
                              {ord.paymentMethod === "vietqr" ? "VietQR (Đã trả)" : "COD (Thu tiền)"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-1 text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-zinc-400">Seller:</span>
                              {ord.affiliateCode ? (
                                <span className="px-2 py-0.5 rounded bg-orange-50 text-mewmao-orange font-bold text-[10px]">
                                  {ord.affiliateCode} (+{ord.sellerCommission.toLocaleString("vi-VN")}₫)
                                </span>
                              ) : (
                                <span className="text-zinc-400 text-[11px]">Trực tiếp</span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setPrintingOrder(ord)}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 px-2.5 py-1.5 rounded-lg transition-colors"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>In</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteOrder(ord.id, ord.customerName)}
                                disabled={isDeletingOrder === ord.id}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors"
                                title="Xóa vĩnh viễn đơn hàng"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Xóa</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* 2. Flat Customers Wide Table (Dàn rộng toàn màn hình) */}
                <div className={`overflow-x-auto border border-zinc-200/80 rounded-2xl bg-white shadow-xs w-full ${mobileLayout === "table" ? "block" : "hidden sm:block"}`}>
                  <table className="w-full min-w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 bg-zinc-50/70 text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
                        <th className="py-3 px-4 whitespace-nowrap">Mã Đơn</th>
                        <th className="py-3 px-4 whitespace-nowrap">Ngày Giờ</th>
                        <th className="py-3 px-4 whitespace-nowrap">Khách Hàng</th>
                        <th className="py-3 px-4 whitespace-nowrap">Số Điện Thoại</th>
                        <th className="py-3 px-4 whitespace-nowrap">Địa Chỉ Nhận Hàng</th>
                        <th className="py-3 px-4 whitespace-nowrap">Số Chai</th>
                        <th className="py-3 px-4 whitespace-nowrap">Tổng Tiền</th>
                        <th className="py-3 px-4 whitespace-nowrap">Thanh Toán</th>
                        <th className="py-3 px-4 whitespace-nowrap">Người Giới Thiệu</th>
                        <th className="py-3 px-4 whitespace-nowrap">Hoa Hồng</th>
                        <th className="py-3 px-4 whitespace-nowrap">Trạng Thái Đơn</th>
                        <th className="py-3 px-4 whitespace-nowrap text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={12} className="py-12 text-center text-zinc-400 font-mono text-xs">
                            Không tìm thấy khách hàng nào theo bộ lọc.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((ord) => {
                          const totalBottles = ord.items.reduce((s, i) => s + i.quantity, 0);
                          return (
                            <tr key={ord.id} className="hover:bg-zinc-50/60 transition-colors">
                              <td className="py-3 px-4 font-mono font-bold text-zinc-950 whitespace-nowrap">
                                {ord.id}
                              </td>
                              <td className="py-3 px-4 font-mono text-zinc-500 text-[11px] whitespace-nowrap">
                                {ord.createdAt}
                              </td>
                              <td className="py-3 px-4 font-medium text-zinc-900 whitespace-nowrap">
                                {ord.customerName}
                              </td>
                              <td className="py-3 px-4 font-mono text-zinc-600 whitespace-nowrap">
                                {ord.customerPhone}
                              </td>
                              <td className="py-3 px-4 text-zinc-500 max-w-xs truncate" title={ord.customerAddress}>
                                {ord.customerAddress}
                              </td>
                              <td className="py-3 px-4 font-bold text-zinc-900 whitespace-nowrap">
                                {totalBottles} chai
                              </td>
                              <td className="py-3 px-4 font-bold text-zinc-950 whitespace-nowrap">
                                {ord.totalAmount.toLocaleString("vi-VN")}₫
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  ord.paymentMethod === "vietqr" ? "bg-blue-50 text-blue-700" : "bg-zinc-100 text-zinc-700"
                                }`}>
                                  {ord.paymentMethod === "vietqr" ? "VietQR (Đã trả)" : "COD (Thu tiền)"}
                                </span>
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                {ord.affiliateCode ? (
                                  <span className="px-2 py-0.5 rounded-md bg-orange-50 text-mewmao-orange font-bold text-[10px]">
                                    {ord.affiliateCode}
                                  </span>
                                ) : (
                                  <span className="text-zinc-400 text-[11px]">Trực tiếp</span>
                                )}
                              </td>
                              <td className="py-3 px-4 font-mono text-emerald-600 font-bold whitespace-nowrap">
                                {ord.sellerCommission > 0 ? `+${ord.sellerCommission.toLocaleString("vi-VN")}₫` : "—"}
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <select
                                  value={ord.status}
                                  onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                                  className={`text-[11px] font-semibold py-1 px-2 rounded-lg border focus:outline-none ${
                                    ord.status === "delivered"
                                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                      : ord.status === "shipping"
                                      ? "bg-blue-50 text-blue-800 border-blue-200"
                                      : ord.status === "confirmed"
                                      ? "bg-purple-50 text-purple-800 border-purple-200"
                                      : ord.status === "cancelled"
                                      ? "bg-red-50 text-red-700 border-red-200"
                                      : "bg-amber-50 text-amber-800 border-amber-200"
                                  }`}
                                >
                                  <option value="pending">Chờ xác nhận</option>
                                  <option value="confirmed">Đã xác nhận</option>
                                  <option value="shipping">Đang giao</option>
                                  <option value="delivered">Đã giao</option>
                                  <option value="cancelled">Đã hủy</option>
                                </select>
                              </td>
                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                <div className="inline-flex items-center gap-1.5 justify-end">
                                  <button
                                    type="button"
                                    onClick={() => setPrintingOrder(ord)}
                                    className="inline-flex items-center gap-1 text-[11px] text-zinc-600 hover:text-zinc-950 px-2 py-1 rounded-md hover:bg-zinc-100 transition-colors"
                                    title="In phiếu gửi hàng"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>In</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteOrder(ord.id, ord.customerName)}
                                    disabled={isDeletingOrder === ord.id}
                                    className="inline-flex items-center gap-1 text-[11px] text-red-500 hover:text-red-700 px-2 py-1 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                                    title="Xóa vĩnh viễn đơn hàng"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Xóa</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── TAB CONTENT: SELLERS (DASBOARD SELLER, USER SELLER, SỐ CHAI BÁN, PROMO DISCOUNT) ── */}
            {activeTab === "sellers" && (
              <div className="space-y-6">
                
                {/* Detail View of a specific seller if clicked */}
                {viewingSeller && (
                  <div className="p-6 rounded-2xl border border-orange-200 bg-orange-50/30 space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between pb-3 border-b border-orange-100">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-mewmao-orange font-bold">
                          DASHBOARD CHI TIẾT CỦA SELLER
                        </span>
                        <span className="font-bold text-sm text-zinc-950">— {viewingSeller.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setViewingSeller(null)}
                        className="text-xs text-zinc-500 hover:text-zinc-950"
                      >
                        ✕ Đóng xem chi tiết
                      </button>
                    </div>

                    {(() => {
                      const viewingOrders = orders.filter(
                        (o) => o.affiliateCode && o.affiliateCode.trim().toUpperCase() === viewingSeller.affiliateCode.trim().toUpperCase()
                      );
                      const viewingBottles = Math.max(
                        viewingSeller.bottlesSoldCount || 0,
                        viewingOrders.reduce((sum, o) => sum + o.items.reduce((acc, it) => acc + it.quantity, 0), 0)
                      );
                      const viewingCommission = Math.max(
                        viewingSeller.totalEarned || 0,
                        viewingOrders.reduce((sum, o) => sum + (o.sellerCommission || 0), 0)
                      );
                      const viewingBalance = Math.max(
                        viewingSeller.balance || 0,
                        viewingCommission - (viewingSeller.totalWithdrawn || 0)
                      );

                      return (
                        <>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                            <div>
                              <span className="text-zinc-400 block text-[11px]">Mã Affiliate</span>
                              <strong className="text-sm font-mono text-mewmao-orange">{viewingSeller.affiliateCode}</strong>
                            </div>
                            <div>
                              <span className="text-zinc-400 block text-[11px]">Link Giới Thiệu (Cookie 30 Ngày)</span>
                              <button
                                type="button"
                                onClick={() => handleCopySellerLink(viewingSeller.affiliateCode, viewingSeller.id)}
                                className="inline-flex items-center gap-1.5 text-xs text-mewmao-orange hover:underline font-bold mt-0.5"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                <span>{copiedSellerId === viewingSeller.id ? "Đã sao chép link!" : "Copy Link Affiliate"}</span>
                              </button>
                            </div>
                            <div>
                              <span className="text-zinc-400 block text-[11px]">Số Chai Đã Bán</span>
                              <strong className="text-sm text-zinc-950">{viewingBottles} chai</strong>
                              <span className="text-[10px] text-zinc-400 block font-mono">({viewingOrders.length} đơn phát sinh)</span>
                            </div>
                            <div>
                              <span className="text-zinc-400 block text-[11px]">Số Dư Khả Dụng</span>
                              <strong className="text-sm text-mewmao-orange font-mono">{viewingBalance.toLocaleString("vi-VN")}₫</strong>
                              <span className="text-[10px] text-zinc-400 block font-mono">Tổng tích lũy: {viewingCommission.toLocaleString("vi-VN")}₫</span>
                            </div>
                          </div>

                          {/* Orders of this seller */}
                          <div className="pt-2">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-xs font-bold text-zinc-900">
                                Đơn Hàng Phát Sinh Qua Mã Này ({viewingOrders.length} đơn):
                              </h4>
                              <span className="text-[10px] text-emerald-600 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                ✓ Nhận diện tự động qua Link & Mã Affiliate
                              </span>
                            </div>
                            <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                  <tr className="bg-zinc-50 text-[10px] uppercase text-zinc-500 border-b border-zinc-200">
                                    <th className="py-2.5 px-3">Mã Đơn</th>
                                    <th className="py-2.5 px-3">Ngày</th>
                                    <th className="py-2.5 px-3">Khách Hàng</th>
                                    <th className="py-2.5 px-3">Số Chai</th>
                                    <th className="py-2.5 px-3">Tổng Tiền</th>
                                    <th className="py-2.5 px-3">Hoa Hồng Trích</th>
                                    <th className="py-2.5 px-3">Trạng Thái</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                  {viewingOrders.length === 0 ? (
                                    <tr>
                                      <td colSpan={7} className="py-4 text-center text-zinc-400 text-xs">
                                        Chưa có đơn hàng nào phát sinh qua mã này.
                                      </td>
                                    </tr>
                                  ) : (
                                    viewingOrders.map((ord) => (
                                      <tr key={ord.id} className="hover:bg-zinc-50">
                                        <td className="py-2.5 px-3 font-mono font-bold">{ord.id}</td>
                                        <td className="py-2.5 px-3 text-zinc-500 text-[11px]">{ord.createdAt}</td>
                                        <td className="py-2.5 px-3 font-medium text-zinc-950">{ord.customerName}</td>
                                        <td className="py-2.5 px-3 font-bold">{ord.items.reduce((s, i) => s + i.quantity, 0)} chai</td>
                                        <td className="py-2.5 px-3 font-bold">{ord.totalAmount.toLocaleString("vi-VN")}₫</td>
                                        <td className="py-2.5 px-3 font-bold text-emerald-600 font-mono">+{ord.sellerCommission.toLocaleString("vi-VN")}₫</td>
                                        <td className="py-2.5 px-3">
                                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                            ord.status === "delivered"
                                              ? "bg-emerald-50 text-emerald-700"
                                              : ord.status === "shipping"
                                              ? "bg-blue-50 text-blue-700"
                                              : "bg-amber-50 text-amber-700"
                                          }`}>
                                            {ord.status === "delivered" ? "Đã giao" : ord.status === "shipping" ? "Đang giao" : "Chờ xử lý"}
                                          </span>
                                        </td>
                                      </tr>
                                    ))
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* Search Sellers + Status Filters + Mobile View Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-2 flex-1">
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        value={sellerSearchQuery}
                        onChange={(e) => setSellerSearchQuery(e.target.value)}
                        placeholder="Tìm theo tên seller, mã affiliate, SĐT..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-zinc-950 placeholder:text-zinc-400 bg-white"
                      />
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1 border border-zinc-200 rounded-xl p-1 bg-zinc-50 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSellerStatusFilter("all")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          sellerStatusFilter === "all"
                            ? "bg-white text-zinc-950 shadow-2xs font-bold"
                            : "text-zinc-500 hover:text-zinc-900"
                        }`}
                      >
                        Tất cả ({sellers.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setSellerStatusFilter("pending")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                          sellerStatusFilter === "pending"
                            ? "bg-amber-500 text-white shadow-2xs font-bold"
                            : "text-zinc-600 hover:text-zinc-950"
                        }`}
                      >
                        <span>Chờ duyệt</span>
                        {pendingSellersCount > 0 && (
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                              sellerStatusFilter === "pending"
                                ? "bg-white text-amber-600"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {pendingSellersCount}
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSellerStatusFilter("active")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          sellerStatusFilter === "active"
                            ? "bg-zinc-900 text-white shadow-2xs font-bold"
                            : "text-zinc-500 hover:text-zinc-900"
                        }`}
                      >
                        Hoạt động ({sellers.filter((s) => s.status !== "pending").length})
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <span className="text-xs text-zinc-500">
                      Tổng cộng: <strong>{sellers.length}</strong> đại sứ đang hoạt động
                    </span>

                    {/* Chuyển đổi hiển thị trên Điện thoại: Thẻ / Bảng */}
                    <div className="flex sm:hidden items-center gap-0.5 border border-zinc-200 rounded-lg p-0.5 bg-zinc-100 text-[10px] shrink-0 font-mono">
                      <button
                        type="button"
                        onClick={() => setMobileLayout("card")}
                        className={`px-2 py-0.5 rounded ${mobileLayout === "card" ? "bg-white text-zinc-950 font-bold shadow-xs" : "text-zinc-500"}`}
                      >
                        Thẻ
                      </button>
                      <button
                        type="button"
                        onClick={() => setMobileLayout("table")}
                        className={`px-2 py-0.5 rounded ${mobileLayout === "table" ? "bg-white text-zinc-950 font-bold shadow-xs" : "text-zinc-500"}`}
                      >
                        Bảng
                      </button>
                    </div>
                  </div>
                </div>

                {/* 1. Mobile Sellers Cards (Tối ưu cực đẹp cho màn hình điện thoại) */}
                <div className={`space-y-3 ${mobileLayout === "table" ? "hidden" : "block sm:hidden"}`}>
                  {filteredSellers.map((s) => {
                    const sOrders = orders.filter(
                      (o) => o.affiliateCode && o.affiliateCode.trim().toUpperCase() === s.affiliateCode.trim().toUpperCase()
                    );
                    const sBottles = Math.max(
                      s.bottlesSoldCount || 0,
                      sOrders.reduce((sum, o) => sum + o.items.reduce((acc, it) => acc + it.quantity, 0), 0)
                    );
                    const sOrdersCount = Math.max(s.ordersCount || 0, sOrders.length);
                    const sTotalEarned = Math.max(
                      s.totalEarned || 0,
                      sOrders.reduce((sum, o) => sum + (o.sellerCommission || 0), 0)
                    );
                    const sBalance = Math.max(
                      s.balance || 0,
                      sTotalEarned - (s.totalWithdrawn || 0)
                    );

                    return (
                      <div
                        key={s.id}
                        className={`border rounded-2xl p-4 shadow-xs space-y-3 transition-colors ${
                          s.status === "pending"
                            ? "bg-amber-50/40 border-amber-300/80"
                            : "bg-white border-zinc-200/80"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={() => setViewingSeller(s)}
                                className="font-bold text-sm text-zinc-950 text-left hover:text-mewmao-orange"
                              >
                                {s.name}
                              </button>
                              {s.status === "pending" ? (
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-[10px] font-bold">
                                  Chờ Duyệt
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-medium">
                                  Hoạt Động
                                </span>
                              )}
                            </div>
                            {s.phone && (
                              <a href={`tel:${s.phone}`} className="text-xs font-mono text-zinc-500 block">
                                {s.phone}
                              </a>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-800 font-mono font-bold text-xs" title="Mã PIN đăng nhập cổng /seller">
                              PIN: {s.pin || "1234"}
                            </span>
                            <span className="px-2.5 py-1 rounded-md bg-orange-50 border border-orange-200 text-mewmao-orange font-mono font-bold text-xs">
                              {s.affiliateCode}
                            </span>
                          </div>
                        </div>

                        {/* Link Giới Thiệu & Nút Copy */}
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 border border-zinc-200/60 text-xs font-mono">
                          <span className="text-zinc-600 truncate flex-1 text-[11px]">
                            /?ref={s.affiliateCode}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopySellerLink(s.affiliateCode, s.id)}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all shrink-0 ${
                              copiedSellerId === s.id
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-zinc-900 text-white hover:bg-black"
                            }`}
                          >
                            {copiedSellerId === s.id ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Đã chép!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* 4 Chỉ số */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 rounded-xl bg-zinc-50">
                            <span className="text-[10px] uppercase text-zinc-400 font-semibold block">Đã Bán</span>
                            <span className="font-bold text-sm text-zinc-950 font-mono">{sBottles} chai</span>
                            <span className="text-[10px] text-zinc-400 block font-mono">({sOrdersCount} đơn • {s.clicksCount} clicks)</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-zinc-50">
                            <span className="text-[10px] uppercase text-zinc-400 font-semibold block">Hoa Hồng ({Math.round(s.commissionRate * 100)}%)</span>
                            <span className="font-bold text-sm text-mewmao-orange font-mono">{sBalance.toLocaleString("vi-VN")}₫</span>
                            <span className="text-[10px] text-zinc-400 block font-mono">Tổng: {sTotalEarned.toLocaleString("vi-VN")}₫</span>
                          </div>
                        </div>

                        <div className="text-[11px] text-zinc-500 font-mono pt-1 border-t border-zinc-100 flex items-center justify-between gap-2 flex-wrap">
                          <span className="truncate max-w-[180px]">{s.bankInfo.bankName || "Chưa cập nhật NH"}</span>
                          <div className="flex items-center gap-1 shrink-0 ml-auto">
                            {s.status === "pending" ? (
                              <button
                                type="button"
                                onClick={() => handleOpenEditSeller(s, true)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-2xs inline-flex items-center gap-1 active:scale-95 transition-all"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Duyệt Ngay</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setViewingSeller(s)}
                                className="px-2 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-[11px] font-semibold text-zinc-700"
                              >
                                Xem số liệu
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                handleSendSellerNotification({
                                  name: s.name,
                                  email: s.email,
                                  phone: s.phone,
                                  affiliateCode: s.affiliateCode,
                                  pin: s.pin || "123456",
                                  commissionRatePercent: Math.round(s.commissionRate * 100),
                                  commissionAmount: Math.round(product.price * s.commissionRate),
                                })
                              }
                              className="p-1.5 rounded hover:bg-orange-50 text-zinc-600 hover:text-mewmao-orange"
                              title="Gửi Email & Tin nhắn SMS/Zalo cho Seller"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditSeller(s)}
                              className="p-1.5 rounded hover:bg-zinc-100 text-zinc-600"
                              title="Chỉnh sửa thông tin"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSeller(s.id, s.name)}
                              className="p-1.5 rounded hover:bg-red-50 text-zinc-400 hover:text-red-600"
                              title="Xóa Seller"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 2. Flat Sellers Wide Table (Dàn rộng tối đa cho máy tính) */}
                <div className={`overflow-x-auto border border-zinc-200/80 rounded-2xl bg-white shadow-xs w-full ${mobileLayout === "table" ? "block" : "hidden sm:block"}`}>
                  <table className="w-full min-w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 bg-zinc-50/70 text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
                        <th className="py-3 px-4 whitespace-nowrap">Tên User Seller</th>
                        <th className="py-3 px-4 whitespace-nowrap">Mã Affiliate</th>
                        <th className="py-3 px-4 whitespace-nowrap">Mã PIN (/seller)</th>
                        <th className="py-3 px-4 whitespace-nowrap">Link Giới Thiệu (Cookie 30 Ngày)</th>
                        <th className="py-3 px-4 whitespace-nowrap">Hoa Hồng (%)</th>
                        <th className="py-3 px-4 whitespace-nowrap">Số Chai Bán Được</th>
                        <th className="py-3 px-4 whitespace-nowrap">Số Đơn Hàng</th>
                        <th className="py-3 px-4 whitespace-nowrap">Lượt Clicks</th>
                        <th className="py-3 px-4 whitespace-nowrap">Tổng Hoa Hồng</th>
                        <th className="py-3 px-4 whitespace-nowrap">Số Dư Khả Dụng</th>
                        <th className="py-3 px-4 whitespace-nowrap">Tài Khoản Ngân Hàng</th>
                        <th className="py-3 px-4 whitespace-nowrap text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {filteredSellers.map((s) => {
                        const sOrders = orders.filter(
                          (o) => o.affiliateCode && o.affiliateCode.trim().toUpperCase() === s.affiliateCode.trim().toUpperCase()
                        );
                        const sBottles = Math.max(
                          s.bottlesSoldCount || 0,
                          sOrders.reduce((sum, o) => sum + o.items.reduce((acc, it) => acc + it.quantity, 0), 0)
                        );
                        const sOrdersCount = Math.max(s.ordersCount || 0, sOrders.length);
                        const sTotalEarned = Math.max(
                          s.totalEarned || 0,
                          sOrders.reduce((sum, o) => sum + (o.sellerCommission || 0), 0)
                        );
                        const sBalance = Math.max(
                          s.balance || 0,
                          sTotalEarned - (s.totalWithdrawn || 0)
                        );

                        return (
                          <tr
                            key={s.id}
                            className={`transition-colors ${
                              s.status === "pending"
                                ? "bg-amber-50/30 hover:bg-amber-50/60"
                                : "hover:bg-zinc-50/60"
                            }`}
                          >
                            
                            {/* Tên Seller & Trạng Thái */}
                            <td className="py-3.5 px-4 font-bold text-zinc-950 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setViewingSeller(s)}
                                  className="text-left hover:text-mewmao-orange hover:underline font-bold"
                                >
                                  {s.name}
                                </button>
                                {s.status === "pending" ? (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-[10px] font-bold shrink-0">
                                    Chờ Duyệt
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-medium shrink-0">
                                    Hoạt Động
                                  </span>
                                )}
                              </div>
                              {s.phone && (
                                <span className="block text-[11px] font-mono font-normal text-zinc-400">
                                  {s.phone}
                                </span>
                              )}
                            </td>

                            {/* Mã Affiliate */}
                            <td className="py-3.5 px-4 font-mono font-bold whitespace-nowrap">
                              <span className="px-2.5 py-1 rounded-md bg-orange-50 border border-orange-200/60 text-mewmao-orange text-xs">
                                {s.affiliateCode}
                              </span>
                            </td>

                            {/* Mã PIN Đăng nhập (/seller) */}
                            <td className="py-3.5 px-4 font-mono font-bold whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-mono">
                                PIN: {s.pin || "1234"}
                              </span>
                            </td>

                            {/* Link Giới Thiệu (Cookie 30 Ngày) */}
                            <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs">
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 text-[11px] max-w-[130px] truncate" title={`${origin}/?ref=${s.affiliateCode}`}>
                                  /?ref={s.affiliateCode}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopySellerLink(s.affiliateCode, s.id)}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-sans font-bold transition-all ${
                                    copiedSellerId === s.id
                                      ? "bg-emerald-600 text-white shadow-xs"
                                      : "bg-zinc-900 hover:bg-black text-white"
                                  }`}
                                  title="Sao chép link gửi cho khách / seller"
                                >
                                  {copiedSellerId === s.id ? (
                                    <>
                                      <Check className="w-3 h-3" />
                                      <span>Đã chép!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copy Link</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </td>

                            {/* % Hoa hồng */}
                            <td className="py-3.5 px-4 text-zinc-700 font-bold whitespace-nowrap">
                              {Math.round(s.commissionRate * 100)}%
                            </td>

                            {/* Số chai bán được */}
                            <td className="py-3.5 px-4 font-bold text-zinc-950 text-sm whitespace-nowrap">
                              {sBottles} <span className="text-xs font-normal text-zinc-500">chai</span>
                            </td>

                            {/* Số đơn */}
                            <td className="py-3.5 px-4 text-zinc-600 whitespace-nowrap">
                              {sOrdersCount} đơn
                            </td>

                            {/* Clicks */}
                            <td className="py-3.5 px-4 text-zinc-500 whitespace-nowrap">
                              {s.clicksCount} clicks
                            </td>

                            {/* Tổng kiếm được */}
                            <td className="py-3.5 px-4 font-bold text-zinc-950 whitespace-nowrap">
                              {sTotalEarned.toLocaleString("vi-VN")}₫
                            </td>

                            {/* Số dư khả dụng */}
                            <td className="py-3.5 px-4 font-bold text-mewmao-orange whitespace-nowrap">
                              {sBalance.toLocaleString("vi-VN")}₫
                            </td>

                          {/* Ngân hàng */}
                          <td className="py-3.5 px-4 text-[11px] text-zinc-500 whitespace-nowrap font-mono">
                            {s.bankInfo.bankName ? (
                              `${s.bankInfo.bankName} • ${s.bankInfo.accountNumber} (${s.bankInfo.accountHolder})`
                            ) : (
                              <span className="text-zinc-400 italic">Chưa cập nhật NH</span>
                            )}
                          </td>

                          {/* Thao tác */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {s.status === "pending" ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditSeller(s, true)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-2xs inline-flex items-center gap-1 active:scale-95 transition-all"
                                  title="Duyệt và thiết lập tài khoản Seller này"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Duyệt</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setViewingSeller(s)}
                                  className="px-2 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-[11px] text-zinc-700 font-semibold"
                                  title="Xem dashboard chi tiết"
                                >
                                  Xem số liệu
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  handleSendSellerNotification({
                                    name: s.name,
                                    email: s.email,
                                    phone: s.phone,
                                    affiliateCode: s.affiliateCode,
                                    pin: s.pin || "123456",
                                    commissionRatePercent: Math.round(s.commissionRate * 100),
                                    commissionAmount: Math.round(product.price * s.commissionRate),
                                  })
                                }
                                className="p-1.5 rounded hover:bg-orange-50 text-zinc-600 hover:text-mewmao-orange"
                                title="Gửi Email & Tin nhắn SMS/Zalo cho Seller"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEditSeller(s)}
                                className="p-1.5 rounded hover:bg-zinc-100 text-zinc-600 hover:text-zinc-950"
                                title="Chỉnh sửa thông tin"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSeller(s.id, s.name)}
                                className="p-1.5 rounded hover:bg-red-50 text-zinc-400 hover:text-red-600"
                                title="Xóa Seller"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* ── TAB CONTENT: INVENTORY (KHO RƯỢU) ── */}
            {activeTab === "inventory" && (
              <div className="border border-zinc-200/80 rounded-2xl p-6 sm:p-8 bg-white shadow-xs space-y-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-mewmao-orange font-bold block">
                    QUẢN LÝ KHO RƯỢU THỦ CÔNG
                  </span>
                  <h3 className="text-xl font-bold text-zinc-950">
                    Kho Rượu Mewmao Mơ 500ml
                  </h3>
                  <p className="text-xs text-zinc-500 font-light">
                    Mỗi khi khách đặt mua thành công trên website, hệ thống sẽ tự động trừ số lượng tương ứng trong kho hàng.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 space-y-1">
                    <span className="text-[11px] uppercase text-zinc-400 font-semibold">Tồn Kho Hiện Có</span>
                    <div className="text-3xl font-bold text-zinc-950">{product.stock} chai</div>
                    <span className="text-[11px] text-emerald-600 font-medium">Sẵn sàng xuất kho</span>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 space-y-1">
                    <span className="text-[11px] uppercase text-zinc-400 font-semibold">Đã Xuất Xưởng</span>
                    <div className="text-3xl font-bold text-zinc-950">{totalBottlesSold} chai</div>
                    <span className="text-[11px] text-zinc-500">Ghi nhận vào doanh thu</span>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 space-y-1">
                    <span className="text-[11px] uppercase text-zinc-400 font-semibold">Giá Bán Niêm Yết</span>
                    <div className="text-3xl font-bold text-zinc-950">{product.price.toLocaleString("vi-VN")}₫</div>
                    <span className="text-[11px] text-zinc-500">Đồng bộ toàn website</span>
                  </div>
                </div>

                {/* Adjust Stock Form */}
                <div className="pt-4 border-t border-zinc-100 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                    Cập Nhật Lại Số Lượng Tồn Kho
                  </h4>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="number"
                      min={0}
                      value={stockInput}
                      onChange={(e) => setStockInput(Number(e.target.value))}
                      className="w-36 px-4 py-2 text-sm font-bold rounded-xl border border-zinc-300 focus:outline-none focus:border-zinc-950"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        await updateStock(stockInput);
                        alert(`Đã lưu tồn kho mới thành công: ${stockInput} chai!`);
                      }}
                      className="btn-mewmao-black py-2 px-4 text-xs font-bold cursor-pointer"
                    >
                      Lưu Tồn Kho Mới
                    </button>

                    <div className="flex items-center gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={async () => {
                          const updated = product.stock + 50;
                          setStockInput(updated);
                          await updateStock(updated);
                        }}
                        className="px-3 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-700 cursor-pointer"
                      >
                        +50 chai mẻ mới
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const updated = product.stock + 100;
                          setStockInput(updated);
                          await updateStock(updated);
                        }}
                        className="px-3 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-700 cursor-pointer"
                      >
                        +100 chai mẻ mới
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB CONTENT: PAYOUTS (DUYỆT RÚT TIỀN HOA HỒNG) ── */}
            {activeTab === "payouts" && (
              <div className="space-y-4">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
                    Lệnh Rút Tiền Hoa Hồng Từ Đại Sứ
                  </h3>
                  <p className="text-xs text-zinc-500 font-light">
                    Chuyển khoản đến STK của Seller tương ứng, sau đó bấm Xác Nhận Đã Chuyển để hoàn tất.
                  </p>
                </div>

                {/* Mobile Payouts Cards */}
                <div className="space-y-3 sm:hidden">
                  {payouts.map((pay) => (
                    <div key={pay.id} className="border border-zinc-200/80 rounded-2xl p-4 bg-white shadow-xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs">{pay.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          pay.status === "completed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        }`}>
                          {pay.status === "completed" ? "Đã chuyển tiền" : "Chờ xử lý"}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="font-bold text-sm text-zinc-950">{pay.sellerName}</span>
                        <span className="font-bold text-sm font-mono text-mewmao-orange">{pay.amount.toLocaleString("vi-VN")}₫</span>
                      </div>
                      <div className="text-[11px] font-mono text-zinc-600 bg-zinc-50 p-2 rounded-xl border border-zinc-100">
                        {pay.bankInfo.bankName} • {pay.bankInfo.accountNumber} ({pay.bankInfo.accountHolder})
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-zinc-400 font-mono">{pay.requestedAt}</span>
                        {pay.status === "pending" && (
                          <button
                            type="button"
                            onClick={() => approvePayout(pay.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
                          >
                            Xác Nhận Đã Chuyển
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Wide Table */}
                <div className="hidden sm:block overflow-x-auto border border-zinc-200/80 rounded-2xl bg-white shadow-xs w-full">
                  <table className="w-full min-w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 bg-zinc-50/70 text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
                        <th className="py-3 px-4 whitespace-nowrap">Mã Lệnh</th>
                        <th className="py-3 px-4 whitespace-nowrap">Ngày Yêu Cầu</th>
                        <th className="py-3 px-4 whitespace-nowrap">Tên Đại Sứ</th>
                        <th className="py-3 px-4 whitespace-nowrap">Số Tiền Rút</th>
                        <th className="py-3 px-4 whitespace-nowrap">Thông Tin Nhận Tiền</th>
                        <th className="py-3 px-4 whitespace-nowrap">Trạng Thái</th>
                        <th className="py-3 px-4 whitespace-nowrap text-right">Xử Lý</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {payouts.map((pay) => (
                        <tr key={pay.id} className="hover:bg-zinc-50/60 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-zinc-950 whitespace-nowrap">{pay.id}</td>
                          <td className="py-3 px-4 text-zinc-500 text-[11px] whitespace-nowrap">{pay.requestedAt}</td>
                          <td className="py-3 px-4 font-medium text-zinc-900 whitespace-nowrap">{pay.sellerName}</td>
                          <td className="py-3 px-4 font-bold text-mewmao-orange whitespace-nowrap">
                            {pay.amount.toLocaleString("vi-VN")}₫
                          </td>
                          <td className="py-3 px-4 text-[11px] text-zinc-600 whitespace-nowrap font-mono">
                            {pay.bankInfo.bankName} • {pay.bankInfo.accountNumber} ({pay.bankInfo.accountHolder})
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              pay.status === "completed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                            }`}>
                              {pay.status === "completed" ? "Đã chuyển tiền" : "Chờ xử lý"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            {pay.status === "pending" ? (
                              <button
                                type="button"
                                onClick={() => approvePayout(pay.id)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors shadow-xs"
                              >
                                Xác Nhận Đã Chuyển
                              </button>
                            ) : (
                              <span className="text-zinc-400 text-[11px]">Hoàn tất</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </main>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ── MODAL: TẠO / SỬA SELLER ──                                             */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* ── MODAL: TẠO / SỬA SELLER (TỐI ƯU 100% CHO MOBILE & DESKTOP) ──           */}
      {/* ========================================================================= */}
      {sellerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-white rounded-t-[28px] sm:rounded-3xl max-w-lg w-full max-h-[92dvh] sm:max-h-[90vh] flex flex-col border border-zinc-200 shadow-2xl overflow-hidden">
            {/* 1. Sticky Header */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-5 sm:px-7 py-3.5 sm:py-4 border-b border-zinc-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    sellerForm.status === "pending" ? "bg-amber-500 animate-pulse" : "bg-mewmao-orange"
                  }`}
                />
                <h3 className="text-base sm:text-lg font-bold text-zinc-950">
                  {sellerForm.status === "pending"
                    ? "Duyệt & Thiết Lập Tài Khoản Seller"
                    : editingSellerId
                    ? "Chỉnh Sửa Thông Tin Seller"
                    : "Tạo Mới Seller & Cấp Mã Affiliate"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSellerModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-950 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 2. Scrollable Form Body */}
            <form onSubmit={handleSaveSeller} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto px-5 sm:px-7 py-4 sm:py-5 space-y-4 text-xs font-sans flex-1 overscroll-contain">
                {/* Banner hướng dẫn khi tài khoản đang ở trạng thái Chờ Duyệt */}
                {sellerForm.status === "pending" && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span>Hồ sơ Seller đăng ký đang chờ bạn duyệt</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Bạn có thể tùy chỉnh lại <strong>Mã Affiliate</strong>, <strong>Mã PIN</strong>, và <strong>Tỷ lệ Hoa Hồng (%)</strong> bên dưới. Bấm nút <strong>"Duyệt & Kích Hoạt Seller"</strong> ở chân modal để tài khoản chính thức hoạt động và seller có thể đăng nhập.
                    </p>
                  </div>
                )}

                {/* Trạng thái tài khoản (Status Switch) */}
                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase text-zinc-500 font-bold block">Trạng Thái Tài Khoản</span>
                    <span className="text-xs font-bold text-zinc-900">
                      {sellerForm.status === "pending" ? "Đang chờ Admin duyệt" : "Đã duyệt & Đang hoạt động"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 border border-zinc-200 rounded-xl p-1 bg-white">
                    <button
                      type="button"
                      onClick={() => setSellerForm((prev) => ({ ...prev, status: "pending" }))}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        sellerForm.status === "pending"
                          ? "bg-amber-500 text-white shadow-2xs"
                          : "text-zinc-500 hover:text-zinc-900"
                      }`}
                    >
                      Chờ Duyệt
                    </button>
                    <button
                      type="button"
                      onClick={() => setSellerForm((prev) => ({ ...prev, status: "active" }))}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        sellerForm.status !== "pending"
                          ? "bg-emerald-600 text-white shadow-2xs"
                          : "text-zinc-500 hover:text-zinc-900"
                      }`}
                    >
                      Hoạt Động
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-zinc-500 font-bold block">Họ và Tên Seller *</label>
                    <input
                      type="text"
                      required
                      value={sellerForm.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        if (!editingSellerId && !sellerForm.affiliateCode) {
                          const clean = name
                            .normalize("NFD")
                            .replace(/[\u0300-\u036f]/g, "")
                            .replace(/[^a-zA-Z0-9]/g, "")
                            .toUpperCase()
                            .slice(0, 8);
                          setSellerForm((prev) => ({ ...prev, name, affiliateCode: clean }));
                        } else {
                          setSellerForm((prev) => ({ ...prev, name }));
                        }
                      }}
                      placeholder="VD: Nguyễn Hải Đăng"
                      className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-950 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-zinc-500 font-bold block">Mã Affiliate Riêng *</label>
                    <input
                      type="text"
                      required
                      value={sellerForm.affiliateCode}
                      onChange={(e) => setSellerForm({ ...sellerForm, affiliateCode: e.target.value.toUpperCase() })}
                      placeholder="VD: HAIDANG"
                      className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-950 text-xs sm:text-sm uppercase font-mono font-bold text-mewmao-orange"
                    />
                  </div>
                </div>

                {/* Đường Link Giới Thiệu (Cookie 30 Ngày) & % Hoa Hồng */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-orange-50/70 border border-orange-200/80 space-y-3">
                  <div>
                    <label className="text-[10px] uppercase text-amber-950 font-bold block tracking-wider">
                      Đường Link Giới Thiệu (Cookie Nhận Diện 30 Ngày)
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 rounded-xl bg-white border border-orange-200 text-xs font-mono">
                    <span className="text-zinc-600 break-all select-all flex-1 text-[11px] sm:text-xs">
                      {typeof window !== "undefined" ? window.location.origin : "https://mewmao.com"}
                      /?ref=
                      <strong className="text-mewmao-orange font-bold font-mono">{sellerForm.affiliateCode || "MA_SELLER"}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const link = `${typeof window !== "undefined" ? window.location.origin : "https://mewmao.com"}/?ref=${sellerForm.affiliateCode || "MA_SELLER"}`;
                        navigator.clipboard.writeText(link);
                        alert("Đã sao chép đường link affiliate của Seller!");
                      }}
                      className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white text-[11px] font-sans font-bold shrink-0 transition-colors flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </button>
                  </div>

                  {/* Thiết lập hoa hồng 2 chiều: % ⇄ VNĐ */}
                  <div className="pt-2.5 border-t border-orange-200/60 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <label className="text-[10px] uppercase text-amber-950 font-bold block">
                        Mức Hoa Hồng Trích Cho Seller *
                      </label>
                      <span className="text-[10px] font-mono text-zinc-600 bg-white border border-orange-200/80 px-2 py-0.5 rounded-md shrink-0 shadow-2xs">
                        Giá niêm yết: <strong className="text-zinc-950">{product.price.toLocaleString("vi-VN")}₫</strong>/chai
                      </span>
                    </div>

                    {/* 2 ô nhập liệu đối chiếu song song */}
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Ô 1: Tỷ lệ phần trăm % */}
                      <div className="p-2 rounded-xl bg-white border border-orange-200/90 shadow-2xs space-y-1">
                        <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">
                          Tỷ Lệ Phần Trăm (%)
                        </span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.1"
                            min={0}
                            max={100}
                            value={sellerForm.commissionRate === 0 && commissionAmountInput === "" ? "" : sellerForm.commissionRate}
                            onChange={(e) => handleCommissionPercentChange(e.target.value)}
                            placeholder="15"
                            className="w-full px-2 py-1 rounded-lg bg-orange-50/40 text-xs sm:text-sm font-bold text-zinc-950 font-mono focus:outline-none focus:bg-orange-50 focus:ring-1 focus:ring-orange-300"
                          />
                          <span className="text-xs font-bold text-mewmao-orange font-mono px-1">%</span>
                        </div>
                      </div>

                      {/* Ô 2: Tiền VNĐ tương đương mỗi chai */}
                      <div className="p-2 rounded-xl bg-white border border-orange-200/90 shadow-2xs space-y-1">
                        <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">
                          Tiền Nhận / Chai (VNĐ)
                        </span>
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={commissionAmountInput}
                            onChange={(e) => handleCommissionAmountChange(e.target.value)}
                            placeholder="43.350"
                            className="w-full px-2 py-1 rounded-lg bg-orange-50/40 text-xs sm:text-sm font-bold text-zinc-950 font-mono focus:outline-none focus:bg-orange-50 focus:ring-1 focus:ring-orange-300"
                          />
                          <span className="text-xs font-bold text-zinc-600 font-mono px-1">₫</span>
                        </div>
                      </div>
                    </div>

                    {/* Gợi ý quy đổi nhanh (Nút bấm 1-chạm) - Tối ưu 4 ô trên 1 hàng chuẩn */}
                    <div className="space-y-1 pt-0.5">
                      <span className="text-zinc-500 text-[10px] block">Gợi ý mức nhanh:</span>
                      <div className="grid grid-cols-4 gap-1.5 font-mono text-[10px]">
                        {[10, 15, 20, 25].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => handleCommissionPercentChange(pct.toString())}
                            className={`py-1 rounded-lg border text-center transition-colors ${
                              Math.round(sellerForm.commissionRate) === pct
                                ? "bg-zinc-900 text-white font-bold border-zinc-900 shadow-2xs"
                                : "bg-white text-zinc-600 border-zinc-200 hover:border-orange-300 hover:text-zinc-900"
                            }`}
                          >
                            {pct}% ({Math.round(product.price * (pct / 100) / 1000)}k)
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mã PIN Đăng Nhập Riêng Cho Seller (/seller) */}
                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                  <label className="text-[10px] uppercase text-zinc-950 font-bold block">
                    Mã PIN Đăng Nhập Của Seller (/seller) *
                  </label>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={sellerForm.pin}
                      onChange={(e) => setSellerForm({ ...sellerForm, pin: e.target.value.replace(/\D/g, "") })}
                      placeholder="VD: 123456"
                      className="w-32 px-3 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-950 text-sm font-mono font-bold tracking-widest text-center bg-white"
                    />
                    <span className="text-[11px] text-zinc-500 font-mono">
                      (6 chữ số)
                    </span>
                  </div>
                </div>

                {/* Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-zinc-500 font-bold block">Số Điện Thoại</label>
                    <input
                      type="tel"
                      value={sellerForm.phone}
                      onChange={(e) => setSellerForm({ ...sellerForm, phone: e.target.value })}
                      placeholder="0988..."
                      className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-950 text-xs sm:text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-zinc-500 font-bold block">Email</label>
                    <input
                      type="email"
                      value={sellerForm.email}
                      onChange={(e) => setSellerForm({ ...sellerForm, email: e.target.value })}
                      placeholder="seller@mewmao.vn"
                      className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-950 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                {/* TỰ ĐỘNG GỬI EMAIL & CHUẨN BỊ TIN NHẮN CHO SELLER */}
                <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200/90 space-y-2">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoNotifySeller}
                      onChange={(e) => setAutoNotifySeller(e.target.checked)}
                      className="w-4 h-4 rounded text-mewmao-orange accent-[#FF5E00] mt-0.5 cursor-pointer shrink-0"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-zinc-950 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#FF5E00]" />
                        Tự động gửi Email & chuẩn bị tin nhắn SMS/Zalo cho Seller khi lưu
                      </span>
                      <p className="text-[11px] text-zinc-600 leading-relaxed">
                        Hệ thống sẽ gửi email kích hoạt qua Resend tới địa chỉ email trên (chứa Tên, Mã Affiliate, Link 30 ngày, Mức hoa hồng và Mã PIN đăng nhập) và chuẩn bị sẵn tin nhắn để bạn gửi qua Zalo/SMS chỉ với 1 click.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Bank Info */}
                <div className="pt-2 border-t border-zinc-100 space-y-2">
                  <span className="text-[10px] uppercase text-zinc-500 font-bold block">
                    Tài Khoản Nhận Hoa Hồng (Ngân Hàng)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={sellerForm.bankName}
                      onChange={(e) => setSellerForm({ ...sellerForm, bankName: e.target.value })}
                      placeholder="Tên ngân hàng"
                      className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-xs sm:text-sm focus:outline-none focus:border-zinc-950"
                    />
                    <input
                      type="text"
                      value={sellerForm.accountNumber}
                      onChange={(e) => setSellerForm({ ...sellerForm, accountNumber: e.target.value })}
                      placeholder="Số tài khoản"
                      className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-xs sm:text-sm font-mono focus:outline-none focus:border-zinc-950"
                    />
                    <input
                      type="text"
                      value={sellerForm.accountHolder}
                      onChange={(e) => setSellerForm({ ...sellerForm, accountHolder: e.target.value.toUpperCase() })}
                      placeholder="Chủ tài khoản"
                      className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-xs sm:text-sm uppercase font-mono focus:outline-none focus:border-zinc-950"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Sticky Footer Action Buttons */}
              <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-md px-5 sm:px-7 py-3.5 sm:py-4 border-t border-zinc-100 flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setSellerModalOpen(false)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-medium text-xs transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  onClick={() => {
                    if (sellerForm.status === "pending") {
                      setSellerForm((prev) => ({ ...prev, status: "active" }));
                    }
                  }}
                  className={`flex-1 sm:flex-initial justify-center px-6 py-2.5 text-xs font-bold shadow-md hover:scale-[1.02] active:scale-98 transition-all ${
                    sellerForm.status === "pending"
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                      : "btn-mewmao-black"
                  }`}
                >
                  {sellerForm.status === "pending"
                    ? "✓ Duyệt & Kích Hoạt Seller"
                    : editingSellerId
                    ? "Lưu Thay Đổi"
                    : "Tạo Seller Ngay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ── MODAL: IN PHIẾU GỬI HÀNG (PRINT PACKING SLIP) ──                      */}
      {/* ========================================================================= */}
      {printingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[92dvh] overflow-y-auto p-5 sm:p-8 border border-zinc-200 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-400">
                PHIẾU GỬI HÀNG MEWMAO
              </span>
              <button
                type="button"
                onClick={() => setPrintingOrder(null)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Slip */}
            <div className="space-y-4 p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-xs">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <div>
                  <h4 className="font-bold text-sm text-zinc-950">MEWMAO DISTILLERY</h4>
                  <p className="text-[10px] text-zinc-400">Hotline: 0988.776.655</p>
                </div>
                <div className="text-right">
                  <span className="font-bold font-mono text-zinc-900 block">{printingOrder.id}</span>
                  <span className="text-[10px] text-zinc-500">{printingOrder.createdAt}</span>
                </div>
              </div>

              <div className="space-y-1 py-1">
                <span className="text-[10px] uppercase text-zinc-400 block font-bold">NGƯỜI NHẬN HÀNG:</span>
                <p className="font-bold text-zinc-950 text-sm">{printingOrder.customerName}</p>
                <p className="text-zinc-700 font-bold">{printingOrder.customerPhone}</p>
                <p className="text-zinc-600 leading-relaxed text-[11px] pt-1">
                  {printingOrder.customerAddress}
                </p>
              </div>

              <div className="border-t border-zinc-200 pt-3 space-y-1">
                <div className="flex justify-between">
                  <span>Mewmao Mơ 500ml x {printingOrder.items.reduce((s, i) => s + i.quantity, 0)} chai</span>
                  <span className="font-bold">{printingOrder.totalAmount.toLocaleString("vi-VN")}₫</span>
                </div>
                {printingOrder.customerNote && (
                  <p className="text-[11px] text-zinc-500 italic pt-1">
                    Ghi chú: {printingOrder.customerNote}
                  </p>
                )}
              </div>

              <div className="border-t border-dashed border-zinc-300 pt-3 flex items-center justify-between">
                <span className="text-[11px] font-bold">HÌNH THỨC THU TIỀN:</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  printingOrder.paymentMethod === "vietqr"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {printingOrder.paymentMethod === "vietqr" ? "ĐÃ THANH TOÁN (0đ COD)" : `THU COD: ${printingOrder.totalAmount.toLocaleString("vi-VN")}₫`}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPrintingOrder(null)}
                className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 text-xs"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn-mewmao-black px-6 py-2 text-xs font-bold"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In Phiếu Này</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: KẾT QUẢ GỬI EMAIL & TÙY CHỌN GỬI ZALO / SMS ── */}
      {notificationResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92dvh] overflow-y-auto p-5 sm:p-7 border border-zinc-200 shadow-2xl space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-mewmao-orange flex items-center justify-center border border-orange-200/80">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-950">Thông Báo Kích Hoạt Seller</h3>
                  <p className="text-xs text-zinc-500">
                    Đại sứ: <strong className="text-zinc-900">{notificationResultModal.sellerName}</strong> ({notificationResultModal.affiliateCode})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotificationResultModal(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. Trạng thái Email */}
            <div className="space-y-2">
              <div className="text-[11px] uppercase tracking-wider font-bold text-zinc-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                <span>1. Trạng Thái Email (Resend)</span>
              </div>
              {notificationResultModal.email ? (
                notificationResultModal.emailSent ? (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <strong className="font-bold">Đã gửi email thành công</strong> tới <span className="font-mono font-bold">{notificationResultModal.email}</span>!
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">
                    <div className="flex items-center gap-2 font-bold">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Thông báo gửi email:</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-amber-800">
                      {notificationResultModal.emailError || "Tài khoản Resend cần thêm & xác minh domain tại resend.com/domains để gửi đến tất cả người nhận. Hiện đang thử nghiệm (chỉ gửi tới www.junky3@yahoo.com)."}
                    </p>
                  </div>
                )
              ) : (
                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-500 text-xs">
                  Seller chưa có email. Bạn có thể gửi thông tin trực tiếp qua tin nhắn Zalo / SMS bên dưới.
                </div>
              )}
            </div>

            {/* 2. Mẫu Tin Nhắn SMS / Zalo Cho Seller */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-[11px] uppercase tracking-wider font-bold text-zinc-500 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
                  <span>2. Tin Nhắn SMS & Zalo Cho Seller</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(notificationResultModal.smsText);
                    setCopiedSmsText(true);
                    setTimeout(() => setCopiedSmsText(false), 2000);
                  }}
                  className="text-xs text-mewmao-orange font-bold hover:underline flex items-center gap-1"
                >
                  {copiedSmsText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSmsText ? "Đã sao chép!" : "Sao chép tin nhắn"}
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 font-mono text-xs text-zinc-800 whitespace-pre-wrap leading-relaxed select-all">
                {notificationResultModal.smsText}
              </div>
            </div>

            {/* Action Buttons: Gửi Zalo / Gửi SMS / Xong */}
            <div className="pt-2 border-t border-zinc-100 flex flex-wrap items-center justify-end gap-2">
              {notificationResultModal.phone && (
                <>
                  <a
                    href={`https://zalo.me/${notificationResultModal.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      navigator.clipboard.writeText(notificationResultModal.smsText);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#0068FF] text-white hover:bg-[#0055d4] text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-98 transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Mở Zalo ({notificationResultModal.phone})
                  </a>

                  {notificationResultModal.smsUri && (
                    <a
                      href={notificationResultModal.smsUri}
                      className="px-4 py-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-800 text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Gửi SMS
                    </a>
                  )}
                </>
              )}

              <button
                type="button"
                onClick={() => setNotificationResultModal(null)}
                className="btn-mewmao-black px-5 py-2.5 text-xs font-bold"
              >
                Hoàn Tất
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
