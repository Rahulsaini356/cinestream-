import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors";

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    // Fetch user to confirm existence & get email for OTP cleanup
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete user and cascading records (Watchlist, Reviews, OTPs)
    await prisma.$transaction([
      prisma.oTP.deleteMany({ where: { email: user.email } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Account and associated personal data deleted successfully.",
    });
  } catch (error) {
    return handleApiError("DeleteAccount", error, "Failed to delete account.");
  }
}
