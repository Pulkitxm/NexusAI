import { getChatMessages } from "@/actions/chat";
import ChatDisplay from "./ChatDisplay";
import { TriangleAlert } from "lucide-react";

export default async function page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const chatMessages = await getChatMessages(id);

  console.log(chatMessages);

  if (!chatMessages.success) {
    return (
      <div className="flex grow justify-center items-center">
        <div className="border border-red-500 p-4 rounded-md bg-red-500/10 flex gap-2 items-center">
          <TriangleAlert className="w-4 h-4 text-red-500" />
          <h1>{chatMessages.error}</h1>
        </div>
      </div>
    );
  }

  const { messages } = chatMessages;

  return <ChatDisplay id={id} messages={messages || []} />;
}
