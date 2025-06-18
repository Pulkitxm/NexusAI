import { cn } from "@/lib/utils";

interface SkeletonProps extends React.ComponentProps<"div"> {
  variant?: "default" | "text" | "avatar" | "button" | "card";
  lines?: number;
}

function Skeleton({ className, variant = "default", lines = 1, ...props }: SkeletonProps) {
  const baseClasses = cn(
    "relative overflow-hidden rounded-md bg-gradient-to-r from-muted/50 via-muted to-muted/50",
    "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite]",
    "before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
    "after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent",
    "after:animate-pulse"
  );

  const variantClasses = {
    default: "h-4",
    text: "h-4",
    avatar: "h-10 w-10 rounded-full",
    button: "h-9 w-20",
    card: "h-32 w-full"
  };

  if (lines > 1 && variant === "text") {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(baseClasses, variantClasses[variant])}
            style={{
              animationDelay: `${index * 150}ms`,
              width: `${Math.random() * 30 + 70}%`
            }}
            {...props}
          />
        ))}
      </div>
    );
  }

  return <div data-slot="skeleton" className={cn(baseClasses, variantClasses[variant], className)} {...props} />;
}

// Content Card Skeleton
function ContentCardSkeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("space-y-4 rounded-lg border p-4", className)} {...props}>
      <div className="flex items-center gap-3">
        <Skeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <Skeleton variant="text" lines={3} />
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}

// Form Skeleton
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
        <Skeleton variant="button" />
        <Skeleton variant="button" />
      </div>
    </div>
  );
}

// List Skeleton
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
          {showAvatar && <Skeleton variant="avatar" />}
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
