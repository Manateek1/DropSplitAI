import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingCard() {
  return (
    <Card className="border-slate-200">
      <CardContent className="space-y-4 p-5">
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-8 w-32 rounded-xl" />
        <Skeleton className="h-4 w-full rounded-full" />
        <Skeleton className="h-4 w-3/4 rounded-full" />
      </CardContent>
    </Card>
  );
}
