import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function PricingCard({
  name,
  priceLabel,
  cadence,
  description,
  features,
  ctaLabel,
  highlighted,
  onClick,
  disabled,
}: {
  name: string;
  priceLabel: string;
  cadence?: string;
  description: string;
  features: readonly string[];
  ctaLabel: string;
  highlighted?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <Card
      className={cn(
        "border-slate-200 shadow-[0_24px_80px_-54px_rgba(15,23,42,0.24)]",
        highlighted && "border-cyan-200 bg-[radial-gradient(circle_at_top,_rgba(20,216,230,0.18),_transparent_50%),white]",
      )}
    >
      <CardHeader>
        <CardTitle className="text-xl tracking-tight text-slate-950">{name}</CardTitle>
        <div className="flex items-end gap-1">
          <span className="text-4xl font-semibold tracking-tight text-slate-950">{priceLabel}</span>
          {cadence ? <span className="pb-1 text-sm text-slate-500">{cadence}</span> : null}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <ul className="space-y-3 text-sm text-slate-600">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 text-cyan-600" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          onClick={onClick}
          disabled={disabled}
          className={cn(
            "w-full rounded-2xl",
            highlighted ? "bg-slate-950 text-white hover:bg-slate-800" : "bg-slate-100 text-slate-950 hover:bg-slate-200",
          )}
        >
          {ctaLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
