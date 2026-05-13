import { SetupRequired } from "@/components/common/setup-required";
import { SwimLogView } from "@/components/log/swim-log-view";
import { getDashboardData } from "@/lib/data";
import { getProductionConfigMessage, hasProductionConfigError } from "@/lib/env";

export default async function LogPage() {
  if (hasProductionConfigError) {
    return <SetupRequired message={getProductionConfigMessage()} />;
  }

  const data = await getDashboardData();
  return <SwimLogView dashboardData={data} />;
}
