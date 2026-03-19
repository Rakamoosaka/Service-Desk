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
          "border-border bg-input data-face focus:border-accent text-foreground h-11 w-full appearance-none rounded-xl border px-4 pr-10 text-sm transition outline-none focus:shadow-[0_0_0_1px_var(--accent),0_0_22px_rgb(from_var(--accent)_r_g_b_/_0.16)]",
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
