"use client";

import { SidebarTrigger } from "@/components/sidebar";
import { useModel } from "@/providers/model-provider";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const { ModelSwitcher } = useModel();

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      <header className="border-b bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <SidebarTrigger main />
          </div>

          <div className="flex items-center gap-2">
            <ModelSwitcher />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
