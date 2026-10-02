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
  const [sellerForm, setSellerForm] = useState({
    name: "",
    email: "",
    phone: "",
    affiliateCode: "",
    pin: "123456",
    commissionRate: 15,
    bankName: "MB Bank",
    accountNumber: "",
    accountHolder: "",
  });

  // ── 6. MODAL PRINT PACKING SLIP ──
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);

  // ── 7. INVENTORY QUICK ADJUST ──
  const [stockInput, setStockInput] = useState<number>(product.stock);

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
  const filteredSellers = sellers.filter((s) => {
    const q = sellerSearchQuery.toLowerCase().trim();
    return (
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.affiliateCode.toLowerCase().includes(q) ||
      (s.phone && s.phone.includes(q))
    );
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
    setSellerForm({
      name: "",
      email: "",
      phone: "",
      affiliateCode: "",
      pin: Math.floor(100000 + Math.random() * 900000).toString(),
      commissionRate: 15,
      bankName: "MB Bank",
      accountNumber: "",
      accountHolder: "",
    });
    setSellerModalOpen(true);
  };

  const handleOpenEditSeller = (seller: Seller) => {
    setEditingSellerId(seller.id);
    setSellerForm({
      name: seller.name,
      email: seller.email,
      phone: seller.phone || "",
      affiliateCode: seller.affiliateCode,
      pin: seller.pin || "123456",
      commissionRate: Math.round(seller.commissionRate * 100),
      bankName: seller.bankInfo.bankName,
      accountNumber: seller.bankInfo.accountNumber,
      accountHolder: seller.bankInfo.accountHolder,
    });
    setSellerModalOpen(true);
  };

  const handleSaveSeller = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerForm.name.trim()) {
      alert("Vui lòng nhập họ và tên Seller");
      return;
    }

    const sellerPin = sellerForm.pin.trim() || Math.floor(1000 + Math.random() * 9000).toString();

    if (editingSellerId) {
      updateSeller(editingSellerId, {
        name: sellerForm.name.trim(),
        email: sellerForm.email.trim(),
        phone: sellerForm.phone.trim(),
        affiliateCode: sellerForm.affiliateCode.trim().toUpperCase(),
        pin: sellerPin,
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
        affiliateCode: sellerForm.affiliateCode.trim().toUpperCase(),
        pin: sellerPin,
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
  };

  const handleDeleteSeller = (sellerId: string, sellerName: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa Seller "${sellerName}" khỏi hệ thống?`)) {
      deleteSeller(sellerId);
      if (viewingSeller?.id === sellerId) {
        setViewingSeller(null);
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
                  className={`py-1 transition-colors whitespace-nowrap ${
                    activeTab === "sellers"
                      ? "text-zinc-950 font-bold border-b-2 border-zinc-950"
                      : "text-zinc-400 hover:text-zinc-800"
                  }`}
                >
                  Dashboard Seller & Users ({sellers.length})
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
                        <strong className="text-sm text-zinc-950">{viewingSeller.bottlesSoldCount || 0} chai</strong>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-[11px]">Số Dư Khả Dụng</span>
                        <strong className="text-sm text-zinc-950 font-mono">{viewingSeller.balance.toLocaleString("vi-VN")}₫</strong>
                      </div>
                    </div>

                    {/* Orders of this seller */}
                    <div className="pt-2">
                      <h4 className="text-xs font-bold text-zinc-900 mb-2">Đơn Hàng Phát Sinh Qua Mã Này:</h4>
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
                            {orders.filter((o) => o.affiliateCode?.toLowerCase() === viewingSeller.affiliateCode.toLowerCase()).length === 0 ? (
                              <tr>
                                <td colSpan={7} className="py-4 text-center text-zinc-400 text-xs">
                                  Chưa có đơn hàng nào qua mã này.
                                </td>
                              </tr>
                            ) : (
                              orders
                                .filter((o) => o.affiliateCode?.toLowerCase() === viewingSeller.affiliateCode.toLowerCase())
                                .map((ord) => (
                                  <tr key={ord.id} className="hover:bg-zinc-50">
                                    <td className="py-2.5 px-3 font-mono font-bold">{ord.id}</td>
                                    <td className="py-2.5 px-3 text-zinc-500 text-[11px]">{ord.createdAt}</td>
                                    <td className="py-2.5 px-3">{ord.customerName}</td>
                                    <td className="py-2.5 px-3 font-bold">{ord.items.reduce((s, i) => s + i.quantity, 0)} chai</td>
                                    <td className="py-2.5 px-3 font-bold">{ord.totalAmount.toLocaleString("vi-VN")}₫</td>
                                    <td className="py-2.5 px-3 font-bold text-emerald-600">+{ord.sellerCommission.toLocaleString("vi-VN")}₫</td>
                                    <td className="py-2.5 px-3">{ord.status}</td>
                                  </tr>
                                ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Search Sellers + Mobile View Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={sellerSearchQuery}
                      onChange={(e) => setSellerSearchQuery(e.target.value)}
                      placeholder="Tìm theo tên seller, mã affiliate, SĐT..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-zinc-950 placeholder:text-zinc-400 bg-white"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3">
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
                  {filteredSellers.map((s) => (
                    <div key={s.id} className="border border-zinc-200/80 rounded-2xl p-4 bg-white shadow-xs space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <button
                            type="button"
                            onClick={() => setViewingSeller(s)}
                            className="font-bold text-sm text-zinc-950 text-left hover:text-mewmao-orange"
                          >
                            {s.name}
                          </button>
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
                          <span className="font-bold text-sm text-zinc-950 font-mono">{s.bottlesSoldCount || 0} chai</span>
                          <span className="text-[10px] text-zinc-400 block">({s.ordersCount} đơn • {s.clicksCount} clicks)</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-zinc-50">
                          <span className="text-[10px] uppercase text-zinc-400 font-semibold block">Hoa Hồng ({Math.round(s.commissionRate * 100)}%)</span>
                          <span className="font-bold text-sm text-mewmao-orange font-mono">{s.balance.toLocaleString("vi-VN")}₫</span>
                          <span className="text-[10px] text-zinc-400 block">Tổng: {s.totalEarned.toLocaleString("vi-VN")}₫</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-zinc-500 font-mono pt-1 border-t border-zinc-100 flex items-center justify-between">
                        <span className="truncate max-w-[180px]">{s.bankInfo.bankName} • {s.bankInfo.accountNumber}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => setViewingSeller(s)}
                            className="px-2 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-[11px] font-semibold text-zinc-700"
                          >
                            Xem số liệu
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditSeller(s)}
                            className="p-1.5 rounded hover:bg-zinc-100 text-zinc-600"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSeller(s.id, s.name)}
                            className="p-1.5 rounded hover:bg-red-50 text-zinc-400 hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
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
                      {filteredSellers.map((s) => (
                        <tr key={s.id} className="hover:bg-zinc-50/60 transition-colors">
                          
                          {/* Tên Seller */}
                          <td className="py-3.5 px-4 font-bold text-zinc-950 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setViewingSeller(s)}
                              className="text-left hover:text-mewmao-orange hover:underline font-bold"
                            >
                              {s.name}
                            </button>
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
                            {s.bottlesSoldCount || 0} <span className="text-xs font-normal text-zinc-500">chai</span>
                          </td>

                          {/* Số đơn */}
                          <td className="py-3.5 px-4 text-zinc-600 whitespace-nowrap">
                            {s.ordersCount} đơn
                          </td>

                          {/* Clicks */}
                          <td className="py-3.5 px-4 text-zinc-500 whitespace-nowrap">
                            {s.clicksCount} clicks
                          </td>

                          {/* Tổng kiếm được */}
                          <td className="py-3.5 px-4 font-bold text-zinc-950 whitespace-nowrap">
                            {s.totalEarned.toLocaleString("vi-VN")}₫
                          </td>

                          {/* Số dư khả dụng */}
                          <td className="py-3.5 px-4 font-bold text-mewmao-orange whitespace-nowrap">
                            {s.balance.toLocaleString("vi-VN")}₫
                          </td>

                          {/* Ngân hàng */}
                          <td className="py-3.5 px-4 text-[11px] text-zinc-500 whitespace-nowrap font-mono">
                            {s.bankInfo.bankName} • {s.bankInfo.accountNumber} ({s.bankInfo.accountHolder})
                          </td>

                          {/* Thao tác */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => setViewingSeller(s)}
                                className="px-2 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-[11px] text-zinc-700 font-semibold"
                                title="Xem dashboard chi tiết"
                              >
                                Xem số liệu
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
                      ))}
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
                      onClick={() => {
                        updateStock(stockInput);
                        alert(`Đã cập nhật tồn kho thành ${stockInput} chai!`);
                      }}
                      className="btn-mewmao-black py-2 px-4 text-xs font-bold"
                    >
                      Lưu Tồn Kho Mới
                    </button>

                    <div className="flex items-center gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = product.stock + 50;
                          setStockInput(updated);
                          updateStock(updated);
                        }}
                        className="px-3 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-700"
                      >
                        +50 chai mẻ mới
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = product.stock + 100;
                          setStockInput(updated);
                          updateStock(updated);
                        }}
                        className="px-3 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-700"
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
      {sellerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-zinc-200 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="text-lg font-bold text-zinc-950">
                {editingSellerId ? "Chỉnh Sửa Thông Tin Seller" : "Tạo Mới Seller & Cấp Mã Affiliate"}
              </h3>
              <button
                type="button"
                onClick={() => setSellerModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSeller} className="space-y-4 text-xs font-sans">
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
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-950 text-xs"
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
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-950 text-xs uppercase font-mono font-bold text-mewmao-orange"
                  />
                </div>
              </div>

              {/* Đường Link Giới Thiệu (Cookie 30 Ngày) & % Hoa Hồng */}
              <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200/80 space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase text-amber-950 font-bold">
                      Đường Link Giới Thiệu (Cookie Nhận Diện 30 Ngày)
                    </label>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/70 px-2 py-0.5 rounded-full">
                      ✓ Tự động ghi nhận
                    </span>
                  </div>

                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-orange-200 text-xs font-mono">
                    <span className="text-zinc-600 truncate flex-1">
                      {typeof window !== "undefined" ? window.location.origin : "https://mewmao.com"}
                      /?ref=
                      <strong className="text-mewmao-orange">{sellerForm.affiliateCode || "MA_SELLER"}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const link = `${typeof window !== "undefined" ? window.location.origin : "https://mewmao.com"}/?ref=${sellerForm.affiliateCode || "MA_SELLER"}`;
                        navigator.clipboard.writeText(link);
                        alert("Đã sao chép đường link affiliate của Seller!");
                      }}
                      className="px-3 py-1 rounded-lg bg-zinc-900 hover:bg-black text-white text-[11px] font-sans font-bold shrink-0 transition-colors"
                    >
                      Copy Link
                    </button>
                  </div>

                  <p className="text-[11px] text-zinc-600 leading-relaxed font-light">
                    Khách hàng click vào đường link trên vào trang chủ Website, trình duyệt sẽ tự động nhớ <strong>Cookie trong 30 ngày</strong>. Khi khách hàng bấm mua hàng, hệ thống sẽ tự động nhận diện và tính doanh số cho Seller này mà khách không cần nhập mã.
                  </p>
                </div>

                <div className="pt-2 border-t border-orange-200/60 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <label className="text-[10px] uppercase text-amber-950 font-bold block">
                      % Mức Hoa Hồng Trích Cho Seller *
                    </label>
                    <span className="text-[10px] text-zinc-500 block">Tỷ lệ hoa hồng trích từ doanh thu mỗi chai bán</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={sellerForm.commissionRate}
                      onChange={(e) => setSellerForm({ ...sellerForm, commissionRate: Number(e.target.value) })}
                      placeholder="15"
                      className="w-20 px-3 py-1.5 rounded-xl border border-orange-200 focus:outline-none focus:border-zinc-950 text-xs font-bold text-center bg-white font-mono"
                    />
                    <span className="text-xs font-bold text-zinc-700">%</span>
                  </div>
                </div>
              </div>

              {/* Mã PIN Đăng Nhập Riêng Cho Seller (/seller) */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-[10px] uppercase text-zinc-950 font-bold block">
                      Mã PIN Đăng Nhập Của Seller (/seller) *
                    </label>
                    <span className="text-[10px] text-zinc-500 block">
                      Seller nhập mã PIN này để vào xem số chai đã bán & hoa hồng nhận được
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const randomPin = Math.floor(100000 + Math.random() * 900000).toString();
                      setSellerForm((prev) => ({ ...prev, pin: randomPin }));
                    }}
                    className="text-[10px] font-bold text-mewmao-orange hover:underline shrink-0"
                  >
                    Sinh PIN ngẫu nhiên
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={sellerForm.pin}
                    onChange={(e) => setSellerForm({ ...sellerForm, pin: e.target.value.replace(/\D/g, "") })}
                    placeholder="VD: 123456"
                    className="w-32 px-3 py-1.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-950 text-sm font-mono font-bold tracking-widest text-center bg-white"
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
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-950 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-zinc-500 font-bold block">Email</label>
                  <input
                    type="email"
                    value={sellerForm.email}
                    onChange={(e) => setSellerForm({ ...sellerForm, email: e.target.value })}
                    placeholder="seller@mewmao.vn"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-950 text-xs"
                  />
                </div>
              </div>

              {/* Bank Info */}
              <div className="pt-2 border-t border-zinc-100 space-y-2">
                <span className="text-[10px] uppercase text-zinc-400 font-bold block">
                  Tài Khoản Nhận Hoa Hồng (Ngân Hàng)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={sellerForm.bankName}
                    onChange={(e) => setSellerForm({ ...sellerForm, bankName: e.target.value })}
                    placeholder="Tên ngân hàng"
                    className="px-3 py-2 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-zinc-950"
                  />
                  <input
                    type="text"
                    value={sellerForm.accountNumber}
                    onChange={(e) => setSellerForm({ ...sellerForm, accountNumber: e.target.value })}
                    placeholder="Số tài khoản"
                    className="px-3 py-2 rounded-xl border border-zinc-200 text-xs font-mono focus:outline-none focus:border-zinc-950"
                  />
                  <input
                    type="text"
                    value={sellerForm.accountHolder}
                    onChange={(e) => setSellerForm({ ...sellerForm, accountHolder: e.target.value.toUpperCase() })}
                    placeholder="Chủ tài khoản"
                    className="px-3 py-2 rounded-xl border border-zinc-200 text-xs uppercase font-mono focus:outline-none focus:border-zinc-950"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setSellerModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 font-medium"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="btn-mewmao-black px-6 py-2 text-xs font-bold"
                >
                  {editingSellerId ? "Lưu Thay Đổi" : "Tạo Seller Ngay"}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-zinc-200 shadow-2xl space-y-6">
            
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

    </div>
  );
}
