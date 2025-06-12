import { Prisma } from "@prisma/client";

export type Chat = Prisma.ChatGetPayload<{
  select: {
    id: true;
    title: true;
    updatedAt: true;
  };
}>;

export type Message = Prisma.MessageGetPayload<{
  select: {
    id: true;
    role: true;
    content: true;
    createdAt: true;
  };
}>;
