"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Product,
  Order,
  Seller,
  PayoutRequest,
  B2BInquiry,
  UserRole,
  OrderStatus,
  Voucher,
} from "@/types";
import {
  SIGNATURE_PRODUCT,
  INITIAL_SELLERS,
  INITIAL_ORDERS,
  INITIAL_PAYOUTS,
  INITIAL_B2B_INQUIRIES,
} from "@/data/mockData";

import { Language, translations } from "@/data/translations";

interface StoreContextType {
  product: Product;
  cartQuantity: number;
  setCartQuantity: (qty: number) => void;
  isQuickBuyOpen: boolean;
  setIsQuickBuyOpen: (open: boolean) => void;
  isAgeVerified: boolean;
  verifyAge: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
  userRole: UserRole;
  currentSeller: Seller | null;
  setCurrentSeller: (seller: Seller | null) => void;
  switchUserRole: (role: UserRole, sellerId?: string) => void;
  activeRefCode: string | null;
  setActiveRefCode: (code: string | null) => void;
  orders: Order[];
  sellers: Seller[];
  payouts: PayoutRequest[];
  b2bInquiries: B2BInquiry[];
  vouchers: Voucher[];
  selectedVoucherCode: string | null;
  setSelectedVoucherCode: (code: string | null) => void;
  placeOrder: (data: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    customerNote?: string;
    quantity: number;
    paymentMethod: "vietqr" | "cod";
    affiliateCode?: string;
    voucherCode?: string;
    discountAmount?: number;
  }) => Promise<Order>;
  validateVoucher: (
    code: string,
    currentSubtotal: number
  ) => {
    valid: boolean;
    discountAmount: number;
    message: string;
    voucher?: Voucher;
  };
  addVoucher: (data: Omit<Voucher, "id" | "usedCount" | "createdAt">) => Promise<Voucher>;
  updateVoucher: (id: string, updates: Partial<Voucher>) => Promise<boolean>;
  deleteVoucher: (id: string) => Promise<boolean>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<boolean>;
  updatePaymentStatus: (orderId: string, status: "paid" | "unpaid") => Promise<boolean>;
  deleteOrder: (orderId: string) => Promise<boolean>;
  refreshData: () => Promise<void>;
  requestPayout: (sellerId: string, amount: number) => Promise<boolean>;
  approvePayout: (payoutId: string) => Promise<boolean>;
  addSeller: (data: {
    name: string;
    email: string;
    phone?: string;
    status?: "active" | "pending" | "inactive";
    affiliateCode?: string;
    pin?: string;
    commissionRate?: number;
    promoDiscountPerBottle?: number;
    bankInfo: {
      bankName: string;
      accountNumber: string;
      accountHolder: string;
    };
  }) => Promise<Seller>;
  registerSeller: (data: {
    name: string;
    phone: string;
    email: string;
  }) => Promise<Seller>;
  deleteSeller: (sellerId: string) => Promise<boolean>;
  updateSeller: (sellerId: string, updates: Partial<Seller>) => Promise<boolean>;
  updateStock: (newStock: number, newPrice?: number) => Promise<boolean>;
  submitB2BInquiry: (data: Omit<B2BInquiry, "id" | "status" | "createdAt">) => Promise<boolean>;
  isAudioPlaying: boolean;
  toggleAudio: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// ── COOKIE HELPERS FOR 30-DAY AFFILIATE TRACKING ──
