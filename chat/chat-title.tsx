import { Pencil, Share2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/providers/use-sidebar";

export default function ChatTitle({ title, id }: { title: string | null; id: string }) {
  const { openShareModal, openDeleteModal, openRenameModal } = useSidebar();

  if (!title) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant={"ghost"} className="max-w-xs truncate text-sm font-medium select-none">
          {title}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => openRenameModal(id)}>
          <Pencil className="h-3 w-3 text-gray-500 dark:text-gray-400" />
          Rename Chat
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openShareModal(id)}>
          <Share2 className="h-3 w-3 text-gray-500 dark:text-gray-400" />
          Share Chat
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={() => openDeleteModal(id)}>
          <Trash2 className="h-3 w-3 text-gray-500 dark:text-gray-400" />
          Delete Chat
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
