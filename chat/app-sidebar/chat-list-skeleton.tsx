"use client";

import { ListSkeleton } from "@/components/ui/skeleton";

export function ChatListSkeleton() {
  return (
    <div className="px-2">
      <ListSkeleton items={5} showAvatar={true} showSubtitle={true} className="space-y-2" />
    </div>
  );
}
