import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "border-border bg-background placeholder:text-muted-foreground focus:border-accent focus:ring-ring/30 flex h-11 w-full rounded-2xl border px-4 text-sm transition outline-none focus:ring-2",
        className,
      )}
      {...props}
    />
  );
});
