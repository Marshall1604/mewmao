import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/server-supabase";
import { verifyAdminSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    if (!verifyAdminSession(request)) {
      return NextResponse.json(
        { error: "Yêu cầu quyền Quản trị viên để xem đối tác B2B" },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("b2b_inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ data: [] });
    }
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      businessName,
      contactPerson,
      email,
      phone,
      businessType,
      estimatedVolume,
      message,
    } = body;

    if (!businessName || !contactPerson || !phone) {
      return NextResponse.json(
        { error: "Vui lòng nhập tên doanh nghiệp, người liên hệ và số điện thoại" },
        { status: 400 }
      );
    }

    const id = `b2b-${Date.now()}`;
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const inquiryRecord = {
      id,
      business_name: businessName,
      contact_person: contactPerson,
      email: email || null,
      phone,
      business_type: businessType || "other",
      estimated_volume: estimatedVolume || "under_100",
      message: message || null,
      status: "new",
      created_at: now.toISOString(),
    };

    const supabase = getSupabaseAdmin();

    // 1. Save to Supabase (catch error if table b2b_inquiries is not yet created in SQL editor)
    let dbSuccess = false;
    try {
      const { error: dbErr } = await supabase
        .from("b2b_inquiries")
        .insert(inquiryRecord);
      if (!dbErr) dbSuccess = true;
    } catch {}

    // 2. Always send email alert to admin via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const fromEmail =
          process.env.RESEND_FROM_EMAIL ||
          "Mewmao Distillery <onboarding@resend.dev>";
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: ["admin@mewmao.vn", "onboarding@resend.dev"],
            subject: `[B2B Partner] Đăng ký đối tác mới: ${businessName} (${contactPerson})`,
            html: `
              <h2>Yêu cầu hợp tác B2B mới từ Website</h2>
              <p><strong>Doanh nghiệp:</strong> ${businessName}</p>
              <p><strong>Người đại diện:</strong> ${contactPerson}</p>
              <p><strong>Số điện thoại:</strong> ${phone}</p>
              <p><strong>Email:</strong> ${email || "Không cung cấp"}</p>
              <p><strong>Loại hình:</strong> ${businessType}</p>
              <p><strong>Sản lượng dự kiến:</strong> ${estimatedVolume}</p>
              <p><strong>Ghi chú:</strong> ${message || "Không có"}</p>
              <p><em>Thời gian gửi: ${formattedDate}</em></p>
            `,
          }),
        }).catch(() => {});
      } catch {}
    }

    return NextResponse.json({
      success: true,
      data: {
        id,
        businessName,
        contactPerson,
        email,
        phone,
        businessType,
        estimatedVolume,
        message,
        status: "new",
        createdAt: formattedDate,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
