import { NextResponse } from "next/server";
import { getSellerSession } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/server-supabase";

export async function GET(request: Request) {
  try {
    const session = getSellerSession(request);
    if (!session) {
      return NextResponse.json({ authenticated: false });
    }

    const supabase = getSupabaseAdmin();

    const { data: seller, error } = await supabase
      .from("sellers")
      .select("*")
      .eq("id", session.sellerId)
      .single();

    if (error || !seller) {
      return NextResponse.json({ authenticated: false });
    }

    // Fetch this seller's orders
    const { data: dbOrders } = await supabase
      .from("orders")
      .select("*")
      .ilike("affiliate_code", seller.affiliate_code)
      .order("created_at", { ascending: false });

    // Fetch this seller's payouts
    const { data: dbPayouts } = await supabase
      .from("payouts")
      .select("*")
      .eq("seller_id", seller.id)
      .order("created_at", { ascending: false });

    const ordersBottles = (dbOrders || []).reduce(
      (sum: number, o: any) =>
        sum +
        (Array.isArray(o.items)
          ? o.items.reduce((acc: number, it: any) => acc + (Number(it.quantity) || 1), 0)
          : 0),
      0
    );
    const ordersCommission = (dbOrders || []).reduce(
      (sum: number, o: any) => sum + (Number(o.seller_commission) || 0),
      0
    );
    const totalWithdrawn = Number(seller.total_withdrawn) || 0;
    const bottlesSoldCount =
      dbOrders && dbOrders.length > 0 ? ordersBottles : (Number(seller.bottles_sold_count) || 0);
    const ordersCount =
      dbOrders && dbOrders.length > 0 ? dbOrders.length : (Number(seller.orders_count) || 0);
    const totalEarned =
      dbOrders && dbOrders.length > 0 ? ordersCommission : (Number(seller.total_earned) || 0);
    const balance = Math.max(
      0,
      (dbOrders && dbOrders.length > 0 ? totalEarned : (Number(seller.balance) || 0)) - totalWithdrawn
    );

    const sanitizedSeller = {
      id: seller.id,
      name: seller.name,
      email: seller.email || "",
      phone: seller.phone || "",
      role: "seller",
      status: seller.status || "active",
      affiliateCode: seller.affiliate_code,
      commissionRate:
        seller.commission_rate !== null && seller.commission_rate !== undefined
          ? Number(seller.commission_rate)
          : 0.15,
      balance,
      totalWithdrawn,
      totalEarned,
      ordersCount,
      bottlesSoldCount,
      bankInfo: {
        bankName: seller.bank_name || "",
        accountNumber: seller.account_number || "",
        accountHolder: seller.account_holder || "",
      },
      createdAt: seller.created_at ? seller.created_at.split("T")[0] : "",
    };


    const mappedOrders = (dbOrders || []).map((o: any) => ({
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
      sellerCommission: Number(o.seller_commission) || 0,
      createdAt: o.created_at || "",
    }));

    const mappedPayouts = (dbPayouts || []).map((p: any) => ({
      id: p.id,
      sellerId: p.seller_id,
      amount: Number(p.amount) || 0,
      bankName: p.bank_name || "",
      accountNumber: p.account_number || "",
      accountHolder: p.account_holder || "",
      status: p.status || "pending",
      requestedAt: p.requested_at || (p.created_at ? p.created_at.split("T")[0] : ""),
    }));

    return NextResponse.json({
      authenticated: true,
      seller: sanitizedSeller,
      orders: mappedOrders,
      payouts: mappedPayouts,
    });
  } catch (err: any) {
    return NextResponse.json({ authenticated: false, error: err.message }, { status: 500 });
  }
}

export async function POST() {
  const isProd = process.env.NODE_ENV === "production";
  const cookieHeader = `mewmao_seller_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${
    isProd ? "; Secure" : ""
  }`;

  const response = NextResponse.json({ success: true, authenticated: false });
  response.headers.set("Set-Cookie", cookieHeader);
  return response;
}
