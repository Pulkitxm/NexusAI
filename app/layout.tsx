import { Inter } from "next/font/google";
import { ReactNode } from "react";

import { Providers } from "@/providers";

import type { Metadata } from "next";
import type React from "react";

import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nexus AI - Your Gateway to AI Models",
  description: "Connect with multiple AI models using your own API keys"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
