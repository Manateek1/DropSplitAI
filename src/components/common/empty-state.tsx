import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <Card className="border-dashed border-slate-200 bg-slate-50/80 shadow-none">
      <CardContent className="flex flex-col items-start gap-3 p-6">
        <div>
          <h3 className="text-base font-semibold text-slate-950">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}
