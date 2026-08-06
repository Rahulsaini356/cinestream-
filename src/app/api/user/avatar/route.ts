import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new Response("Missing userId", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { image: true },
    });

    if (!user || !user.image) {
      return new Response("Not found", { status: 404 });
    }

    // If it's a Base64 data URL, decode and serve it as a binary image
    if (user.image.startsWith("data:")) {
      const matches = user.image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.*)$/);
      if (matches && matches.length === 3) {
        const contentType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, "base64");
        
        return new Response(buffer, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=86400, must-revalidate",
          },
        });
      }
    }

    // Otherwise, redirect to the external URL (e.g. Google avatar)
    return NextResponse.redirect(new URL(user.image, req.url));
  } catch (error) {
    console.error("Avatar API error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
