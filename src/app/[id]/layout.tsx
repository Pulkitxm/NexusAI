"use client";

import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/sidebar";
import { AI_MODELS } from "@/lib/models";
import { ModelProvider, useModel } from "@/providers/model-provider";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { selectedModel, ModelSwitcher } = useModel();
  const selectedModelInfo = AI_MODELS.find((m) => m.id === selectedModel);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      <header className="border-b bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <div>
                {selectedModelInfo && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge className={` text-xs py-0 px-1.5`}>
                      <selectedModelInfo.icon className="mr-1 text-[10px]" />
                      {selectedModelInfo.name}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
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

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ModelProvider>
      <LayoutContent>{children}</LayoutContent>
    </ModelProvider>
  );
}
