"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/authOptions";
import { prisma } from "@/prisma";

import { generateChatTitle } from "../lib/ai-helper/titleGenerator";

export async function getChats() {
  const session = await auth();

  try {
    const chats = await prisma.chat.findMany({
      where: { userId: session?.user?.id, isDeleted: false },
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

export async function createChat({
  attachments,
  title,
  messages
}: {
  title?: string;
  attachments?: { id: string }[];
  messages?: ({ role: "USER"; content: string } | { role: "ASSISTANT"; content: string; modelUsed: string })[];
}) {
  const session = await auth();

  try {
    const chat = await prisma.chat.create({
      data: {
        title: title || "New Chat",
        userId: session?.user?.id || null,
        attachments: attachments
          ? {
              connect: attachments
            }
          : undefined,
        messages: messages
          ? {
              create: messages
            }
          : undefined
      }
    });

    revalidatePath("/");
    return { success: true, chat };
  } catch (error) {
    console.error("Error creating chat:", error);
    return { success: false, error: "Failed to create chat" };
  }
}

export async function saveUserMessage({
  chatId,
  content,
  attachments
}: {
  chatId: string;
  content: string;
  attachments?: { id: string }[];
}) {
  const session = await auth();

  try {
    const message = await prisma.message.create({
      data: {
        chatId,
        role: "USER",
        content,
        userId: session?.user?.id || null,
        attachments: {
          connect: attachments
        }
      }
    });

    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() }
    });

    revalidatePath(`/${chatId}`);
    return { success: true, message };
  } catch (error) {
    console.error("Error saving user message:", error);
    return { success: false, error: "Failed to save user message" };
  }
}

export async function saveAssistantMessage({
  chatId,
  content,
  modelUsed
}: {
  chatId: string;
  content: string;
  modelUsed: string;
}) {
  const session = await auth();

  try {
    const chatExists = await prisma.chat.findUnique({
      where: { id: chatId, isDeleted: false }
    });

    if (!chatExists) {
      console.error("Chat not found:", chatId);
      return { success: false, error: "Chat not found" };
    }

    const message = await prisma.message.create({
      data: {
        chatId,
        role: "ASSISTANT",
        content,
        userId: session?.user?.id || null,
        modelUsed
      }
    });

    await prisma.chat.update({
      where: { id: chatId },
      data: {
        updatedAt: new Date()
      }
    });

    revalidatePath(`/${chatId}`);
    return { success: true, message };
  } catch (error) {
    console.error("Error saving assistant message:", error);
    return { success: false, error: "Failed to save assistant message" };
  }
}

export async function getChatMessages({ chatId, share }: { chatId: string; share?: boolean }) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!share && !userId) {
    return { success: false, error: "User not authenticated" };
  }

  try {
    const chatMessgaes = await prisma.chat.findUnique({
      where: { id: chatId, userId: share ? undefined : userId, isDeleted: false, isShared: share || undefined },
      include: {
        messages: {
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
        }
      }
    });

    if (!chatMessgaes) {
      return { success: false, error: "Chat not found" };
    }

    return { success: true, messages: chatMessgaes.messages || [] };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return { success: false, error: "Failed to fetch messages" };
  }
}

export async function getChatWithMessages({ chatId }: { chatId: string }) {
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

export async function shareChat({ chatId }: { chatId: string }) {
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

export const createChatWithTitle = async ({
  currentInput,
  apiKey,
  openRouter,
  modelUUId,
  attachments
}: {
  currentInput: string;
  apiKey: string;
  openRouter?: boolean;
  modelUUId: string;
  attachments?: { id: string }[];
}) => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "User not authenticated" };
  }

  const title = await generateChatTitle({
    apiKey,
    message: currentInput,
    modelUUId,
    openRouter
  });

  if (!title.success) {
    return { success: false, error: "Failed to generate title" };
  }

  const chat = await prisma.chat.create({
    data: {
      title: title.title,
      userId,
      attachments: { connect: attachments },
      messages: {
        create: [{ role: "USER", content: currentInput }]
      }
    },
    select: {
      id: true,
      title: true,
      updatedAt: true
    }
  });

  if (!chat) {
    return { success: false, error: "Failed to create chat" };
  }

  return { success: true, chat };
};
