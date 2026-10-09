import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/server-supabase";

export async function GET(request: Request) {
  try {
    if (!verifyAdminSession(request)) {
      return NextResponse.json(
        { success: false, error: "Yêu cầu đăng nhập tài khoản Quản trị viên" },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdmin();

    const [sellersRes, ordersRes, payoutsRes, vouchersRes, b2bRes] =
      await Promise.all([
        supabase
          .from("sellers")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("payouts")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("vouchers")
          .select("*")
          .order("created_at", { ascending: false }),
        (async () => {
          try {
            return await supabase
              .from("b2b_inquiries")
              .select("*")
              .order("created_at", { ascending: false });
          } catch {
            return { data: [] };
          }
        })(),
      ]);

    // Extract inventory info from system-inventory record
    let stock = 500;
    let price = 289000;
    const allDbSellers = sellersRes.data || [];
    const systemInv = allDbSellers.find((s: any) => s.id === "system-inventory");
    if (systemInv) {
      if (typeof systemInv.bottles_sold_count === "number") {
        stock = systemInv.bottles_sold_count;
      }
      if (Number(systemInv.balance) > 0) {
        price = Number(systemInv.balance);
      }
    }

    // Filter real human sellers for admin
    const humanSellers = allDbSellers
      .filter(
        (s: any) =>
          s.id !== "system-inventory" &&
          s.id !== "system-vouchers" &&
          s.status !== "system" &&
          s.status !== "system_inventory" &&
          s.status !== "system_vouchers"
      )
      .map((s: any) => {
        const sOrders = (ordersRes.data || []).filter(
          (o: any) =>
            o.affiliate_code &&
            o.affiliate_code.trim().toUpperCase() === (s.affiliate_code || "").trim().toUpperCase()
        );
        const ordersBottles = sOrders.reduce(
          (sum: number, o: any) =>
            sum +
            (Array.isArray(o.items)
              ? o.items.reduce((acc: number, it: any) => acc + (Number(it.quantity) || 1), 0)
              : 0),
          0
        );
        const ordersCommission = sOrders.reduce(
          (sum: number, o: any) => sum + (Number(o.seller_commission) || 0),
          0
        );
        const totalWithdrawn = Number(s.total_withdrawn) || 0;
        const bottlesSoldCount = sOrders.length > 0 ? ordersBottles : (Number(s.bottles_sold_count) || 0);
        const ordersCount = sOrders.length > 0 ? sOrders.length : (Number(s.orders_count) || 0);
        const totalEarned = sOrders.length > 0 ? ordersCommission : (Number(s.total_earned) || 0);
        const balance = Math.max(
          0,
          (sOrders.length > 0 ? totalEarned : (Number(s.balance) || 0)) - totalWithdrawn
        );

        return {
          id: s.id,
          name: s.name,
          email: s.email || "",
          phone: s.phone || "",
          role: "seller",
          status: s.status || "active",
          affiliateCode: s.affiliate_code,
          pin: s.pin, // Admin can view/edit PIN
          commissionRate:
            s.commission_rate !== null && s.commission_rate !== undefined
              ? Number(s.commission_rate)
              : 0.15,
          promoDiscountPerBottle: Number(s.discount_percent) || 0,
          balance,
          totalWithdrawn,
          totalEarned,
          ordersCount,
          bottlesSoldCount,
          clicksCount: 0,
          createdAt: s.created_at ? s.created_at.split("T")[0] : "",
          bankInfo: {
            bankName: s.bank_name || "",
            accountNumber: s.account_number || "",
            accountHolder: s.account_holder || "",
          },
        };
      });


    const orders = (ordersRes.data || []).map((o: any) => ({
      id: o.id,
      customerName: o.customer_name,
      customerPhone: o.customer_phone,
      customerAddress: o.customer_address,
      customerNote: o.customer_note || undefined,
      items: Array.isArray(o.items) ? o.items : [],
      subtotalAmount: Number(o.subtotal) || 0,
      discountAmount: Number(o.discount_amount) || 0,
      totalAmount: Number(o.total_amount) || 0,
      paymentMethod: o.payment_method || "cod",
      paymentStatus: o.payment_status || "unpaid",
      status: o.status || "pending",
      affiliateCode: o.affiliate_code || undefined,
      voucherCode: o.customer_note?.match(/\[Voucher:\s*([A-Za-z0-9_-]+)/)?.[1] || undefined,
      sellerCommission: Number(o.seller_commission) || 0,
      createdAt: o.created_at || "",
    }));

    const payouts = (payoutsRes.data || []).map((p: any) => ({
      id: p.id,
      sellerId: p.seller_id,
      amount: Number(p.amount) || 0,
      bankName: p.bank_name || "",
      accountNumber: p.account_number || "",
      accountHolder: p.account_holder || "",
      status: p.status || "pending",
      requestedAt: p.requested_at || (p.created_at ? p.created_at.split("T")[0] : ""),
    }));

    let vouchers = (vouchersRes.data || []).map((v: any) => ({
      id: v.id,
      code: v.code,
      name: v.name,
      discountType: v.discount_type || "fixed",
      discountValue: Number(v.discount_value) || 0,
      startDate: v.start_date || undefined,
      endDate: v.end_date || undefined,
      minOrderValue: Number(v.min_order_value) || 0,
      usageLimit: typeof v.usage_limit === "number" ? v.usage_limit : undefined,
      usedCount: Number(v.used_count) || 0,
      status: v.status || "active",
      createdAt: v.created_at || "",
    }));

    // If vouchers table was empty, check fallback
    if (vouchers.length === 0) {
      const fallbackVoucherRow = allDbSellers.find((s: any) => s.id === "system-vouchers");
      if (fallbackVoucherRow && fallbackVoucherRow.discount_code) {
        try {
          const parsed = JSON.parse(fallbackVoucherRow.discount_code);
          if (Array.isArray(parsed)) vouchers = parsed;
        } catch {}
      }
    }

    const b2bInquiries = (b2bRes.data || []).map((b: any) => ({
      id: b.id,
      businessName: b.business_name,
      contactPerson: b.contact_person,
      email: b.email,
      phone: b.phone,
      businessType: b.business_type,
      estimatedVolume: b.estimated_volume,
      message: b.message,
      status: b.status || "new",
      createdAt: b.created_at ? b.created_at.split("T")[0] : "",
    }));

    return NextResponse.json({
      success: true,
      data: {
        sellers: humanSellers,
        orders,
        payouts,
        vouchers,
        b2bInquiries,
        stock,
        price,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
