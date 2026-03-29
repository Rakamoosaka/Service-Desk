"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

export const DialogOverlay = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(function DialogOverlay({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/26 backdrop-blur-[2px]",
        className,
      )}
      {...props}
    />
  );
});

export const DialogContent = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(function DialogContent({ className, children, ...props }, ref) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-50 w-[min(96vw,1080px)] -translate-x-1/2 -translate-y-1/2 rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,16,20,0.98),rgba(10,16,20,0.94))] shadow-[0_28px_120px_rgba(0,0,0,0.42)] outline-none",
          className,
        )}
        {...props}
      >
        <div className="panel-grid pointer-events-none absolute inset-0 rounded-[30px] opacity-20" />
        <div className="relative">{children}</div>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});

export const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("space-y-3", className)} {...props} />
);

export const DialogTitle = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(function DialogTitle({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn(
        "display-face text-4xl font-semibold tracking-[-0.04em] text-white",
        className,
      )}
      {...props}
    />
  );
});

export const DialogDescription = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(function DialogDescription({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn("text-muted-foreground text-sm leading-7", className)}
      {...props}
    />
  );
});

export function DialogDismissButton({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>) {
  return (
    <DialogPrimitive.Close
      className={cn(
        "border-border bg-muted/45 text-foreground hover:border-accent hover:text-accent focus-visible:ring-ring inline-flex h-10 w-10 items-center justify-center rounded-full border transition focus-visible:ring-2 focus-visible:outline-none",
        className,
      )}
      {...props}
    >
      <X className="size-4" />
      <span className="sr-only">Close dialog</span>
    </DialogPrimitive.Close>
  );
}
