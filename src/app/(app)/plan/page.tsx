import { SetupRequired } from "@/components/common/setup-required";
import { WeeklyPlanView } from "@/components/plan/weekly-plan-view";
import { getDashboardData } from "@/lib/data";
import { getProductionConfigMessage, hasProductionConfigError } from "@/lib/env";

export default async function PlanPage() {
  if (hasProductionConfigError) {
    return <SetupRequired message={getProductionConfigMessage()} />;
  }

  const data = await getDashboardData();
  return <WeeklyPlanView plan={data.weeklyPlan} />;
}
