import { Skeleton } from "@/components/ui/skeleton";

export function MessageSkeleton() {
  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="flex-1 space-y-4 p-4">
        <div className="mx-auto max-w-4xl">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`flex items-start gap-3 ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
              {i % 2 === 0 && <Skeleton className="h-10 w-10 rounded-full" />}
              <div className={`space-y-2 ${i % 2 === 0 ? "" : "items-end"}`}>
                {i % 2 === 0 && <Skeleton className="h-4 w-24" />}
                <Skeleton className={`h-16 ${i % 2 === 0 ? "w-[280px]" : "w-[240px]"} rounded-lg`} />
              </div>
              {i % 2 === 1 && <Skeleton className="h-10 w-10 rounded-full" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
