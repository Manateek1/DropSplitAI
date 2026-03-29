import { BillingPanel } from "@/components/billing/billing-panel";
import { getDashboardData } from "@/lib/data";

export default async function BillingPage() {
  const data = await getDashboardData();
  return <BillingPanel dashboardData={data} />;
}
