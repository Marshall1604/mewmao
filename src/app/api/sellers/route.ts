import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/server-supabase";
import { verifyAdminSession, getSellerSession } from "@/lib/auth";

// GET sellers
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const refCode = url.searchParams.get("ref");
    const supabase = getSupabaseAdmin();

    // Case 1: Public referral code verification (?ref=XYZ)
    if (refCode) {
      const cleanRef = refCode.trim().toUpperCase();
      const { data, error } = await supabase
        .from("sellers")
        .select("id, name, affiliate_code, discount_percent, status")
        .ilike("affiliate_code", cleanRef)
        .neq("id", "system-inventory")
        .neq("id", "system-vouchers");

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const activeSeller = (data || []).find(
        (s: any) => s.status !== "pending" && s.status !== "inactive"
      );

      if (activeSeller) {
        return NextResponse.json({
          valid: true,
          seller: {
            id: activeSeller.id,
            name: activeSeller.name,
            affiliateCode: activeSeller.affiliate_code,
            promoDiscountPerBottle: Number(activeSeller.discount_percent) || 0,
          },
        });
      } else {
        return NextResponse.json({ valid: false }, { status: 404 });
      }
    }

    // Case 2: Full sellers list - Admin authentication REQUIRED!
    if (!verifyAdminSession(request)) {
      return NextResponse.json(
        {
          error: "Yêu cầu quyền Quản trị viên để xem danh sách toàn bộ Seller",
        },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("sellers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST create a new seller
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = getSupabaseAdmin();
    const isAdmin = verifyAdminSession(request);

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: "Vui lòng nhập họ và tên của Seller" },
        { status: 400 }
      );
    }

    if (body.affiliate_code) {
      body.affiliate_code = body.affiliate_code.trim().toUpperCase();
      // Check duplicate affiliate code
      const { data: existing } = await supabase
        .from("sellers")
        .select("id, name, affiliate_code")
        .ilike("affiliate_code", body.affiliate_code)
        .maybeSingle();

      if (existing) {
        return NextResponse.json(
          {
            error: `Mã Affiliate "${body.affiliate_code}" đã tồn tại (thuộc về "${existing.name}"). Vui lòng chọn mã khác!`,
          },
          { status: 400 }
        );
      }
    }

    // If not Admin, enforce 'pending' status for self-registration
    if (!isAdmin) {
      body.status = "pending";
      body.balance = 0;
      body.total_earned = 0;
      body.total_withdrawn = 0;
      body.bottles_sold_count = 0;
      body.orders_count = 0;
      body.commission_rate = 0.15;
      if (!body.pin) {
        body.pin = Math.floor(100000 + Math.random() * 900000).toString();
      }
    }

    const { data, error } = await supabase
      .from("sellers")
      .insert(body)
      .select();

    if (error) {
      console.error("API create seller error:", error);
      if (error.code === "23505") {
        return NextResponse.json(
          {
            error: `Mã Affiliate "${body.affiliate_code || ""}" đã được sử dụng. Vui lòng chọn mã khác!`,
          },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


// PATCH update seller
export async function PATCH(request: Request) {
  try {
    const { id, updates } = await request.json();
    if (!id || !updates) {
      return NextResponse.json({ error: "Missing id or updates" }, { status: 400 });
    }

    const isAdmin = verifyAdminSession(request);
    const sellerSession = getSellerSession(request);

    // Authorization check
    if (!isAdmin) {
      // If seller is logged in, they can only update their own bank info
      if (sellerSession && sellerSession.sellerId === id) {
        const allowedKeys = ["bank_name", "account_number", "account_holder", "email", "phone"];
        const sanitizedUpdates: any = {};
        for (const k of allowedKeys) {
          if (k in updates) sanitizedUpdates[k] = updates[k];
        }
        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase
          .from("sellers")
          .update(sanitizedUpdates)
          .eq("id", id)
          .select();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true, data });
      }

      return NextResponse.json(
        { error: "Yêu cầu quyền Quản trị viên để cập nhật thông tin Seller" },
        { status: 401 }
      );
    }

    // Admin has full update permission
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("sellers")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) {
      console.error("API update seller error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE seller - strictly protected for Admin
export async function DELETE(request: Request) {
  try {
    if (!verifyAdminSession(request)) {
      return NextResponse.json(
        { error: "Yêu cầu quyền Quản trị viên để xóa Seller" },
        { status: 401 }
      );
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Missing seller id" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("sellers").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
