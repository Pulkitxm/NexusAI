import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth-provider"
import { KeyProvider } from "@/components/key-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Nexus AI - Your Gateway to AI Models",
  description: "Connect with multiple AI models using your own API keys",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <KeyProvider>
            <SidebarProvider>
              <div className="flex min-h-screen w-full bg-gray-50">
                <AppSidebar />
                <main className="flex-1">{children}</main>
              </div>
              <Toaster />
            </SidebarProvider>
          </KeyProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
