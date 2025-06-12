"use server"

import { auth } from "@/lib/authOptions"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createChat() {
  const session = await auth()
  const chat = await prisma.chat.create({
    data: {
      userId: session?.user?.id,
    },
  })
  revalidatePath("/")
  return chat
}

export async function getChat(id: string) {
  const session = await auth()
  const userId = session?.user?.id

  if(!userId) return null
  
  return prisma.chat.findUnique({
    where: { id, userId  },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  })
}

export async function createMessage(chatId: string, role: string, content: string) {
  const session = await auth()
  const userId = session?.user?.id

  if(!userId) return null

  const message = await prisma.message.create({
    data: {
      chatId,
      userId,
      role: role === "USER" ? "USER" : "ASSISTANT",
      content,
    },
  })
  
  revalidatePath(`/${chatId}`)
  return message
}

export async function getUserChats() {
  const session = await auth()
  if (!session?.user?.id) return []
  
  return prisma.chat.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  })
} 