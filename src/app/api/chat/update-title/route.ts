import { auth } from "@/lib/authOptions";
import { prisma } from "@/lib/db";

import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId, title } = await req.json();

    if (!chatId || !title) {
      return Response.json({ error: "Missing chatId or title" }, { status: 400 });
    }

    // Update chat title in database
    await prisma.chat.update({
      where: {
        id: chatId,
        userId: session.user.id // Ensure user owns the chat
      },
      data: {
        title: title.slice(0, 100), // Limit title length
        updatedAt: new Date()
      }
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error updating chat title:", error);
    return Response.json({ error: "Failed to update chat title" }, { status: 500 });
  }
}
