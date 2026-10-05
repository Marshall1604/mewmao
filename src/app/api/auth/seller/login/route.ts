import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/server-supabase";
import { signToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { pin, affiliateCode } = await request.json();

    if (!pin || typeof pin !== "string" || pin.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập mã PIN" },
        { status: 400 }
      );
    }

    const cleanPin = pin.trim();
    const supabase = getSupabaseAdmin();

    let query = supabase.from("sellers").select("*").eq("pin", cleanPin);

    if (affiliateCode && typeof affiliateCode === "string" && affiliateCode.trim()) {
      query = query.ilike("affiliate_code", affiliateCode.trim());
    }

    // Exclude system rows
    query = query
      .neq("id", "system-inventory")
      .neq("id", "system-vouchers");

    const { data: matchedSellers, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (!matchedSellers || matchedSellers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Mã PIN không đúng hoặc chưa được Admin cấp. Vui lòng thử lại!",
        },
        { status: 401 }
      );
    }

    const seller = matchedSellers[0];

    if (seller.status === "pending") {
      return NextResponse.json(
        {
          success: false,
          error: "Tài khoản của bạn đang chờ Admin duyệt. Mewmao sẽ liên hệ lại với bạn sớm nhất!",
        },
        { status: 403 }
      );
    }

    if (seller.status === "inactive") {
      return NextResponse.json(
        {
          success: false,
          error: "Tài khoản đối tác này hiện đang tạm ngưng hoạt động.",
        },
        { status: 403 }
      );
    }

    // Create secure seller token (30 days)
    const token = signToken(
      {
        role: "seller",
        sub: seller.id,
        affiliateCode: seller.affiliate_code,
      },
      30 * 24 * 3600
    );

    const isProd = process.env.NODE_ENV === "production";
    const cookieHeader = `mewmao_seller_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${
      30 * 24 * 3600
    }${isProd ? "; Secure" : ""}`;

    // Sanitized seller data (ABSOLUTELY NO PIN EXPOSED)
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
      balance: Number(seller.balance) || 0,
      totalWithdrawn: Number(seller.total_withdrawn) || 0,
      totalEarned: Number(seller.total_earned) || 0,
      ordersCount: Number(seller.orders_count) || 0,
      bottlesSoldCount: Number(seller.bottles_sold_count) || 0,
      bankInfo: {
        bankName: seller.bank_name || "",
        accountNumber: seller.account_number || "",
        accountHolder: seller.account_holder || "",
      },
      createdAt: seller.created_at ? seller.created_at.split("T")[0] : "",
    };

    const response = NextResponse.json({
      success: true,
      seller: sanitizedSeller,
      token,
    });
    response.headers.set("Set-Cookie", cookieHeader);
    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
