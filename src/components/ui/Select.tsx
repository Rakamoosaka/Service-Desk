import { SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ children, className, ...props }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "border-border bg-background focus:border-accent focus:ring-ring/30 h-11 w-full appearance-none rounded-2xl border px-4 pr-10 text-sm transition outline-none focus:ring-2",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="text-muted-foreground pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2" />
    </div>
  );
});
