import { createUploadthing } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

import { auth } from "@/lib/authOptions";

import type { FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const uploadRouter = {
  attachment: f({
    image: {
      maxFileSize: "16MB",
      maxFileCount: 5
    },
    pdf: {
      maxFileSize: "16MB",
      maxFileCount: 5
    }
  })
    .middleware(async () => {
      const user = (await auth())?.user;
      if (!user) throw new UploadThingError("Unauthorized");

      return { userId: user.id };
    })
    .onUploadComplete(() => {
      console.log("Upload complete");
    })
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
