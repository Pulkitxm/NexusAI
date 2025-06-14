"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/authOptions";
import { prisma } from "@/lib/db";

export async function createChat(title?: string) {
  const session = await auth();

  try {
    const chat = await prisma.chat.create({
      data: {
        title: title || "New Chat",
        userId: session?.user?.id || null
      }
    });

    revalidatePath("/");
    return { success: true, chat };
  } catch (error) {
    console.error("Error creating chat:", error);
    return { success: false, error: "Failed to create chat" };
  }
}

export async function saveUserMessage(chatId: string, content: string, tempId?: string) {
  const session = await auth();

  try {
    const message = await prisma.message.create({
      data: {
        chatId,
        role: "USER",
        content,
        userId: session?.user?.id || null
      }
    });

    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() }
    });

    revalidatePath(`/${chatId}`);
    return { success: true, message, tempId };
  } catch (error) {
    console.error("Error saving user message:", error);
    return { success: false, error: "Failed to save user message", tempId };
  }
}

export async function saveAssistantMessage(chatId: string, content: string, attachments: string[]) {
  const session = await auth();

  try {
    const chatExists = await prisma.chat.findUnique({
      where: { id: chatId, isDeleted: false },
      select: {
        messages: {
          select: {
            id: true
          },
          take: 1,
          orderBy: {
            createdAt: "desc"
          }
        }
      }
    });

    const lastMessageId = chatExists?.messages[0]?.id;

    if (lastMessageId) {
      await prisma.message.update({
        where: { id: lastMessageId },
        data: { attachments: { connect: attachments.map((attachment) => ({ id: attachment })) } }
      });
    }

    if (!chatExists) {
      console.error("Chat not found:", chatId);
      return { success: false, error: "Chat not found" };
    }

    const message = await prisma.message.create({
      data: {
        chatId,
        role: "ASSISTANT",
        content,
        userId: session?.user?.id || null
      }
    });

    await prisma.chat.update({
      where: { id: chatId },
      data: {
        updatedAt: new Date(),
        attachments: {
          connect: attachments.map((attachment) => ({ id: attachment }))
        }
      }
    });

    revalidatePath(`/${chatId}`);
    return { success: true, message };
  } catch (error) {
    console.error("Error saving assistant message:", error);
    return { success: false, error: "Failed to save assistant message" };
  }
}

export async function getChatMessages(chatId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "User not authenticated" };
  }

  try {
    const messages = await prisma.message.findMany({
      where: { chatId, userId, chat: { isDeleted: false } },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        role: true,
        content: true,
        createdAt: true,
        attachments: {
          select: {
            id: true,
            url: true,
            name: true,
            size: true
          }
        }
      }
    });

    if (!messages) {
      return { success: false, error: "Chat not found" };
    }

    return { success: true, messages };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return { success: false, error: "Failed to fetch messages" };
  }
}

export async function getChatWithMessages(chatId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "User not authenticated" };
  }

  try {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId, userId, isDeleted: false },
      include: {
        messages: {
          orderBy: { createdAt: "asc" }
        }
      }
    });

    if (!chat) {
      return { success: false, error: "Chat not found" };
    }

    return { success: true, chat };
  } catch (error) {
    console.error("Error fetching chat with messages:", error);
    return { success: false, error: "Failed to fetch chat" };
  }
}

export async function getUserChats() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "User not authenticated" };
  }

  try {
    const chats = await prisma.chat.findMany({
      where: { userId, isDeleted: false },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" }
        },
        _count: {
          select: { messages: true }
        }
      }
    });

    return { success: true, chats };
  } catch (error) {
    console.error("Error fetching chats:", error);
    return { success: false, error: "Failed to fetch chats" };
  }
}

export async function updateChatTitle(chatId: string, title: string) {
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

export async function deleteChat(chatId: string) {
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
