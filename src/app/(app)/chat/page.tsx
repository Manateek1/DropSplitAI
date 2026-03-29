import { ChatExperience } from "@/components/chat/chat-experience";
import { getDashboardData } from "@/lib/data";

export default async function ChatPage() {
  const data = await getDashboardData();
  return <ChatExperience initialMessages={data.recentMessages} dashboardData={data} />;
}
