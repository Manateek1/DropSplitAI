import { SetupRequired } from "@/components/common/setup-required";
import { ChatExperience } from "@/components/chat/chat-experience";
import { getDashboardData } from "@/lib/data";
import { getProductionConfigMessage, hasProductionConfigError } from "@/lib/env";

export default async function ChatPage() {
  if (hasProductionConfigError) {
    return <SetupRequired message={getProductionConfigMessage()} />;
  }

  const data = await getDashboardData();
  return <ChatExperience initialMessages={data.recentMessages} dashboardData={data} />;
}
