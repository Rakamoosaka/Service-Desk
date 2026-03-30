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
        "border-border bg-input placeholder:text-muted-foreground/90 data-face focus:border-accent text-foreground flex h-11 w-full rounded-xl border px-4 text-sm transition outline-none focus:shadow-[0_0_0_1px_var(--accent)]",
        className,
      )}
      {...props}
    />
  );
});
