import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LogInButton } from "@/lib/auth-buttons";
import { auth } from "@/lib/authOptions";

import SettingsPage from "./settings-page";

export default async function layout() {
  const session = await auth();

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
  return <SettingsPage session={session} />;
}
