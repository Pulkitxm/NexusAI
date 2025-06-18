import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("bg-primary/10 animate-pulse rounded-md", className)} {...props} />;
}

function ContentCardSkeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("space-y-4 rounded-lg border p-4", className)} {...props}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-4 w-1/3" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

function FormSkeleton({ className, fields = 3, ...props }: React.ComponentProps<"div"> & { fields?: number }) {
  return (
    <div className={cn("space-y-6", className)} {...props}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  );
}

function ListSkeleton({
  className,
  items = 5,
  showAvatar = true,
  showSubtitle = true,
  ...props
}: React.ComponentProps<"div"> & {
  items?: number;
  showAvatar?: boolean;
  showSubtitle?: boolean;
}) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-lg p-2"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {showAvatar && <Skeleton className="h-10 w-10 rounded-full" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            {showSubtitle && <Skeleton className="h-3 w-1/2" />}
          </div>
        </div>
      ))}
    </div>
  );
}

export { Skeleton, ContentCardSkeleton, FormSkeleton, ListSkeleton };
