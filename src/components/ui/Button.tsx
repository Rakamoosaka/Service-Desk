import { ButtonHTMLAttributes, forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-accent px-5 py-2.5 text-accent-foreground hover:brightness-105",
        secondary:
          "border border-border bg-panel px-5 py-2.5 text-panel-foreground hover:border-accent hover:text-accent",
        ghost:
          "px-4 py-2 text-muted-foreground hover:bg-muted hover:text-foreground",
        danger:
          "bg-destructive px-5 py-2.5 text-destructive-foreground hover:brightness-110",
      },
      size: {
        sm: "h-9",
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
