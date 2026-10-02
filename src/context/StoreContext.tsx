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
  placeOrder: (data: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    customerNote?: string;
    quantity: number;
    paymentMethod: "vietqr" | "cod";
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  deleteOrder: (orderId: string) => Promise<boolean>;
  refreshData: () => Promise<void>;
  requestPayout: (sellerId: string, amount: number) => boolean;
  approvePayout: (payoutId: string) => void;
  addSeller: (data: {
    name: string;
    email: string;
    phone?: string;
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

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en"); // Default English as requested
  const [product, setProduct] = useState<Product>(SIGNATURE_PRODUCT);
  const [cartQuantity, setCartQuantity] = useState<number>(1);
  const [isQuickBuyOpen, setIsQuickBuyOpen] = useState<boolean>(false);
  const [isAgeVerified, setIsAgeVerified] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>("guest");
  const [sellers, setSellers] = useState<Seller[]>(INITIAL_SELLERS);
  const [currentSeller, setCurrentSeller] = useState<Seller | null>(null);
  const [activeRefCode, setActiveRefCode] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [payouts, setPayouts] = useState<PayoutRequest[]>(INITIAL_PAYOUTS);
  const [b2bInquiries, setB2BInquiries] = useState<B2BInquiry[]>(INITIAL_B2B_INQUIRIES);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);

  // Initialize from LocalStorage and Cookie to handle URL ref code
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load saved language (default 'en')
    const savedLang = localStorage.getItem("mewmao_lang") as Language;
    if (savedLang === "vi" || savedLang === "en") {
      setLanguageState(savedLang);
    } else {
      setLanguageState("en");
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

    // Check URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get("ref");
    if (ref) {
      const cleanRef = ref.trim().toUpperCase();
      const matchedSeller = sellers.find(
        (s) => s.affiliateCode.toUpperCase() === cleanRef
      );
      if (matchedSeller) {
        setActiveRefCode(matchedSeller.affiliateCode);
        // Lưu Cookie 30 ngày và LocalStorage
        setAffiliateCookie(matchedSeller.affiliateCode, 30);
        localStorage.setItem("mewmao_active_ref", matchedSeller.affiliateCode);

        // Record a click for this seller
        setSellers((prev) =>
          prev.map((s) =>
            s.id === matchedSeller.id
              ? { ...s, clicksCount: s.clicksCount + 1 }
              : s
          )
        );
      }
    } else {
      // Đọc từ Cookie (30 ngày) trước, sau đó từ localStorage
      const cookieRef = getAffiliateCookie();
      const savedRef = cookieRef || localStorage.getItem("mewmao_active_ref");
      if (savedRef) {
        const cleanSavedRef = savedRef.trim().toUpperCase();
        setActiveRefCode(cleanSavedRef);
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
        // Extract system inventory if present
        const systemInventory = dbSellers.find(
          (row: any) => row.id === "system-inventory" || row.status === "system"
        );
        if (systemInventory) {
          const syncedStock = Number(systemInventory.bottles_sold_count);
          if (!isNaN(syncedStock) && syncedStock >= 0) {
            setProduct((prev) => ({
              ...prev,
              stock: syncedStock,
              price: Number(systemInventory.balance) || prev.price,
            }));
            if (typeof window !== "undefined") {
              localStorage.setItem("mewmao_product_stock", syncedStock.toString());
            }
          }
        }

        // Filter out system row so sellers only has real sellers
        const humanSellers = dbSellers.filter(
          (row: any) => row.id !== "system-inventory" && row.status !== "system"
        );

        const mappedSellers: Seller[] = humanSellers.map((row: any) => ({
          id: row.id,
          name: row.name,
          email: row.email || "",
          phone: row.phone || "",
          role: "seller",
          affiliateCode: row.affiliate_code,
          pin: row.pin,
          commissionRate: Number(row.commission_rate) || 0.15,
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
      localStorage.setItem("mewmao_lang", lang);
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

  const placeOrder = (data: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    customerNote?: string;
    quantity: number;
    paymentMethod: "vietqr" | "cod";
  }): Order => {
    const subtotalAmount = product.price * data.quantity;
    const discountAmount = 0; // Bỏ giảm giá Promo: khách mua đúng giá niêm yết
    let commission = 0;
    let sellerToCredit: Seller | null = null;

    // Nhận diện Seller qua activeRefCode hoặc Cookie / localStorage
    const refCode =
      activeRefCode ||
      getAffiliateCookie() ||
      (typeof window !== "undefined" ? localStorage.getItem("mewmao_active_ref") : null);

    if (refCode) {
      sellerToCredit =
        sellers.find(
          (s) => s.affiliateCode.toUpperCase() === refCode.trim().toUpperCase()
        ) || null;
      if (sellerToCredit) {
        commission = Math.round(subtotalAmount * sellerToCredit.commissionRate);
      }
    }

    const totalAmount = subtotalAmount;
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
      discountAmount: 0,
      totalAmount,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentMethod === "vietqr" ? "paid" : "unpaid",
      status: "pending",
      affiliateCode: sellerToCredit ? sellerToCredit.affiliateCode : undefined,
      sellerCommission: commission,
      createdAt: formattedDate,
    };

    // Update orders
    setOrders((prev) => [newOrder, ...prev]);

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
      setSellers((prev) =>
        prev.map((s) => {
          if (s.id === sellerToCredit!.id) {
            const updated = {
              ...s,
              balance: s.balance + commission,
              totalEarned: s.totalEarned + commission,
              ordersCount: s.ordersCount + 1,
              bottlesSoldCount: (s.bottlesSoldCount || 0) + data.quantity,
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

    // Sync to Supabase
    if (isSupabaseConfigured && supabase) {
      // 1. Sync inventory decrement
      supabase
        .from("sellers")
        .update({ bottles_sold_count: remainingStock })
        .eq("id", "system-inventory")
        .then(({ error }) => {
          if (error) console.error("Error updating inventory in Supabase:", error);
        });

      // 2. Insert order to DB
      const orderDbPayload = {
        id: newOrder.id,
        customer_name: newOrder.customerName,
        customer_phone: newOrder.customerPhone,
        customer_address: newOrder.customerAddress,
        customer_note: newOrder.customerNote || null,
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

      if (sellerToCredit) {
        supabase
          .from("sellers")
          .update({
            balance: sellerToCredit.balance + commission,
            total_earned: sellerToCredit.totalEarned + commission,
            orders_count: sellerToCredit.ordersCount + 1,
            bottles_sold_count:
              (sellerToCredit.bottlesSoldCount || 0) + data.quantity,
          })
          .eq("id", sellerToCredit.id)
          .then(({ error }) => {
            if (error) {
              console.error("Error updating seller in Supabase:", error);
            } else {
              refreshData();
            }
          });
      }
    }

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
    );

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
    setOrders((prev) => prev.filter((ord) => ord.id !== orderId));

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
      status: "active",
    };

    try {
      fetch("/api/sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dbPayload),
      }).then(() => refreshData());
    } catch (e) {
      console.warn("API add seller error:", e);
    }

    if (isSupabaseConfigured && supabase) {
      supabase
        .from("sellers")
        .insert(dbPayload)
        .then(({ error }) => {
          if (error) {
            console.error("Error inserting seller into Supabase:", error);
          } else {
            refreshData();
          }
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
    if (updates.pin !== undefined) payload.pin = updates.pin;
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
          balance: product.price,
          status: "system",
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
        placeOrder,
        updateOrderStatus,
        deleteOrder,
        refreshData,
        requestPayout,
        approvePayout,
        addSeller,
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
