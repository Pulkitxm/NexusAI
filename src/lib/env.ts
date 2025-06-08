import { z } from "zod";

const envSchema = z.object({
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error("Invalid environment variables", env.error);
  process.exit(1);
}

export const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = env.data;
