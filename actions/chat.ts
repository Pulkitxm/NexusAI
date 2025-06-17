"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/authOptions";
import { prisma } from "@/prisma";

export async function getChats() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "User not authenticated" };
  }

  try {
    const chats = await prisma.chat.findMany({
      where: { userId, isDeleted: false },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        updatedAt: true
      }
    });
    return { success: true, chats };
  } catch (error) {
    console.error("Error fetching chats:", error);
    return { success: false, error: "Failed to fetch chats" };
  }
}

export async function updateChatTitle({ chatId, title }: { chatId: string; title: string }) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "User not authenticated" };
  }

  try {
    const chat = await prisma.chat.update({
      where: { id: chatId, userId },
      data: { title }
    });

    if (!chat) {
      return { success: false, error: "Chat not found" };
    }

    revalidatePath(`/${chatId}`);
    return { success: true, chat };
  } catch (error) {
    console.error("Error updating chat title:", error);
    return { success: false, error: "Failed to update chat title" };
  }
}

export async function deleteChat({ chatId }: { chatId: string }) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "User not authenticated" };
  }

  try {
    const chat = await prisma.chat.update({
      where: { id: chatId, userId },
      data: { isDeleted: true }
    });

    if (!chat) {
      return { success: false, error: "Chat not found" };
    }

    revalidatePath(`/${chatId}`);
    return { success: true, chat };
  } catch (error) {
    console.error("Error deleting chat:", error);
    return { success: false, error: "Failed to delete chat" };
  }
}

export async function shareChat(chatId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "User not authenticated" };
  }

  try {
    const chat = await prisma.chat.update({
      where: { id: chatId, userId },
      data: { isShared: true }
    });

    if (!chat) {
      return { success: false, error: "Chat not found" };
    }

    return { success: true, chat };
  } catch (error) {
    console.error("Error sharing chat:", error);
    return { success: false, error: "Failed to share chat" };
  }
}
