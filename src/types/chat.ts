import { Prisma } from "@prisma/client";

export type Chat = Prisma.ChatGetPayload<{
    select:{
      id: true,
      title: true,
      updatedAt: true,
    },
  }>;