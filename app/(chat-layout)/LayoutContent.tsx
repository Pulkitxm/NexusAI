"use client";

import { PanelLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useModel } from "@/providers/use-model";
import { useSidebar } from "@/providers/use-sidebar";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const { ModelSwitcher } = useModel();
  const { open, setOpen } = useSidebar();

  return (
    <div className="flex size-full flex-col bg-gray-50 dark:bg-gray-950">
      <header className="border-b bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            {!open && (
              <Button
                variant={"ghost"}
                size={"icon"}
                onClick={() => setOpen(true)}
                className="flex cursor-pointer items-center gap-2"
              >
                <PanelLeft className="h-5 w-5" />
              </Button>
            )}
          </div>

          <div className="flex min-h-10 items-center gap-2">{ModelSwitcher && <ModelSwitcher />}</div>
        </div>
      </header>
      {children}
    </div>
  );
}
