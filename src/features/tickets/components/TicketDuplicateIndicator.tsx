import { Layers3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TicketDuplicateIndicatorProps {
  className?: string;
  title?: string;
}

export function TicketDuplicateIndicator({
  className,
  title = "AI flagged this ticket as a likely duplicate.",
}: TicketDuplicateIndicatorProps) {
  return (
    <span
      title={title}
      className={cn(
        "border-warning/35 bg-panel/95 text-warning inline-flex size-5 items-center justify-center rounded-full border shadow-[0_0_20px_rgb(from_var(--warning)_r_g_b/0.18)]",
        className,
      )}
    >
      <Layers3 className="size-3" />
      <span className="sr-only">Likely duplicate</span>
    </span>
  );
}
