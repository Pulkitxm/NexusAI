'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/lib/authOptions'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'

export type UserSettings = Prisma.UserSettingsGetPayload<{
  select: {
    jobTitle: true
    occupation: true
    bio: true
    location: true
    company: true
    website: true
    customFont: true
    theme: true
    fontSize: true
  }
}>

export async function updateUserSettings(data: Partial<UserSettings>) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  await prisma.userSettings.upsert({
    where: {
      userId: session.user.id,
    },
    create: {
      userId: session.user.id,
      ...data,
    },
    update: {
      ...data,
    },
  })

  revalidatePath('/settings')
  return { success: true }
}

export async function getUserSettings() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  const settings = await prisma.userSettings.findUnique({
    where: {
      userId: session.user.id,
    },
    select: {
      jobTitle: true,
      occupation: true,
      bio: true,
      location: true,
      company: true,
      website: true,
      customFont: true,
      theme: true,
      fontSize: true,
    },
  })

  return settings
} 