"use client";

import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

interface AnalyticsSummaryCardProps {
  label: string;
  value: string;
  supporting: string;
  icon: LucideIcon;
}

export function AnalyticsSummaryCard({
  label,
  value,
  supporting,
  icon: Icon,
}: AnalyticsSummaryCardProps) {
  return (
    <Card>
      <CardContent className="space-y-5">
        <div className="text-muted-foreground flex items-center justify-between">
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">
            {label}
          </span>
          <Icon className="size-4.5" />
        </div>
        <div className="space-y-2">
          <p className="display-face data-face text-foreground text-4xl leading-none font-semibold md:text-5xl">
            {value}
          </p>
          <p className="text-muted-foreground text-[13px] leading-5.5">
            {supporting}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
