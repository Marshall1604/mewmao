import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";

export async function GET(request: Request) {
  const isAdmin = verifyAdminSession(request);
  return NextResponse.json({ authenticated: isAdmin });
}

export async function POST() {
  const isProd = process.env.NODE_ENV === "production";
  const cookieHeader = `mewmao_admin_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${
    isProd ? "; Secure" : ""
  }`;

  const response = NextResponse.json({ success: true, authenticated: false });
  response.headers.set("Set-Cookie", cookieHeader);
  return response;
}
