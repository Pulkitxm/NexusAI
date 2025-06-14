import { Prisma } from "@prisma/client";
import { z } from "zod";

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

export const validateAttachment = z.array(
  z.object({
    id: z.string().min(1),
    size: z.number().min(1),
    fileName: z.string().min(1),
    url: z.string().min(1),
    uploaded: z.boolean(),
    uploadProgress: z.number().min(0).max(100),
    uploadThingKey: z.string().min(1)
  })
);
export type Attachment = z.infer<typeof validateAttachment>[number];
