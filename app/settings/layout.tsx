import { ArrowLeft, LogIn, LogOutIcon } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { LogInButton, LogOutButton } from "@/lib/auth-buttons";
import { auth } from "@/lib/authOptions";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  await new Promise((res) => setTimeout(res, 5000));

  const pathName = (await headers()).get("x-current-path");

  if (pathName === "/settings") {
    redirect("/settings/account");
  }

  if (!session) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <LogInButton>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-950"
          >
            <LogIn className="h-4 w-4" />
            Login to access settings
          </Button>
        </LogInButton>
      </div>
    );
  }
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-purple-600 md:text-4xl dark:text-purple-400">
            Settings
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">Manage your account settings and preferences.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-950"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </Link>
          <LogOutButton>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
            >
              <LogOutIcon className="h-4 w-4" />
              Logout
            </Button>
          </LogOutButton>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <div className="lg:sticky lg:top-8 lg:self-start">
          <nav className="grid gap-1">
            <Link href="/settings/account">
              <Button variant="ghost" className="w-full justify-start px-4 py-3 text-sm font-medium">
                Account
              </Button>
            </Link>
            <Link href="/settings/customization">
              <Button variant="ghost" className="w-full justify-start px-4 py-3 text-sm font-medium">
                Customization
              </Button>
            </Link>
            <Link href="/settings/memory">
              <Button variant="ghost" className="w-full justify-start px-4 py-3 text-sm font-medium">
                Memory
              </Button>
            </Link>
            <Link href="/settings/attachments">
              <Button variant="ghost" className="w-full justify-start px-4 py-3 text-sm font-medium">
                Attachments
              </Button>
            </Link>
          </nav>
        </div>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
