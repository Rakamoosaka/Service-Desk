import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionIntroProps {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  className?: string;
}

export function SectionIntro({
  eyebrow,
  title,
  description,
  actions,
  className,
}: SectionIntroProps) {
  return (
    <div
      className={cn(
        "border-border/80 flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
    >
      <div className="max-w-3xl space-y-4">
        {eyebrow ? (
          <p className="text-accent text-[11px] font-semibold tracking-[0.34em] uppercase">
            {eyebrow}
          </p>
        ) : null}
        <div className="space-y-3">
          <h1 className="display-face text-foreground max-w-4xl text-4xl leading-[0.95] font-semibold tracking-[-0.03em] md:text-6xl">
            {title}
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm leading-7 md:text-base">
            {description}
          </p>
        </div>
      </div>
      {actions ? (
        <div className="flex items-center gap-3 self-start lg:self-end">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
