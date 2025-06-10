import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers";
import { ReactNode } from "react";
import { LayoutContent } from "./LayoutContent";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nexus AI - Your Gateway to AI Models",
  description: "Connect with multiple AI models using your own API keys",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <LayoutContent>{children}</LayoutContent>
        </Providers>
      </body>
    </html>
  );
}
