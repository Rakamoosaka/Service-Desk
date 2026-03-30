import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "surface-shadow border-border bg-panel text-panel-foreground relative overflow-hidden rounded-[14px] border",
        className,
      )}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 md:p-7", className)} {...props} />;
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-2 p-6 pb-0 md:p-7 md:pb-0", className)}
      {...props}
    />
  );
}

export function CardEyebrow({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-muted-foreground text-[11px] font-semibold tracking-[0.28em] uppercase",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "display-face text-xl font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-muted-foreground text-sm", className)} {...props} />
  );
}
