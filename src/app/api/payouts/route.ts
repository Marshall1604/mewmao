import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/server-supabase";
import { verifyAdminSession, getSellerSession } from "@/lib/auth";

// GET payouts - strictly protected for Admin
export async function GET(request: Request) {
  try {
    if (!verifyAdminSession(request)) {
      return NextResponse.json(
        { error: "Yêu cầu quyền Quản trị viên để xem danh sách rút tiền" },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("payouts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST create payout request - Seller or Admin
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sellerId, amount } = body;
    const sellerSession = getSellerSession(request);
    const isAdmin = verifyAdminSession(request);

    // Validate that requester is this seller or Admin
    if (!isAdmin && (!sellerSession || sellerSession.sellerId !== sellerId)) {
      return NextResponse.json(
        { error: "Yêu cầu đăng nhập tài khoản Seller để rút tiền" },
        { status: 401 }
      );
    }

    const parsedAmount = Math.round(Number(amount));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: "Số tiền rút không hợp lệ" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Check seller balance
    const { data: seller, error: sellerErr } = await supabase
      .from("sellers")
      .select("*")
      .eq("id", sellerId)
      .single();

    if (sellerErr || !seller) {
      return NextResponse.json({ error: "Không tìm thấy thông tin Seller" }, { status: 404 });
    }

    const currentBalance = Number(seller.balance) || 0;
    if (currentBalance < parsedAmount) {
      return NextResponse.json(
        { error: `Số dư khả dụng không đủ (Hiện có: ${currentBalance.toLocaleString("vi-VN")}₫)` },
        { status: 400 }
      );
    }

    const newBalance = currentBalance - parsedAmount;
    const payoutId = `pay-${Date.now()}`;
    const todayStr = new Date().toISOString().split("T")[0];

    // Deduct balance and create payout
    await supabase
      .from("sellers")
      .update({ balance: newBalance })
      .eq("id", sellerId);

    const payoutRecord = {
      id: payoutId,
      seller_id: sellerId,
      amount: parsedAmount,
      bank_name: seller.bank_name || "Chưa cập nhật",
      account_number: seller.account_number || "Chưa cập nhật",
      account_holder: seller.account_holder || seller.name,
      status: "pending",
      requested_at: todayStr,
      created_at: new Date().toISOString(),
    };

    const { data: createdPayout, error: payoutErr } = await supabase
      .from("payouts")
      .insert(payoutRecord)
      .select()
      .single();

    if (payoutErr) {
      return NextResponse.json({ error: payoutErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: payoutRecord.id,
        sellerId: payoutRecord.seller_id,
        amount: payoutRecord.amount,
        bankName: payoutRecord.bank_name,
        accountNumber: payoutRecord.account_number,
        accountHolder: payoutRecord.account_holder,
        status: payoutRecord.status,
        requestedAt: payoutRecord.requested_at,
        newBalance,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH approve payout - strictly protected for Admin
export async function PATCH(request: Request) {
  try {
    if (!verifyAdminSession(request)) {
      return NextResponse.json(
        { error: "Yêu cầu quyền Quản trị viên để duyệt rút tiền" },
        { status: 401 }
      );
    }

    const { payoutId, status = "completed" } = await request.json();
    if (!payoutId) {
      return NextResponse.json({ error: "Missing payoutId" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: payout, error: getErr } = await supabase
      .from("payouts")
      .select("*")
      .eq("id", payoutId)
      .single();

    if (getErr || !payout) {
      return NextResponse.json({ error: "Không tìm thấy yêu cầu rút tiền" }, { status: 404 });
    }

    // Update payout status
    const { error: updateErr } = await supabase
      .from("payouts")
      .update({ status })
      .eq("id", payoutId);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // If completed, update seller total_withdrawn
    if (status === "completed") {
      const { data: seller } = await supabase
        .from("sellers")
        .select("total_withdrawn")
        .eq("id", payout.seller_id)
        .single();

      if (seller) {
        const newWithdrawn = (Number(seller.total_withdrawn) || 0) + Number(payout.amount);
        await supabase
          .from("sellers")
          .update({ total_withdrawn: newWithdrawn })
          .eq("id", payout.seller_id);
      }
    }

    return NextResponse.json({ success: true, payoutId, status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
