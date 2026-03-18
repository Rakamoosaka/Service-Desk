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
        "flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
    >
      <div className="max-w-2xl space-y-3">
        {eyebrow ? (
          <p className="text-accent text-xs font-semibold tracking-[0.28em] uppercase">
            {eyebrow}
          </p>
        ) : null}
        <div className="space-y-2">
          <h1 className="display-face text-foreground text-4xl leading-none font-semibold tracking-tight md:text-5xl">
            {title}
          </h1>
          <p className="text-muted-foreground max-w-xl text-sm leading-6 md:text-base">
            {description}
          </p>
        </div>
      </div>
      {actions ? (
        <div className="flex items-center gap-3">{actions}</div>
      ) : null}
    </div>
  );
}
