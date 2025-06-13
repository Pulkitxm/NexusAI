"use server";

import { auth } from "@/lib/authOptions";
import { prisma } from "@/lib/db";
import { Attachment } from "@/types/chat";

export const addFile = async (attachment: Attachment) => {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const file = await prisma.attachment.create({
    data: {
      name: attachment.fileName,
      url: attachment.url,
      userId: session.user.id
    },
    select: { id: true }
  });
  return file;
};

export const deleteFile = async (name: string, url: string) => {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const file = await prisma.attachment.updateMany({
    where: { name, url, userId: session.user.id },
    data: {
      isDeleted: true
    }
  });
  return file;
};
