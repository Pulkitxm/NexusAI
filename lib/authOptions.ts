import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { prisma } from "@/prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      avatar: string;
      settings: {
        customFont?: string;
        theme?: string;
      };
    };
  }
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

const { auth, handlers, signIn, signOut, unstable_update } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET
    })
  ],
  callbacks: {
    signIn: async (param) => {
      const { profile, account, user } = param;
      if (account?.provider !== "google") {
        console.error("Invalid provider");
        return false;
      }

      const email = user?.email || profile?.email;
      const name = user?.name || profile?.name;
      const avatar = (user?.image || profile?.image || "") as string;

      if (!email || typeof email !== "string") {
        console.error("Invalid email");
        return false;
      }

      const dbUser = await prisma.user.findUnique({
        where: {
          email
        }
      });

      if (dbUser) return true;

      await prisma.user.create({
        data: {
          name: name ?? email.split("@")[0],
          email,
          avatar
        }
      });

      return true;
    },
    async session({ session }) {
      if (session.user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email! },
          select: {
            id: true,
            name: true,
            avatar: true,
            settings: {
              select: {
                customFont: true,
                theme: true
              }
            }
          }
        });

        if (!dbUser) throw new Error("User not found");

        session.user.id = dbUser.id.toString();
        session.user.name = dbUser.name ?? "";
        session.user.avatar = dbUser.avatar ?? "";
        session.user.settings = {
          theme: dbUser.settings?.theme === "light" ? "light" : "dark",
          customFont: dbUser.settings?.customFont ?? "inter"
        };
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
      }
      return token;
    }
  },
  session: {
    maxAge: 60 * 60 * 24
  }
});

export { auth, handlers, signIn, signOut, unstable_update };
