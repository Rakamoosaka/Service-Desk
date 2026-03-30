import { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]",
  {
    variants: {
      tone: {
        neutral: "border-border bg-muted text-muted-foreground",
        info: "border-info/30 bg-info/12 text-info",
        warning: "border-warning/30 bg-warning/12 text-warning",
        danger: "border-destructive/35 bg-destructive/12 text-destructive",
        success: "border-accent/35 bg-accent/12 text-accent",
        accent: "border-accent/35 bg-accent/12 text-accent",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
