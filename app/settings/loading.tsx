import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SettingsSkeleton({ notFullPage }: { notFullPage?: boolean }) {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
      <div
        className={`mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${
          notFullPage ? "hidden" : ""
        }`}
      >
        <div className="space-y-1">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      <div className="w-full">
        <div className={notFullPage ? "" : "grid gap-8 lg:grid-cols-[240px_1fr]"}>
          <div className={`${notFullPage ? "hidden" : ""} lg:sticky lg:top-8 lg:self-start`}>
            <div className="grid h-auto w-full grid-cols-2 gap-1 p-1 lg:grid-cols-1 lg:p-0">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>

          <div className={`${notFullPage ? "w-full" : ""} min-w-0`}>
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <Skeleton className="mb-2 h-7 w-48" />
                <Skeleton className="h-5 w-full" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
            <div className="border-border mt-6 flex justify-end border-t pt-6">
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsSkeletonMain() {
  return <SettingsSkeleton />;
}
