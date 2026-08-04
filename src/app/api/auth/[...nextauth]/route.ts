import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

import { NextRequest } from "next/server";

export async function GET(req: NextRequest, ctx: any) {
  const host = req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "https";
  if (host) {
    process.env.NEXTAUTH_URL = `${proto}://${host}`;
  }
  return NextAuth(req, ctx, authOptions);
}

export async function POST(req: NextRequest, ctx: any) {
  const host = req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "https";
  if (host) {
    process.env.NEXTAUTH_URL = `${proto}://${host}`;
  }
  return NextAuth(req, ctx, authOptions);
}

