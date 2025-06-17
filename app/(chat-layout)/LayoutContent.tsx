"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { useModel } from "@/providers/use-model";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const { ModelSwitcher } = useModel();

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <header className="border-b bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
          </div>

          <div className="flex min-h-10 items-center gap-2">{ModelSwitcher && <ModelSwitcher />}</div>
        </div>
      </header>
      {children}
    </div>
  );
}