function setAffiliateCookie(code: string, days = 30) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `mewmao_seller_ref=${encodeURIComponent(code)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getAffiliateCookie(): string | null {
  if (typeof document === "undefined") return null;
  try {
    const match = document.cookie.match(/(?:^|; )mewmao_seller_ref=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

const DEFAULT_VOUCHERS: Voucher[] = [
  {
    id: "voucher-1",
    code: "MEWMAO20K",
    name: "Ưu Đãi Trải Nghiệm Mơ Tây Bắc",
    discountType: "fixed",
    discountValue: 20000,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    minOrderValue: 0,
    usageLimit: 500,
    usedCount: 14,
    status: "active",
    createdAt: "2026-01-01",
  },
  {
    id: "voucher-2",
    code: "CHAOMUNG10",
    name: "Giảm 10% Cho Khách Hàng Thân Thiết",
    discountType: "percent",
    discountValue: 10,
    startDate: "2026-01-01",
    minOrderValue: 0,
    usageLimit: 200,
    usedCount: 38,
    status: "active",
    createdAt: "2026-01-01",
  },
  {
    id: "voucher-3",
    code: "TET2026",
    name: "Voucher Lộc Xuân Rượu Mơ",
    discountType: "fixed",
    discountValue: 30000,
    startDate: "2026-01-01",
    endDate: "2026-03-31",
    minOrderValue: 0,
    usageLimit: 100,
    usedCount: 8,
    status: "active",
    createdAt: "2026-01-01",
  },
];

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("vi"); // Mặc định tiếng Việt
  const [product, setProduct] = useState<Product>(SIGNATURE_PRODUCT);
  const [cartQuantity, setCartQuantity] = useState<number>(1);
  const [isQuickBuyOpen, setIsQuickBuyOpen] = useState<boolean>(false);
  const [isAgeVerified, setIsAgeVerified] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>("guest");
  const [sellers, setSellers] = useState<Seller[]>(INITIAL_SELLERS);
  const [currentSeller, setCurrentSeller] = useState<Seller | null>(null);
  const [activeRefCode, setActiveRefCodeState] = useState<string | null>(null);

  // Wrapper để khi setActiveRefCode được gọi ở bất cứ đâu thì Cookie 30 ngày & localStorage đều tự động đồng bộ
  const setActiveRefCode = (code: string | null) => {
    const clean = code && code.trim() ? code.trim().toUpperCase() : null;
    setActiveRefCodeState(clean);
    if (typeof window !== "undefined") {
      if (clean) {
        setAffiliateCookie(clean, 30);
        localStorage.setItem("mewmao_active_ref", clean);
      } else {
        setAffiliateCookie("", -1);
        localStorage.removeItem("mewmao_active_ref");
      }
    }
  };

  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [payouts, setPayouts] = useState<PayoutRequest[]>(INITIAL_PAYOUTS);
  const [b2bInquiries, setB2BInquiries] = useState<B2BInquiry[]>(INITIAL_B2B_INQUIRIES);
  const [vouchers, setVouchers] = useState<Voucher[]>(DEFAULT_VOUCHERS);
  const [selectedVoucherCode, setSelectedVoucherCode] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);

  // Khởi tạo các trạng thái từ Cookie / LocalStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedAge = localStorage.getItem("mewmao_age_verified");
    if (savedAge === "true") setIsAgeVerified(true);

    const savedLang = localStorage.getItem("mewmao_language") as Language;
    if (savedLang && (savedLang === "vi" || savedLang === "en")) {
      setLanguageState(savedLang);
    }

    // 1. Tải tồn kho & giá mới nhất từ Server
    fetch("/api/inventory")
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data.stock === "number") {
          setProduct((prev) => ({
            ...prev,
            stock: data.stock,
            price: data.price || prev.price,
          }));
        }
      })
      .catch(() => {});

    // 2. Tải danh sách voucher hoạt động từ Server
    fetch("/api/vouchers")
      .then((r) => r.json())
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setVouchers(res.data);
        }
      })
      .catch(() => {});

    // 3. Xử lý ?ref=... trên URL & Cookie 30 ngày
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get("ref");
    if (ref && ref.trim()) {
      const cleanRef = ref.trim().toUpperCase();
      setActiveRefCode(cleanRef);
      setAffiliateCookie(cleanRef, 30);
      localStorage.setItem("mewmao_active_ref", cleanRef);
    } else {
      const cookieRef = getAffiliateCookie();
      const savedRef = cookieRef || localStorage.getItem("mewmao_active_ref");
      if (savedRef && savedRef.trim()) {
        const cleanSavedRef = savedRef.trim().toUpperCase();
        setActiveRefCodeState(cleanSavedRef);
      }
    }

    // 4. Nếu có phiên Admin hoặc Seller đã đăng nhập, tự động đồng bộ dữ liệu bảo mật
    refreshData();
  }, []);

  // Synchronize data via Server APIs (Role-Based & Secure)
  const refreshData = async () => {
    if (typeof window === "undefined") return;

    // 1. Đồng bộ tồn kho & giá công khai
    try {
      const invRes = await fetch("/api/inventory");
      if (invRes.ok) {
        const invData = await invRes.json();
        if (typeof invData.stock === "number") {
          setProduct((prev) => ({
            ...prev,
            stock: invData.stock,
            price: invData.price || prev.price,
          }));
        }
      }
    } catch {}

    // 2. Đồng bộ voucher công khai
    try {
      const vRes = await fetch("/api/vouchers");
      if (vRes.ok) {
        const vData = await vRes.json();
        if (Array.isArray(vData.data) && vData.data.length > 0) {
          setVouchers(vData.data);
        }
      }
    } catch {}

    // 3. Kiểm tra xem có phiên Admin không -> Lấy dữ liệu toàn bộ cửa hàng
    const isAdminUnlocked = sessionStorage.getItem("mewmao_admin_session_unlocked") === "true";
    if (isAdminUnlocked) {
      try {
        const adminRes = await fetch("/api/admin/data");
        if (adminRes.ok) {
          const adminData = await adminRes.json();
          if (adminData.success && adminData.data) {
            if (Array.isArray(adminData.data.sellers)) setSellers(adminData.data.sellers);
            if (Array.isArray(adminData.data.orders)) setOrders(adminData.data.orders);
            if (Array.isArray(adminData.data.payouts)) setPayouts(adminData.data.payouts);
            if (Array.isArray(adminData.data.vouchers)) setVouchers(adminData.data.vouchers);
            if (Array.isArray(adminData.data.b2bInquiries)) setB2BInquiries(adminData.data.b2bInquiries);
            if (typeof adminData.data.stock === "number") {
              setProduct((prev) => ({
                ...prev,
                stock: adminData.data.stock,
                price: adminData.data.price || prev.price,
              }));
            }
          }
        }
      } catch (err) {
        console.warn("Sync admin data error:", err);
      }
    }

    // 4. Kiểm tra xem có phiên Seller không -> Lấy dữ liệu của riêng seller đó
    const sellerActiveId = sessionStorage.getItem("mewmao_active_seller_id");
    if (sellerActiveId) {
      try {
        const sellerRes = await fetch("/api/auth/seller/me");
        if (sellerRes.ok) {
          const sData = await sellerRes.json();
          if (sData.authenticated && sData.seller) {
            setCurrentSeller(sData.seller);
            if (Array.isArray(sData.orders)) setOrders(sData.orders);
            if (Array.isArray(sData.payouts)) setPayouts(sData.payouts);
          }
        }
      } catch (err) {
        console.warn("Sync seller data error:", err);
      }
    }
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("mewmao_language", lang);
    }
  };

  const t = (key: keyof typeof translations.en) => {
    return translations[language][key] || translations["en"][key] || key;
  };

  const verifyAge = () => {
    setIsAgeVerified(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("mewmao_age_verified", "true");
    }
  };

  const switchUserRole = (role: UserRole, sellerId?: string) => {
    setUserRole(role);
    if (role === "seller" && sellerId) {
      const found = sellers.find((s) => s.id === sellerId);
      if (found) setCurrentSeller(found);
    } else if (role !== "seller") {
      setCurrentSeller(null);
    }
  };

  // ── XÁC THỰC VOUCHER ──
  const validateVoucher = (
    code: string,
    currentSubtotal: number
  ): {
    valid: boolean;
    discountAmount: number;
    message: string;
    voucher?: Voucher;
  } => {
    if (!code || !code.trim()) {
      return { valid: false, discountAmount: 0, message: "Vui lòng nhập mã voucher" };
    }

    const cleanCode = code.trim().toUpperCase();
    const matched = vouchers.find(
      (v) => (v.code || "").toUpperCase() === cleanCode
    );

    if (!matched) {
      return {
        valid: false,
        discountAmount: 0,
        message: `Mã "${cleanCode}" không tồn tại hoặc đã hết hạn`,
      };
    }

    if (matched.status !== "active") {
      return {
        valid: false,
        discountAmount: 0,
        message: `Mã "${matched.code}" hiện không còn hiệu lực`,
      };
    }

    const today = new Date().toISOString().split("T")[0];
    if (matched.startDate && matched.startDate > today) {
      return {
        valid: false,
        discountAmount: 0,
        message: `Mã "${matched.code}" áp dụng từ ngày ${matched.startDate}`,
      };
    }

    if (matched.endDate && matched.endDate < today) {
      return {
        valid: false,
        discountAmount: 0,
        message: `Mã "${matched.code}" đã hết hạn vào ngày ${matched.endDate}`,
      };
    }

    if (matched.minOrderValue && currentSubtotal < matched.minOrderValue) {
      return {
        valid: false,
        discountAmount: 0,
        message: `Đơn hàng tối thiểu ${matched.minOrderValue.toLocaleString("vi-VN")}₫ để áp dụng mã này`,
      };
    }

    if (
      matched.usageLimit !== undefined &&
      matched.usageLimit !== null &&
      matched.usedCount >= matched.usageLimit
    ) {
      return {
        valid: false,
        discountAmount: 0,
        message: `Mã "${matched.code}" đã hết lượt sử dụng`,
      };
    }

    let discount = 0;
    if (matched.discountType === "percent") {
      discount = Math.round(currentSubtotal * (matched.discountValue / 100));
    } else {
      discount = matched.discountValue;
    }

    discount = Math.min(currentSubtotal, Math.max(0, discount));

    return {
      valid: true,
      discountAmount: discount,
      message: `Áp dụng thành công: ${matched.name} (-${discount.toLocaleString("vi-VN")}₫)`,
      voucher: matched,
    };
  };

  // ── ĐẶT HÀNG QUA SERVER API (ATOMIC & SECURE) ──
  const placeOrder = async (data: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    customerNote?: string;
    quantity: number;
    paymentMethod: "vietqr" | "cod";
    affiliateCode?: string;
    voucherCode?: string;
    discountAmount?: number;
  }): Promise<Order> => {
    const rawRefCode =
      (data.affiliateCode && data.affiliateCode.trim()) ||
      (activeRefCode && activeRefCode.trim()) ||
      getAffiliateCookie() ||
      (typeof window !== "undefined" ? localStorage.getItem("mewmao_active_ref") : null);

    const payload = {
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerAddress: data.customerAddress,
      customerNote: data.customerNote,
      quantity: data.quantity,
      paymentMethod: data.paymentMethod,
      affiliateCode: rawRefCode ? rawRefCode.trim().toUpperCase() : undefined,
      voucherCode: data.voucherCode ? data.voucherCode.trim().toUpperCase() : undefined,
    };

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.error || "Đặt hàng không thành công. Vui lòng thử lại!");
    }

    const createdOrder: Order = json.data;

    // Cập nhật tồn kho hiển thị
    if (typeof json.data.remainingStock === "number") {
      setProduct((prev) => ({
        ...prev,
        stock: json.data.remainingStock,
      }));
    }

    // Cập nhật danh sách đơn hàng cục bộ
    setOrders((prev) => [createdOrder, ...prev.filter((o) => o.id !== createdOrder.id)]);

    return createdOrder;
  };

  // ── CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG (ADMIN) ──
  const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<boolean> => {
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, updates: { status } }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
        );
        return true;
      }
    } catch (e) {
      console.error("Update order status error:", e);
    }
    return false;
  };

  // ── CẬP NHẬT TRẠNG THÁI THANH TOÁN (ADMIN) ──
  const updatePaymentStatus = async (
    orderId: string,
    status: "paid" | "unpaid"
  ): Promise<boolean> => {
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, updates: { payment_status: status } }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((ord) => (ord.id === orderId ? { ...ord, paymentStatus: status } : ord))
        );
        return true;
      }
    } catch (e) {
      console.error("Update payment status error:", e);
    }
    return false;
  };

  // ── XÓA ĐƠN HÀNG (ADMIN) ──
  const deleteOrder = async (orderId: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/orders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId }),
      });
      if (res.ok) {
        setOrders((prev) => prev.filter((ord) => ord.id !== orderId));
        return true;
      }
    } catch (e) {
      console.error("Delete order error:", e);
    }
    return false;
  };

  // ── THÊM SELLER (ADMIN) ──
  const addSeller = async (data: {
    name: string;
    email: string;
    phone?: string;
    status?: "active" | "pending" | "inactive";
    affiliateCode?: string;
    pin?: string;
    commissionRate?: number;
    promoDiscountPerBottle?: number;
    bankInfo: {
      bankName: string;
      accountNumber: string;
      accountHolder: string;
    };
  }): Promise<Seller> => {
    const code =
      data.affiliateCode?.trim().toUpperCase() ||
      data.name
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase()
        .slice(0, 8) ||
      `SELLER${Math.floor(100 + Math.random() * 900)}`;

    const generatedPin =
      data.pin?.trim() || Math.floor(100000 + Math.random() * 900000).toString();

    const newSeller: Seller = {
      id: `seller-${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone?.trim() || "",
      role: "seller",
      status: data.status || "active",
      affiliateCode: code,
      pin: generatedPin,
      commissionRate: data.commissionRate !== undefined ? data.commissionRate : 0.15,
      promoDiscountPerBottle: data.promoDiscountPerBottle || 0,
      balance: 0,
      totalWithdrawn: 0,
      totalEarned: 0,
      clicksCount: 0,
      ordersCount: 0,
      bottlesSoldCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
      bankInfo: data.bankInfo,
    };

    const dbPayload = {
      id: newSeller.id,
      name: newSeller.name,
      phone: newSeller.phone,
      email: newSeller.email,
      affiliate_code: newSeller.affiliateCode,
      pin: newSeller.pin,
      commission_rate: newSeller.commissionRate,
      discount_percent: newSeller.promoDiscountPerBottle,
      bank_name: newSeller.bankInfo.bankName,
      account_number: newSeller.bankInfo.accountNumber,
      account_holder: newSeller.bankInfo.accountHolder,
      status: newSeller.status,
    };

    const res = await fetch("/api/sellers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dbPayload),
    });

    if (res.ok) {
      setSellers((prev) => [newSeller, ...prev]);
    }

    return newSeller;
  };

  // ── ĐĂNG KÝ SELLER TỰ DO (/partners & /seller) ──
  const registerSeller = async (data: {
    name: string;
    phone: string;
    email: string;
  }): Promise<Seller> => {
    const rawClean = data.name
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, 8);
    const code = rawClean
      ? `${rawClean}${Math.floor(10 + Math.random() * 90)}`
      : `SELLER${Math.floor(100 + Math.random() * 900)}`;
    const generatedPin = Math.floor(100000 + Math.random() * 900000).toString();

    const newSeller: Seller = {
      id: `seller-${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      role: "seller",
      status: "pending",
      affiliateCode: code,
      pin: generatedPin,
      commissionRate: 0.15,
      promoDiscountPerBottle: 0,
      balance: 0,
      totalWithdrawn: 0,
      totalEarned: 0,
      clicksCount: 0,
      ordersCount: 0,
      bottlesSoldCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
      bankInfo: {
        bankName: "",
        accountNumber: "",
        accountHolder: "",
      },
    };

    const dbPayload = {
      id: newSeller.id,
      name: newSeller.name,
      phone: newSeller.phone,
      email: newSeller.email,
      affiliate_code: newSeller.affiliateCode,
      pin: newSeller.pin,
      commission_rate: 0.15,
      status: "pending",
    };

    const res = await fetch("/api/sellers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dbPayload),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || "Đăng ký không thành công");
    }

    setSellers((prev) => [newSeller, ...prev]);
    return newSeller;
  };

  // ── CẬP NHẬT SELLER (ADMIN HOẶC SELLER TỰ CẬP NHẬT) ──
  const updateSeller = async (
    sellerId: string,
    updates: Partial<Seller>
  ): Promise<boolean> => {
    setSellers((prev) =>
      prev.map((s) => (s.id === sellerId ? { ...s, ...updates } : s))
    );
    if (currentSeller && currentSeller.id === sellerId) {
      setCurrentSeller((prev) => (prev ? { ...prev, ...updates } : null));
    }

    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.affiliateCode !== undefined) dbUpdates.affiliate_code = updates.affiliateCode;
    if (updates.pin !== undefined) dbUpdates.pin = updates.pin;
    if (updates.commissionRate !== undefined) dbUpdates.commission_rate = updates.commissionRate;
    if (updates.promoDiscountPerBottle !== undefined) dbUpdates.discount_percent = updates.promoDiscountPerBottle;
    if (updates.balance !== undefined) dbUpdates.balance = updates.balance;
    if (updates.bankInfo !== undefined) {
      dbUpdates.bank_name = updates.bankInfo.bankName;
      dbUpdates.account_number = updates.bankInfo.accountNumber;
      dbUpdates.account_holder = updates.bankInfo.accountHolder;
    }

    try {
      const res = await fetch("/api/sellers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sellerId, updates: dbUpdates }),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  // ── XÓA SELLER (ADMIN) ──
  const deleteSeller = async (sellerId: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/sellers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sellerId }),
      });
      if (res.ok) {
        setSellers((prev) => prev.filter((s) => s.id !== sellerId));
        return true;
      }
    } catch (e) {
      console.error("Delete seller error:", e);
    }
    return false;
  };

  // ── YÊU CẦU RÚT TIỀN (SELLER) ──
  const requestPayout = async (sellerId: string, amount: number): Promise<boolean> => {
    try {
      const res = await fetch("/api/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId, amount }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPayouts((prev) => [data.data, ...prev]);
        if (currentSeller && currentSeller.id === sellerId) {
          setCurrentSeller((prev) =>
            prev ? { ...prev, balance: data.data.newBalance } : null
          );
        }
        return true;
      } else {
        alert(data.error || "Rút tiền không thành công");
      }
    } catch (e) {
      console.error("Request payout error:", e);
    }
    return false;
  };

  // ── DUYỆT RÚT TIỀN (ADMIN) ──
  const approvePayout = async (payoutId: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/payouts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payoutId, status: "completed" }),
      });
      if (res.ok) {
        setPayouts((prev) =>
          prev.map((p) => (p.id === payoutId ? { ...p, status: "completed" } : p))
        );
        return true;
      }
    } catch (e) {
      console.error("Approve payout error:", e);
    }
    return false;
  };

  // ── THÊM VOUCHER (ADMIN) ──
  const addVoucher = async (
    data: Omit<Voucher, "id" | "usedCount" | "createdAt">
  ): Promise<Voucher> => {
    const newV: Voucher = {
      ...data,
      id: `voucher-${Date.now()}`,
      code: data.code.trim().toUpperCase(),
      usedCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };

    const res = await fetch("/api/vouchers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newV),
    });

    if (res.ok) {
      setVouchers((prev) => [newV, ...prev]);
    }
    return newV;
  };

  // ── CẬP NHẬT VOUCHER (ADMIN) ──
  const updateVoucher = async (
    id: string,
    updates: Partial<Voucher>
  ): Promise<boolean> => {
    setVouchers((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
    );

    try {
      const res = await fetch("/api/vouchers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, updates }),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  // ── XÓA VOUCHER (ADMIN) ──
  const deleteVoucher = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/vouchers?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setVouchers((prev) => prev.filter((v) => v.id !== id));
        return true;
      }
    } catch {}
    return false;
  };

  // ── CẬP NHẬT KHO HÀNG (ADMIN) ──
  const updateStock = async (newStock: number, newPrice?: number): Promise<boolean> => {
    setProduct((prev) => ({
      ...prev,
      stock: newStock,
      price: newPrice !== undefined ? newPrice : prev.price,
    }));

    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock, price: newPrice }),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  // ── GỬI FORM ĐỐI TÁC B2B (LƯU DB & GỬI EMAIL ADMIN) ──
  const submitB2BInquiry = async (
    data: Omit<B2BInquiry, "id" | "status" | "createdAt">
  ): Promise<boolean> => {
    try {
      const res = await fetch("/api/b2b", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setB2BInquiries((prev) => [json.data, ...prev]);
        return true;
      }
    } catch (e) {
      console.error("Submit B2B inquiry error:", e);
    }
    return false;
  };

  const toggleAudio = () => {
    setIsAudioPlaying((prev) => !prev);
  };

  return (
    <StoreContext.Provider
      value={{
        product,
        cartQuantity,
        setCartQuantity,
        isQuickBuyOpen,
        setIsQuickBuyOpen,
        isAgeVerified,
        verifyAge,
        language,
        setLanguage,
        t,
        userRole,
        currentSeller,
        setCurrentSeller,
        switchUserRole,
        activeRefCode,
        setActiveRefCode,
        orders,
        sellers,
        payouts,
        b2bInquiries,
        vouchers,
        selectedVoucherCode,
        setSelectedVoucherCode,
        validateVoucher,
        addVoucher,
        updateVoucher,
        deleteVoucher,
        placeOrder,
        updateOrderStatus,
        updatePaymentStatus,
        deleteOrder,
        refreshData,
        requestPayout,
        approvePayout,
        addSeller,
        registerSeller,
        deleteSeller,
        updateSeller,
        updateStock,
        submitB2BInquiry,
        isAudioPlaying,
        toggleAudio,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
