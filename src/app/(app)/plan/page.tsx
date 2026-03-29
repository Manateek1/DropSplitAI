import { WeeklyPlanView } from "@/components/plan/weekly-plan-view";
import { getDashboardData } from "@/lib/data";

export default async function PlanPage() {
  const data = await getDashboardData();
  return <WeeklyPlanView plan={data.weeklyPlan} />;
}
