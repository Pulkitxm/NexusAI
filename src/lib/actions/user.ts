"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/authOptions";
import { prisma } from "@/lib/db";

export type UserSettings = Prisma.UserSettingsGetPayload<{
  select: {
    jobTitle: true;
    occupation: true;
    bio: true;
    location: true;
    company: true;
    website: true;
    customFont: true;
    theme: true;
  };
}>;

export async function updateUserSettings(data: Partial<UserSettings>) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  await prisma.userSettings.upsert({
    where: {
      userId: session.user.id
    },
    create: {
      userId: session.user.id,
      ...data
    },
    update: {
      ...data
    }
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function getUserSettings() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const settings = await prisma.userSettings.findUnique({
    where: {
      userId: session.user.id
    },
    select: {
      jobTitle: true,
      occupation: true,
      bio: true,
      location: true,
      company: true,
      website: true,
      customFont: true,
      theme: true
    }
  });

  return settings;
}

export async function getGlobalMemories() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const memories = await prisma.globalMemory.findMany({
    where: {
      userId: session.user.id,
      isDeleted: false
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return memories;
}

export async function addGlobalMemory(content: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  await prisma.globalMemory.create({
    data: {
      userId: session.user.id,
      content
    }
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function deleteGlobalMemory(memoryId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  await prisma.globalMemory.update({
    where: {
      id: memoryId,
      userId: session.user.id
    },
    data: {
      isDeleted: true
    }
  });

  revalidatePath("/settings");
  return { success: true };
}
