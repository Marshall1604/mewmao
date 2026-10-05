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
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

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
  }) => Order;
  validateVoucher: (
    code: string,
    currentSubtotal: number
  ) => {
    valid: boolean;
    discountAmount: number;
    message: string;
    voucher?: Voucher;
  };
  addVoucher: (data: Omit<Voucher, "id" | "usedCount" | "createdAt">) => Voucher;
  updateVoucher: (id: string, updates: Partial<Voucher>) => void;
  deleteVoucher: (id: string) => Promise<boolean>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  deleteOrder: (orderId: string) => Promise<boolean>;
  refreshData: () => Promise<void>;
  requestPayout: (sellerId: string, amount: number) => boolean;
  approvePayout: (payoutId: string) => void;
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
  }) => Seller;
  registerSeller: (data: {
    name: string;
    phone: string;
    email: string;
  }) => Promise<Seller>;
  deleteSeller: (sellerId: string) => Promise<boolean>;
  updateSeller: (sellerId: string, updates: Partial<Seller>) => void;
  updateStock: (newStock: number) => void;
  submitB2BInquiry: (data: Omit<B2BInquiry, "id" | "status" | "createdAt">) => void;
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
  const [language, setLanguageState] = useState<Language>("vi"); // Mặc định tiếng Việt khi vào website
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

  // Initialize from LocalStorage and Cookie to handle URL ref code
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Mặc định tiếng Việt khi vào website
    if (localStorage.getItem("mewmao_lang")) {
      localStorage.removeItem("mewmao_lang");
    }
    const savedLang = localStorage.getItem("mewmao_lang_v2") as Language;
    if (savedLang === "vi" || savedLang === "en") {
      setLanguageState(savedLang);
    } else {
      setLanguageState("vi");
    }

    // Clear persistent age verification so the 18+ gate always shows on every visit/reload
    localStorage.removeItem("mewmao_age_verified");
    setIsAgeVerified(false);

    // Load saved stock from localStorage
    const savedStock = localStorage.getItem("mewmao_product_stock");
    if (savedStock !== null) {
      const parsedStock = parseInt(savedStock, 10);
      if (!isNaN(parsedStock) && parsedStock >= 0) {
        setProduct((prev) => ({ ...prev, stock: parsedStock }));
      }
    }

    const savedOrders = localStorage.getItem("mewmao_orders");
    if (savedOrders) {
      try {
        const parsed = JSON.parse(savedOrders);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setOrders(parsed);
        }
      } catch (e) {
        console.warn("Error parsing saved orders from localStorage:", e);
      }
    }

    const savedVouchers = localStorage.getItem("mewmao_vouchers");
    if (savedVouchers) {
      try {
        const parsed = JSON.parse(savedVouchers);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setVouchers(parsed);
        }
      } catch (e) {
        console.warn("Error parsing saved vouchers from localStorage:", e);
      }
    }

    // Tự động kéo voucher mới nhất từ server/Supabase ngay khi khởi động
    fetch("/api/vouchers")
      .then((r) => r.json())
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setVouchers(res.data);
          localStorage.setItem("mewmao_vouchers", JSON.stringify(res.data));
        }
      })
      .catch(() => {});

    // ── XỬ LÝ LINK GIỚI THIỆU (?ref=...) & COOKIE 30 NGÀY ──
    // Lưu vô điều kiện ngay lập tức khi phát hiện ?ref=... trên URL (không phụ thuộc vào sellers state)
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get("ref");
    if (ref && ref.trim()) {
      const cleanRef = ref.trim().toUpperCase();
      setActiveRefCode(cleanRef);
      setAffiliateCookie(cleanRef, 30);
      localStorage.setItem("mewmao_active_ref", cleanRef);
    } else {
      // Đọc từ Cookie (30 ngày) trước, sau đó từ localStorage
      const cookieRef = getAffiliateCookie();
      const savedRef = cookieRef || localStorage.getItem("mewmao_active_ref");
      if (savedRef && savedRef.trim()) {
        const cleanSavedRef = savedRef.trim().toUpperCase();
        setActiveRefCodeState(cleanSavedRef);
      }
    }
  }, []);

  // Synchronize data from Supabase
  const refreshData = async () => {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      // 1. Fetch Sellers & System Inventory
      let dbSellers: any[] | null = null;
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from("sellers")
          .select("*")
          .order("created_at", { ascending: false });
        if (!error && data) {
          dbSellers = data;
        }
      }

      if (!dbSellers) {
        try {
          const apiRes = await fetch("/api/sellers");
          if (apiRes.ok) {
            const json = await apiRes.json();
            if (json.data) dbSellers = json.data;
          }
        } catch (e) {
          console.warn("API sellers fallback error:", e);
        }
      }

      if (dbSellers) {
        // Extract system inventory strictly by id
        const systemInventory = dbSellers.find(
          (row: any) => row.id === "system-inventory"
        );
        if (systemInventory) {
          const syncedStock = Number(systemInventory.bottles_sold_count);
          if (!isNaN(syncedStock) && syncedStock >= 0) {
            setProduct((prev) => ({
              ...prev,
              stock: syncedStock,
              price: Number(systemInventory.balance) > 0 ? Number(systemInventory.balance) : prev.price,
            }));
            if (typeof window !== "undefined") {
              localStorage.setItem("mewmao_product_stock", syncedStock.toString());
            }
          }
        }

        // Filter out system rows so sellers only has real human sellers
        const humanSellers = dbSellers.filter(
          (row: any) =>
            row.id !== "system-inventory" &&
            row.id !== "system-vouchers" &&
            row.status !== "system" &&
            row.status !== "system_inventory" &&
            row.status !== "system_vouchers"
        );

        const mappedSellers: Seller[] = humanSellers.map((row: any) => ({
          id: row.id,
          name: row.name,
          email: row.email || "",
          phone: row.phone || "",
          role: "seller",
          status: (row.status as any) || "active",
          affiliateCode: row.affiliate_code,
          pin: row.pin,
          commissionRate: row.commission_rate !== null && row.commission_rate !== undefined ? Number(row.commission_rate) : 0.15,
          promoDiscountPerBottle: Number(row.discount_percent) || 0,
          balance: Number(row.balance) || 0,
          totalWithdrawn: Number(row.total_withdrawn) || 0,
          totalEarned: Number(row.total_earned) || 0,
          clicksCount: 0,
          ordersCount: Number(row.orders_count) || 0,
          bottlesSoldCount: Number(row.bottles_sold_count) || 0,
          createdAt: row.created_at ? row.created_at.split("T")[0] : "",
          bankInfo: {
            bankName: row.bank_name || "",
            accountNumber: row.account_number || "",
            accountHolder: row.account_holder || "",
          },
        }));
        setSellers(mappedSellers);
      }

      // 2. Fetch Orders
      let dbOrders: any[] | null = null;
      if (isSupabaseConfigured && supabase) {
        const { data, error: ordersErr } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });
        if (!ordersErr && data) {
          dbOrders = data;
        }
      }

      if (!dbOrders) {
        try {
          const apiRes = await fetch("/api/orders");
          if (apiRes.ok) {
            const json = await apiRes.json();
            if (json.data) dbOrders = json.data;
          }
        } catch (e) {
          console.warn("API orders fallback error:", e);
        }
      }

      if (dbOrders) {
        const mappedOrders: Order[] = dbOrders.map((row: any) => ({
          id: row.id,
          customerName: row.customer_name,
          customerPhone: row.customer_phone,
          customerAddress: row.customer_address,
          customerNote: row.customer_note || "",
          items: Array.isArray(row.items) ? row.items : [],
          subtotalAmount: Number(row.subtotal) || 289000,
          discountAmount: Number(row.discount_amount) || 0,
          totalAmount: Number(row.total_amount) || 289000,
          paymentMethod: row.payment_method || "cod",
          paymentStatus: row.payment_status || "unpaid",
          status: row.status || "pending",
          affiliateCode: row.affiliate_code || undefined,
          sellerCommission: Number(row.seller_commission) || 0,
          createdAt: row.created_at ? row.created_at.replace("T", " ").slice(0, 16) : "",
        }));
        setOrders(mappedOrders);
        if (typeof window !== "undefined") {
          localStorage.setItem("mewmao_orders", JSON.stringify(mappedOrders));
        }
      }

      // 3. Fetch Payouts
      const { data: dbPayouts, error: payoutsErr } = await supabase
        .from("payouts")
        .select("*")
        .order("created_at", { ascending: false });

      if (!payoutsErr && dbPayouts) {
        const mappedPayouts: PayoutRequest[] = dbPayouts.map((row: any) => ({
          id: row.id,
          sellerId: row.seller_id,
          sellerName: row.account_holder || "",
          amount: Number(row.amount) || 0,
          bankInfo: {
            bankName: row.bank_name || "",
            accountNumber: row.account_number || "",
            accountHolder: row.account_holder || "",
          },
          status: row.status || "pending",
          requestedAt: row.requested_at || "",
        }));
        setPayouts(mappedPayouts);
      }

      // 4. Fetch Vouchers (tự động đồng bộ liên tục giữa các thiết bị)
      try {
        const vRes = await fetch("/api/vouchers");
        if (vRes.ok) {
          const vJson = await vRes.json();
          if (Array.isArray(vJson.data) && vJson.data.length > 0) {
            setVouchers(vJson.data);
            if (typeof window !== "undefined") {
              localStorage.setItem("mewmao_vouchers", JSON.stringify(vJson.data));
            }
          }
        }
      } catch (vErr) {
        console.warn("API vouchers refresh error:", vErr);
      }
    } catch (err) {
      console.warn("Supabase refreshData error:", err);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    refreshData();

    // Setup Supabase Realtime Channel
    const channel = supabase
      .channel("mewmao-store-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        refreshData();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "sellers" }, () => {
        refreshData();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "payouts" }, () => {
        refreshData();
      })
      .subscribe();

    const handleFocus = () => {
      refreshData();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("mewmao_lang_v2", lang);
    }
  };

  const t = (key: keyof typeof translations.en): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  const verifyAge = () => {
    setIsAgeVerified(true);
  };

  const switchUserRole = (role: UserRole, sellerId?: string) => {
    setUserRole(role);
    if (role === "seller") {
      const target = sellers.find((s) => s.id === (sellerId || "seller-1"));
      setCurrentSeller(target || sellers[0]);
    } else {
      setCurrentSeller(null);
    }
  };

  // ── VOUCHER HELPERS & METHODS ──
  const validateVoucher = (
    code: string,
    currentSubtotal: number
  ): {
    valid: boolean;
    discountAmount: number;
    message: string;
    voucher?: Voucher;
  } => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { valid: false, discountAmount: 0, message: "Vui lòng nhập mã voucher." };
    }

    const v = vouchers.find((item) => item.code.trim().toUpperCase() === cleanCode);
    if (!v) {
      return { valid: false, discountAmount: 0, message: "Mã voucher không tồn tại." };
    }

    if (v.status !== "active") {
      return { valid: false, discountAmount: 0, message: "Voucher này đang tạm dừng áp dụng." };
    }

    if (v.usageLimit && v.usedCount >= v.usageLimit) {
      return { valid: false, discountAmount: 0, message: "Voucher đã hết số lượt sử dụng." };
    }

    const today = new Date().toISOString().split("T")[0];
    if (v.startDate && today < v.startDate) {
      return {
        valid: false,
        discountAmount: 0,
        message: `Voucher sẽ có hiệu lực từ ngày ${v.startDate}.`,
      };
    }

    if (v.endDate && today > v.endDate) {
      return { valid: false, discountAmount: 0, message: "Voucher đã hết hạn sử dụng." };
    }

    if (v.minOrderValue && currentSubtotal < v.minOrderValue) {
      return {
        valid: false,
        discountAmount: 0,
        message: `Đơn hàng tối thiểu ${v.minOrderValue.toLocaleString("vi-VN")}₫ để áp dụng.`,
      };
    }

    let discount = 0;
    if (v.discountType === "percent") {
      discount = Math.round(currentSubtotal * (v.discountValue / 100));
    } else {
      discount = v.discountValue;
    }
    discount = Math.min(discount, currentSubtotal);

    return {
      valid: true,
      discountAmount: discount,
      message: `Áp dụng thành công voucher ${v.name}! Giảm ${discount.toLocaleString("vi-VN")}₫`,
      voucher: v,
    };
  };

  const addVoucher = (data: Omit<Voucher, "id" | "usedCount" | "createdAt">): Voucher => {
    const newVoucher: Voucher = {
      ...data,
      id: `voucher-${Date.now()}`,
      code: data.code.trim().toUpperCase(),
      usedCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };

    let updatedList: Voucher[] = [];
    setVouchers((prev) => {
      updatedList = [newVoucher, ...prev];
      if (typeof window !== "undefined") {
        localStorage.setItem("mewmao_vouchers", JSON.stringify(updatedList));
      }
      return updatedList;
    });

    fetch("/api/vouchers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vouchers: updatedList }),
    }).catch(() => {});

    return newVoucher;
  };

  const updateVoucher = (id: string, updates: Partial<Voucher>) => {
    let updatedList: Voucher[] = [];
    setVouchers((prev) => {
      updatedList = prev.map((v) => (v.id === id ? { ...v, ...updates } : v));
      if (typeof window !== "undefined") {
        localStorage.setItem("mewmao_vouchers", JSON.stringify(updatedList));
      }
      return updatedList;
    });

    fetch("/api/vouchers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vouchers: updatedList }),
    }).catch(() => {});
  };

  const deleteVoucher = async (id: string): Promise<boolean> => {
    let updatedList: Voucher[] = [];
    setVouchers((prev) => {
      updatedList = prev.filter((v) => v.id !== id);
      if (typeof window !== "undefined") {
        localStorage.setItem("mewmao_vouchers", JSON.stringify(updatedList));
      }
      return updatedList;
    });

    try {
      await fetch("/api/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vouchers: updatedList }),
      });
      await fetch(`/api/vouchers?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    } catch {}
    return true;
  };

  const placeOrder = (data: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    customerNote?: string;
    quantity: number;
    paymentMethod: "vietqr" | "cod";
    affiliateCode?: string;
    voucherCode?: string;
    discountAmount?: number;
  }): Order => {
    const subtotalAmount = product.price * data.quantity;
    const discountAmount = Math.min(subtotalAmount, Math.max(0, data.discountAmount || 0));
    const totalAmount = Math.max(0, subtotalAmount - discountAmount);
    let commission = 0;
    let sellerToCredit: Seller | null = null;

    // Tăng lượt sử dụng voucher nếu có áp dụng
    if (data.voucherCode) {
      const vCode = data.voucherCode.trim().toUpperCase();
      setVouchers((prev) => {
        const nextVouchers = prev.map((v) =>
          v.code.toUpperCase() === vCode ? { ...v, usedCount: (v.usedCount || 0) + 1 } : v
        );
        if (typeof window !== "undefined") {
          localStorage.setItem("mewmao_vouchers", JSON.stringify(nextVouchers));
        }
        return nextVouchers;
      });

      const matchedV = vouchers.find((v) => v.code.toUpperCase() === vCode);
      if (matchedV) {
        fetch("/api/vouchers", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: matchedV.id,
            updates: { usedCount: (matchedV.usedCount || 0) + 1 },
          }),
        }).catch(() => {});
      }
    }

    // Nhận diện Seller qua thứ tự ưu tiên:
    // 1. Mã Affiliate truyền trực tiếp từ form (data.affiliateCode)
    // 2. activeRefCode từ state
    // 3. Cookie 30 ngày (mewmao_seller_ref)
    // 4. LocalStorage (mewmao_active_ref)
    const rawRefCode =
      (data.affiliateCode && data.affiliateCode.trim()) ||
      (activeRefCode && activeRefCode.trim()) ||
      getAffiliateCookie() ||
      (typeof window !== "undefined" ? localStorage.getItem("mewmao_active_ref") : null);

    const refCode = rawRefCode ? rawRefCode.trim().toUpperCase() : null;

    if (refCode) {
      sellerToCredit =
        sellers.find(
          (s) => s.affiliateCode && s.affiliateCode.trim().toUpperCase() === refCode
        ) || null;

      if (sellerToCredit) {
        // Cập nhật lại Cookie 30 ngày & localStorage với mã chuẩn xác của seller
        setAffiliateCookie(sellerToCredit.affiliateCode, 30);
        if (typeof window !== "undefined") {
          localStorage.setItem("mewmao_active_ref", sellerToCredit.affiliateCode);
        }
        // Tính hoa hồng theo đúng tỷ lệ riêng của Seller (hỗ trợ từ 0% đến 100%)
        commission = Math.round(subtotalAmount * (sellerToCredit.commissionRate !== undefined ? sellerToCredit.commissionRate : 0.15));
      } else {
        // Nếu mã affiliate được nhập nhưng danh sách sellers state chưa kịp đồng bộ seller mới:
        // Vẫn lưu Cookie 30 ngày & tính mức hoa hồng mặc định 15%
        setAffiliateCookie(refCode, 30);
        if (typeof window !== "undefined") {
          localStorage.setItem("mewmao_active_ref", refCode);
        }
        commission = Math.round(subtotalAmount * 0.15);
      }
    }

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newOrder: Order = {
      id: `MM-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerAddress: data.customerAddress,
      customerNote: data.customerNote,
      items: [
        {
          productId: product.id,
          name: product.name,
          quantity: data.quantity,
          price: product.price,
        },
      ],
      subtotalAmount,
      discountAmount,
      totalAmount,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentMethod === "vietqr" ? "paid" : "unpaid",
      status: "pending",
      affiliateCode: sellerToCredit ? sellerToCredit.affiliateCode : (refCode || undefined),
      voucherCode: data.voucherCode ? data.voucherCode.trim().toUpperCase() : undefined,
      sellerCommission: commission,
      createdAt: formattedDate,
    };

    // Update orders in state & localStorage
    setOrders((prev) => {
      const updated = [newOrder, ...prev.filter((o) => o.id !== newOrder.id)];
      if (typeof window !== "undefined") {
        localStorage.setItem("mewmao_orders", JSON.stringify(updated));
      }
      return updated;
    });

    // Update product stock
    const remainingStock = Math.max(0, product.stock - data.quantity);
    setProduct((prev) => ({
      ...prev,
      stock: remainingStock,
    }));
    if (typeof window !== "undefined") {
      localStorage.setItem("mewmao_product_stock", remainingStock.toString());
    }

    // Credit seller if affiliate applied
    if (sellerToCredit) {
      const creditedSellerId = sellerToCredit.id;
      const addedCommission = commission;
      const addedBottles = data.quantity;

      setSellers((prev) =>
        prev.map((s) => {
          if (s.id === creditedSellerId) {
            const updated = {
              ...s,
              balance: s.balance + addedCommission,
              totalEarned: s.totalEarned + addedCommission,
              ordersCount: s.ordersCount + 1,
              bottlesSoldCount: (s.bottlesSoldCount || 0) + addedBottles,
            };
            if (currentSeller && currentSeller.id === s.id) {
              setCurrentSeller(updated);
            }
            return updated;
          }
          return s;
        })
      );
    }

    // 1. Đồng bộ kho hàng (system inventory)
    if (isSupabaseConfigured && supabase) {
      supabase
        .from("sellers")
        .update({ bottles_sold_count: remainingStock })
        .eq("id", "system-inventory")
        .then(({ error }) => {
          if (error) console.error("Error updating inventory in Supabase:", error);
        });
    }

    // 2. Lưu đơn hàng vào Database & API
    const orderDbPayload = {
      id: newOrder.id,
      customer_name: newOrder.customerName,
      customer_phone: newOrder.customerPhone,
      customer_address: newOrder.customerAddress,
      customer_note: newOrder.voucherCode
        ? `${newOrder.customerNote ? newOrder.customerNote + " " : ""}[Voucher: ${newOrder.voucherCode} -${newOrder.discountAmount?.toLocaleString("vi-VN")}₫]`
        : (newOrder.customerNote || null),
      items: newOrder.items,
      subtotal: newOrder.subtotalAmount,
      discount_amount: newOrder.discountAmount,
      total_amount: newOrder.totalAmount,
      affiliate_code: newOrder.affiliateCode || null,
      seller_commission: newOrder.sellerCommission,
      payment_method: newOrder.paymentMethod,
      payment_status: newOrder.paymentStatus,
      status: newOrder.status,
    };

    try {
      fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderDbPayload),
      }).then(() => refreshData());
    } catch (e) {
      console.warn("API insert order fallback error:", e);
    }

    if (isSupabaseConfigured && supabase) {
      supabase
        .from("orders")
        .insert(orderDbPayload)
        .then(({ error }) => {
          if (error) {
            console.error("Error inserting order into Supabase:", error);
          } else {
            refreshData();
          }
        });
    }

    // 3. Cập nhật hoa hồng & doanh số cho Seller trong DB & API
    if (sellerToCredit) {
      const sellerUpdateData = {
        balance: sellerToCredit.balance + commission,
        total_earned: sellerToCredit.totalEarned + commission,
        orders_count: sellerToCredit.ordersCount + 1,
        bottles_sold_count: (sellerToCredit.bottlesSoldCount || 0) + data.quantity,
      };

      try {
        fetch("/api/sellers", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: sellerToCredit.id,
            updates: sellerUpdateData,
          }),
        }).then(() => refreshData());
      } catch (e) {
        console.warn("API update seller fallback error:", e);
      }

      if (isSupabaseConfigured && supabase) {
        supabase
          .from("sellers")
          .update(sellerUpdateData)
          .eq("id", sellerToCredit.id)
          .then(({ error }) => {
            if (error) {
              console.error("Error updating seller in Supabase:", error);
            } else {
              refreshData();
            }
          });
      }
    } else if (refCode && isSupabaseConfigured && supabase) {
      // Trường hợp Seller mới tạo chưa kịp vào local state: Tìm trực tiếp trong DB theo affiliate_code
      supabase
        .from("sellers")
        .select("*")
        .ilike("affiliate_code", refCode)
        .single()
        .then(({ data: dbSeller }) => {
          if (dbSeller) {
            const actualRate = dbSeller.commission_rate !== null && dbSeller.commission_rate !== undefined ? Number(dbSeller.commission_rate) : 0.15;
            const actualComm = Math.round(subtotalAmount * actualRate);
            const dbUpdates = {
              balance: (Number(dbSeller.balance) || 0) + actualComm,
              total_earned: (Number(dbSeller.total_earned) || 0) + actualComm,
              orders_count: (Number(dbSeller.orders_count) || 0) + 1,
              bottles_sold_count: (Number(dbSeller.bottles_sold_count) || 0) + data.quantity,
            };
            supabase
              .from("sellers")
              .update(dbUpdates)
              .eq("id", dbSeller.id)
              .then(() => refreshData());
          }
        });
    }

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) => {
      const updated = prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord));
      if (typeof window !== "undefined") {
        localStorage.setItem("mewmao_orders", JSON.stringify(updated));
      }
      return updated;
    });

    try {
      fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, updates: { status } }),
      }).then(() => refreshData());
    } catch (e) {
      console.warn("API update order status error:", e);
    }

    if (isSupabaseConfigured && supabase) {
      supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId)
        .then(({ error }) => {
          if (error) {
            console.error("Error updating order status in Supabase:", error);
          } else {
            refreshData();
          }
        });
    }
  };

  const deleteOrder = async (orderId: string): Promise<boolean> => {
    setOrders((prev) => {
      const updated = prev.filter((ord) => ord.id !== orderId);
      if (typeof window !== "undefined") {
        localStorage.setItem("mewmao_orders", JSON.stringify(updated));
      }
      return updated;
    });

    try {
      const res = await fetch("/api/orders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId }),
      });
      if (res.ok) {
        await refreshData();
        return true;
      }
    } catch (e) {
      console.warn("API delete fallback to client:", e);
    }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("orders").delete().eq("id", orderId);
      if (error) {
        console.error("Error deleting order from Supabase:", error);
        return false;
      }
      await refreshData();
    }
    return true;
  };

  const addSeller = (data: {
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
  }): Seller => {
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

    setSellers((prev) => [...prev, newSeller]);

    const dbPayload = {
      id: newSeller.id,
      name: newSeller.name,
      phone: newSeller.phone,
      email: newSeller.email,
      affiliate_code: newSeller.affiliateCode,
      pin: newSeller.pin,
      commission_rate: newSeller.commissionRate,
      discount_code: null,
      discount_percent: newSeller.promoDiscountPerBottle,
      bottles_sold_count: 0,
      orders_count: 0,
      balance: 0,
      total_earned: 0,
      total_withdrawn: 0,
      bank_name: newSeller.bankInfo.bankName,
      account_number: newSeller.bankInfo.accountNumber,
      account_holder: newSeller.bankInfo.accountHolder,
      status: newSeller.status,
    };

    try {
      fetch("/api/sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dbPayload),
      }).then(() => refreshData());
    } catch (e) {
      console.warn("API insert seller fallback error:", e);
    }

    if (isSupabaseConfigured && supabase) {
      supabase
        .from("sellers")
        .insert(dbPayload)
        .then(({ error }) => {
          if (error) console.error("Error inserting seller into Supabase:", error);
          else refreshData();
        });
    }

    return newSeller;
  };

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

    setSellers((prev) => [newSeller, ...prev]);

    const dbPayload = {
      id: newSeller.id,
      name: newSeller.name,
      phone: newSeller.phone,
      email: newSeller.email,
      affiliate_code: newSeller.affiliateCode,
      pin: newSeller.pin,
      commission_rate: newSeller.commissionRate,
      discount_code: null,
      discount_percent: 0,
      bottles_sold_count: 0,
      orders_count: 0,
      balance: 0,
      total_earned: 0,
      total_withdrawn: 0,
      bank_name: "",
      account_number: "",
      account_holder: "",
      status: "pending",
    };

    try {
      await fetch("/api/sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dbPayload),
      });
      await refreshData();
    } catch (e) {
      console.warn("API register seller fallback error:", e);
    }

    if (isSupabaseConfigured && supabase) {
      supabase
        .from("sellers")
        .insert(dbPayload)
        .then(({ error }) => {
          if (error) console.error("Error inserting pending seller to Supabase:", error);
          else refreshData();
        });
    }

    return newSeller;
  };

  const deleteSeller = async (sellerId: string): Promise<boolean> => {
    setSellers((prev) => prev.filter((s) => s.id !== sellerId));
    if (currentSeller && currentSeller.id === sellerId) {
      setCurrentSeller(null);
    }

    let deletedViaApi = false;
    try {
      const res = await fetch("/api/sellers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sellerId }),
      });
      if (res.ok) {
        deletedViaApi = true;
        await refreshData();
      }
    } catch (e) {
      console.warn("API delete seller error:", e);
    }

    if (!deletedViaApi && isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("sellers").delete().eq("id", sellerId);
      if (error) {
        console.error("Error deleting seller from Supabase:", error);
        return false;
      }
      await refreshData();
    }
    return true;
  };

  const updateSeller = (sellerId: string, updates: Partial<Seller>) => {
    setSellers((prev) =>
      prev.map((s) => {
        if (s.id === sellerId) {
          const updated = { ...s, ...updates };
          if (currentSeller && currentSeller.id === sellerId) {
            setCurrentSeller(updated);
          }
          return updated;
        }
        return s;
      })
    );

    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.affiliateCode !== undefined) payload.affiliate_code = updates.affiliateCode;
    if (updates.pin !== undefined) payload.pin = updates.pin;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.commissionRate !== undefined)
      payload.commission_rate = updates.commissionRate;
    if (updates.bankInfo) {
      payload.bank_name = updates.bankInfo.bankName;
      payload.account_number = updates.bankInfo.accountNumber;
      payload.account_holder = updates.bankInfo.accountHolder;
    }

    if (Object.keys(payload).length > 0) {
      try {
        fetch("/api/sellers", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: sellerId, updates: payload }),
        }).then(() => refreshData());
      } catch (e) {
        console.warn("API update seller error:", e);
      }

      if (isSupabaseConfigured && supabase) {
        supabase
          .from("sellers")
          .update(payload)
          .eq("id", sellerId)
          .then(({ error }) => {
            if (error) {
              console.error("Error updating seller in Supabase:", error);
            } else {
              refreshData();
            }
          });
      }
    }
  };

  const updateStock = async (newStock: number) => {
    const validStock = Math.max(0, newStock);
    setProduct((prev) => ({
      ...prev,
      stock: validStock,
    }));

    if (typeof window !== "undefined") {
      localStorage.setItem("mewmao_product_stock", validStock.toString());
    }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from("sellers")
        .upsert({
          id: "system-inventory",
          name: "Mewmao Inventory",
          affiliate_code: "SYS_STOCK",
          pin: "000000",
          bottles_sold_count: validStock,
          balance: product.price > 0 ? product.price : 289000,
          status: "system_inventory",
        });
      if (error) {
        console.error("Error saving inventory to Supabase:", error);
      } else {
        await refreshData();
      }
    }
  };

  const requestPayout = (sellerId: string, amount: number): boolean => {
    const seller = sellers.find((s) => s.id === sellerId);
    if (!seller || seller.balance < amount || amount <= 0) return false;

    const newPayout: PayoutRequest = {
      id: `PAY-${Math.floor(100 + Math.random() * 900)}`,
      sellerId: seller.id,
      sellerName: seller.name,
      amount,
      bankInfo: seller.bankInfo,
      status: "pending",
      requestedAt: new Date().toISOString().split("T")[0],
    };

    setPayouts((prev) => [newPayout, ...prev]);
    setSellers((prev) =>
      prev.map((s) => {
        if (s.id === sellerId) {
          const updated = {
            ...s,
            balance: s.balance - amount,
            totalWithdrawn: s.totalWithdrawn + amount,
          };
          if (currentSeller && currentSeller.id === s.id) {
            setCurrentSeller(updated);
          }
          return updated;
        }
        return s;
      })
    );

    if (isSupabaseConfigured && supabase) {
      supabase
        .from("payouts")
        .insert({
          id: newPayout.id,
          seller_id: newPayout.sellerId,
          amount: newPayout.amount,
          bank_name: newPayout.bankInfo.bankName,
          account_number: newPayout.bankInfo.accountNumber,
          account_holder: newPayout.bankInfo.accountHolder,
          status: "pending",
          requested_at: newPayout.requestedAt,
        })
        .then(({ error }) => {
          if (error) console.error("Error inserting payout into Supabase:", error);
        });

      supabase
        .from("sellers")
        .update({
          balance: seller.balance - amount,
          total_withdrawn: seller.totalWithdrawn + amount,
        })
        .eq("id", seller.id)
        .then(({ error }) => {
          if (error)
            console.error("Error updating seller balance in Supabase:", error);
        });
    }

    return true;
  };

  const approvePayout = (payoutId: string) => {
    const today = new Date().toISOString().split("T")[0];
    setPayouts((prev) =>
      prev.map((p) =>
        p.id === payoutId
          ? { ...p, status: "completed", processedAt: today }
          : p
      )
    );

    if (isSupabaseConfigured && supabase) {
      supabase
        .from("payouts")
        .update({ status: "completed" })
        .eq("id", payoutId)
        .then(({ error }) => {
          if (error) console.error("Error approving payout in Supabase:", error);
        });
    }
  };

  const submitB2BInquiry = (
    data: Omit<B2BInquiry, "id" | "status" | "createdAt">
  ) => {
    const newInquiry: B2BInquiry = {
      ...data,
      id: `b2b-${Date.now()}`,
      status: "new",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setB2BInquiries((prev) => [newInquiry, ...prev]);
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
