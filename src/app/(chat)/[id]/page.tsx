import { getChatMessages } from "@/actions/chat";
import StateDisplay from "@/components/ui/state-display";

import ChatDisplay from "./ChatDisplay";

export default async function page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const chatMessages = await getChatMessages(id);

  if (!chatMessages.success) {
    return (
      <Error>
        <StateDisplay
          type="error"
          title="Failed to Load Chat"
          description={chatMessages.error || "There was a problem loading your chat. Please try again."}
        />
      </Error>
    );
  }

  const { messages } = chatMessages;

  return <ChatDisplay id={id} messages={messages || []} />;
}

function Error({ children }: { children: React.ReactNode }) {
  return <div className="flex grow items-center justify-center">{children}</div>;
}
