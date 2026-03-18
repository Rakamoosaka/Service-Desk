import { forwardRef, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "border-border bg-background placeholder:text-muted-foreground focus:border-accent focus:ring-ring/30 flex min-h-32 w-full rounded-3xl border px-4 py-3 text-sm transition outline-none focus:ring-2",
        className,
      )}
      {...props}
    />
  );
});
