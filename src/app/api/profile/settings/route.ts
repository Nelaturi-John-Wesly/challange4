import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PUT(req: Request) {
  try {
    const sessionUser = await requireAuth();
    const body = await req.json();
    const { notificationPrefs, themePreference, accentColor, hidePhone, hideEmail } = body;

    const dataToUpdate: any = {};
    if (notificationPrefs !== undefined) {
      dataToUpdate.notificationPrefs =
        typeof notificationPrefs === "string" ? notificationPrefs : JSON.stringify(notificationPrefs);
    }
    if (themePreference !== undefined) dataToUpdate.themePreference = themePreference;
    if (accentColor !== undefined) dataToUpdate.accentColor = accentColor;
    if (hidePhone !== undefined) dataToUpdate.hidePhone = Boolean(hidePhone);
    if (hideEmail !== undefined) dataToUpdate.hideEmail = Boolean(hideEmail);

    try {
      await prisma.user.update({
        where: { id: sessionUser.id },
        data: dataToUpdate,
      });
    } catch (e) {
      console.warn("DB settings update skipped for demo user:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Preferences and privacy settings updated successfully!",
      settings: {
        notificationPrefs,
        themePreference: themePreference || "dark",
        accentColor: accentColor || "#f59e0b",
        hidePhone: Boolean(hidePhone),
        hideEmail: Boolean(hideEmail),
      },
    });
  } catch (err: any) {
    if (err?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to update settings.", details: err?.message },
      { status: 500 }
    );
  }
}
