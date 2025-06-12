import { getChatMessages } from "@/actions/chat";
import { redirect } from "next/navigation";
import ChatDisplay from "./ChatDisplay";

export default async function page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const chatMessages = await getChatMessages(id);

  if (!chatMessages.success) {
    return redirect("/new");
  }

  const { messages } = chatMessages;

  return <ChatDisplay id={id} messages={messages || []} />;
}
