"use client";

import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

type InfoTooltipProps = {
  content: string;
  label?: string;
  align?: "left" | "right";
  className?: string;
};

export function InfoTooltip({
  content,
  label = "More information",
  align = "left",
  className,
}: InfoTooltipProps) {
  return (
    <span className={cn("group relative inline-flex", className)}>
      <button
        type="button"
        aria-label={label}
        className="border-border bg-muted/35 text-muted-foreground focus-visible:ring-ring inline-flex size-7 items-center justify-center rounded-full border transition hover:border-white/15 hover:text-white focus-visible:ring-2 focus-visible:outline-none"
      >
        <Info className="size-3.5" />
      </button>
      <span
        role="tooltip"
        className={cn(
          "border-border bg-panel text-muted-foreground pointer-events-none absolute top-full z-30 mt-2 hidden w-72 rounded-2xl border px-3 py-2.5 text-[12px] leading-5 shadow-[0_18px_48px_rgba(0,0,0,0.28)] group-focus-within:block group-hover:block",
          align === "right" ? "right-0" : "left-0",
        )}
      >
        {content}
      </span>
    </span>
  );
}
