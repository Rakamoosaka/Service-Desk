import { LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Label({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "text-foreground text-[11px] font-semibold tracking-[0.22em] uppercase",
        className,
      )}
      {...props}
    />
  );
}
