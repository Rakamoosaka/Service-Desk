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
        "border-border bg-input placeholder:text-muted-foreground/90 data-face focus:border-accent text-foreground flex min-h-32 w-full rounded-[18px] border px-4 py-3 text-sm transition outline-none focus:shadow-[0_0_0_1px_var(--accent)]",
        className,
      )}
      {...props}
    />
  );
});
