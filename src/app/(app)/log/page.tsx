import { SwimLogView } from "@/components/log/swim-log-view";
import { getDashboardData } from "@/lib/data";

export default async function LogPage() {
  const data = await getDashboardData();
  return <SwimLogView dashboardData={data} />;
}
