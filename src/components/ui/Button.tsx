import { ButtonHTMLAttributes, forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl border text-sm font-semibold tracking-[0.08em] uppercase transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "border-accent bg-accent px-5 py-2.5 text-accent-foreground shadow-[0_0_24px_rgb(from_var(--accent)_r_g_b_/_0.22)] hover:-translate-y-px hover:shadow-[0_0_30px_rgb(from_var(--accent)_r_g_b_/_0.3)]",
        secondary:
          "border-border bg-panel px-5 py-2.5 text-panel-foreground hover:-translate-y-px hover:border-accent hover:text-accent",
        ghost:
          "border-transparent px-4 py-2 text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground",
        danger:
          "border-destructive bg-destructive px-5 py-2.5 text-destructive-foreground shadow-[0_0_20px_rgb(from_var(--destructive)_r_g_b_/_0.16)] hover:-translate-y-px hover:shadow-[0_0_28px_rgb(from_var(--destructive)_r_g_b_/_0.22)]",
      },
      size: {
        sm: "h-9 px-3 text-[11px]",
        md: "h-11",
        lg: "h-12 px-6",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { asChild, className, variant, size, type = "button", ...props },
    ref,
  ) {
    const Component = asChild ? Slot : "button";

    return (
      <Component
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
