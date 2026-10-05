import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";

interface NotifySellerPayload {
  name: string;
  email?: string;
  phone?: string;
  affiliateCode: string;
  refLink?: string;
  pin: string;
  commissionRatePercent?: number;
  commissionAmountPerBottle?: number;
}

export async function POST(req: Request) {
  try {
    if (!verifyAdminSession(req)) {
      return NextResponse.json(
        { error: "Yêu cầu quyền Quản trị viên để gửi thông báo" },
        { status: 401 }
      );
    }

    const body: NotifySellerPayload = await req.json();
    const {
      name,
      email,
      phone,
      affiliateCode,
      refLink,
      pin,
      commissionRatePercent = 15,
      commissionAmountPerBottle = 43350,
    } = body;

    if (!name || !affiliateCode) {
      return NextResponse.json(
        { error: "Thiếu thông tin tên Seller hoặc mã Affiliate" },
        { status: 400 }
      );
    }

    const hostOrigin = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mewmao.com";
    const finalRefLink = refLink || `${hostOrigin}/?ref=${affiliateCode.toUpperCase()}`;
    const portalUrl = `${hostOrigin}/seller`;

    // Soạn nội dung tin nhắn SMS / Zalo chuẩn
    const smsText = `[Mewmao Distillery] Chúc mừng ${name} đã trở thành Đại Sứ Mewmao!
• Mã Affiliate: ${affiliateCode.toUpperCase()}
• Link giới thiệu (Cookie 30 ngày): ${finalRefLink}
• Mã PIN đăng nhập: ${pin}
• Cổng quản lý doanh số: ${portalUrl}
Chia sẻ link trên để nhận hoa hồng ${commissionRatePercent}% cho mỗi đơn hàng!`;

    let emailResult = {
      sent: false,
      messageId: null as string | null,
      error: null as string | null,
      warning: null as string | null,
    };

    // Nếu có email, tiến hành gửi qua Resend
    if (email && email.trim()) {
      const resendApiKey = process.env.RESEND_API_KEY;
      const fromEmail =
        process.env.RESEND_FROM_EMAIL || "Mewmao Distillery <onboarding@resend.dev>";

      if (!resendApiKey) {
        emailResult.error = "Chưa cấu hình RESEND_API_KEY trong file .env.local";
      } else {

      const emailHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chào mừng Đại Sứ Mewmao Distillery</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181b;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fafafa; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #eaeaea; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
          
          <!-- Header Brand -->
          <tr>
            <td style="padding: 36px 36px 24px; text-align: center; border-bottom: 1px solid #f4f4f5; background-color: #ffffff;">
              <div style="font-size: 11px; letter-spacing: 0.35em; text-transform: uppercase; color: #FF5E00; font-weight: 800; margin-bottom: 8px;">
                Mewmao Distillery
              </div>
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #09090b; letter-spacing: -0.02em;">
                Chào mừng Đại Sứ Đối Tác
              </h1>
              <p style="margin: 8px 0 0; font-size: 13px; color: #71717a;">
                Thông tin kích hoạt tài khoản Affiliate & Cổng quản trị cá nhân
              </p>
            </td>
          </tr>

          <!-- Body Greeting -->
          <tr>
            <td style="padding: 32px 36px 24px;">
              <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #27272a;">
                Xin chào <strong style="color: #09090b;">${name}</strong>,
              </p>
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #52525b;">
                Chúc mừng bạn đã chính thức tham gia mạng lưới Đại Sứ của <strong>Mewmao Distillery</strong>. Hệ thống của chúng tôi đã tạo thành công mã Affiliate và link bán hàng độc quyền dành riêng cho bạn:
              </p>

              <!-- Box Thông Tin Affiliate -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fdfaf6; border: 1.5px solid #fed7aa; border-radius: 14px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding-bottom: 14px; border-bottom: 1px dashed #fdba74;">
                          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #9a3412; font-weight: 700;">
                            MÃ AFFILIATE RIÊNG CỦA BẠN
                          </div>
                          <div style="font-size: 24px; font-family: monospace; font-weight: 900; color: #ea580c; letter-spacing: 0.1em; margin-top: 4px;">
                            ${affiliateCode.toUpperCase()}
                          </div>
                          <div style="font-size: 12px; color: #7c2d12; margin-top: 2px;">
                            (Khách hàng có thể nhập mã này trực tiếp tại ô "MÃ (NẾU CÓ)" khi thanh toán)
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 0; border-bottom: 1px dashed #fdba74;">
                          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #9a3412; font-weight: 700;">
                            LINK GIỚI THIỆU (COOKIE 30 NGÀY)
                          </div>
                          <div style="margin-top: 6px;">
                            <a href="${finalRefLink}" target="_blank" style="display: block; background: #ffffff; padding: 10px 14px; border-radius: 8px; border: 1px solid #fed7aa; font-family: monospace; font-size: 13px; color: #c2410c; text-decoration: none; word-break: break-all; font-weight: bold;">
                              ${finalRefLink}
                            </a>
                          </div>
                          <div style="font-size: 12px; color: #7c2d12; margin-top: 6px;">
                            Bất kỳ khách nào bấm qua link này và đặt mua trong vòng 30 ngày đều tự động tính hoa hồng cho bạn.
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top: 14px;">
                          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td width="50%" valign="top">
                                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #9a3412; font-weight: 700;">
                                  MỨC HOA HỒNG
                                </div>
                                <div style="font-size: 16px; font-weight: 800; color: #09090b; margin-top: 4px;">
                                  ${commissionRatePercent}% <span style="font-size: 12px; font-weight: normal; color: #71717a;">(~${commissionAmountPerBottle.toLocaleString("vi-VN")}đ/chai)</span>
                                </div>
                              </td>
                              <td width="50%" valign="top">
                                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #9a3412; font-weight: 700;">
                                  MÃ PIN ĐĂNG NHẬP
                                </div>
                                <div style="font-size: 18px; font-family: monospace; font-weight: 900; color: #09090b; margin-top: 4px; letter-spacing: 0.15em;">
                                  ${pin}
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Hướng dẫn sử dụng Cổng Seller -->
              <p style="margin: 0 0 16px; font-size: 13px; line-height: 1.6; color: #52525b;">
                Để kiểm tra số lượng click, số đơn hàng phát sinh, số dư hoa hồng tích lũy và gửi yêu cầu rút tiền về tài khoản ngân hàng, bạn hãy truy cập Cổng Seller bất cứ lúc nào bằng mã PIN trên:
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${portalUrl}" target="_blank" style="display: inline-block; background-color: #09090b; color: #ffffff; padding: 14px 32px; border-radius: 12px; font-size: 13px; font-weight: 700; text-decoration: none; text-transform: uppercase; letter-spacing: 0.1em;">
                      Vào Cổng Đại Sứ (/seller) &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #a1a1aa; text-align: center;">
                Lưu ý: Giữ bí mật mã PIN của bạn để đảm bảo an toàn cho tài khoản hoa hồng.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #fafafa; border-top: 1px solid #f4f4f5; text-align: center;">
              <div style="font-size: 11px; color: #71717a; line-height: 1.6;">
                <strong>Mewmao Distillery</strong> &bull; Dòng Rượu Mơ Má Đào Thủ Công Việt Nam<br>
                Hotline hỗ trợ: 0988 888 888 &bull; Website: <a href="https://www.mewmao.com" style="color: #FF5E00; text-decoration: none;">mewmao.com</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      try {
        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [email.trim()],
            subject: `[Mewmao] Chúc mừng Đại Sứ ${name} — Mã Affiliate & Thông tin kích hoạt`,
            html: emailHtml,
          }),
        });

        const resendData = await resendRes.json();

        if (resendRes.ok && resendData.id) {
          emailResult.sent = true;
          emailResult.messageId = resendData.id;
        } else {
          // Bắt các thông báo lỗi đặc thù từ Resend (chưa verify domain)
          if (
            resendData.statusCode === 403 &&
            resendData.message?.includes("verify a domain")
          ) {
            emailResult.error =
              "Tài khoản Resend cần thêm tên miền (domain) tại resend.com/domains để gửi đến tất cả người nhận. Hiện tại đang ở chế độ thử nghiệm (chỉ gửi tới www.junky3@yahoo.com).";
            emailResult.warning = "domain_verification_required";
          } else {
            emailResult.error = resendData.message || "Lỗi khi gửi email qua Resend";
          }
        }
      } catch (err: any) {
        emailResult.error = err.message || "Không thể kết nối đến Resend API";
      }
      }
    }

    // Trả về kết quả tổng hợp
    return NextResponse.json({
      success: true,
      emailSent: emailResult.sent,
      emailError: emailResult.error,
      emailWarning: emailResult.warning,
      messageId: emailResult.messageId,
      recipientEmail: email,
      recipientPhone: phone,
      smsText,
      zaloShareUrl: phone
        ? `https://zalo.me/${phone.replace(/[^0-9]/g, "")}`
        : null,
      smsUri: phone
        ? `sms:${phone.replace(/[^0-9]/g, "")}?body=${encodeURIComponent(smsText)}`
        : null,
    });
  } catch (error: any) {
    console.error("Lỗi API notify-seller:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi xử lý gửi thông báo" },
      { status: 500 }
    );
  }
}
