"use server";

import { auth } from "@/lib/authOptions";
import { prisma } from "@/lib/db";
import { Attachment } from "@/types/chat";

export const addFiles = async (
  attachments: (Attachment & {
    uploadThingKey: string;
  })[]
) => {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const files = await prisma.attachment.createManyAndReturn({
    data: attachments.map((attachment) => ({
      name: attachment.name,
      url: attachment.url,
      size: attachment.size,
      userId: session.user.id,
      uploadThingKey: attachment.uploadThingKey
    })),
    select: { id: true, name: true, url: true, size: true, uploadThingKey: true }
  });

  return files;
};

export const deleteFile = async (fileId: string) => {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const file = await prisma.attachment.update({
    where: { id: fileId, userId: session.user.id },
    data: {
      isDeleted: true
    }
  });
  return file;
};

export const getFiles = async () => {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const files = await prisma.attachment.findMany({
    where: { userId: session.user.id, isDeleted: false },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, url: true, size: true, createdAt: true }
  });

  return files;
};
