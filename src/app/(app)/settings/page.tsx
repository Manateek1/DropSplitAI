import { SettingsPanels } from "@/components/settings/settings-panels";
import { getDashboardData } from "@/lib/data";

export default async function SettingsPage() {
  const data = await getDashboardData();
  return <SettingsPanels dashboardData={data} />;
}
