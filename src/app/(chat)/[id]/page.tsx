import { TriangleAlert } from "lucide-react";

import { getChatMessages } from "@/actions/chat";

import ChatDisplay from "./ChatDisplay";

export default async function page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const chatMessages = await getChatMessages(id);

  if (!chatMessages.success) {
    return (
      <div className="flex grow items-center justify-center">
        <div className="flex items-center gap-2 rounded-md border border-red-500 bg-red-500/10 p-4">
          <TriangleAlert className="h-4 w-4 text-red-500" />
          <h1>{chatMessages.error}</h1>
        </div>
      </div>
    );
  }

  const { messages } = chatMessages;

  return <ChatDisplay id={id} messages={messages || []} />;
}
