"use client";

import { startTransition } from "react";
import type { UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/utils";
import type { TicketInput } from "@/features/tickets/schemas/ticketSchemas";
import {
  TicketTypeBadge,
  TicketTypeIcon,
  typeOptions,
} from "@/features/tickets/components/ticketIntakeForm.shared";

interface TicketTypePickerProps {
  compact: boolean;
  selectedType: TicketInput["type"];
  form: UseFormReturn<TicketInput>;
  onSelectedTypeChange: (type: TicketInput["type"]) => void;
}

export function TicketTypePicker({
  compact,
  selectedType,
  form,
  onSelectedTypeChange,
}: TicketTypePickerProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/8 bg-black/15">
      <div className="grid md:grid-cols-3">
        {typeOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={selectedType === option.value}
            className={cn(
              "focus-visible:ring-ring text-left transition duration-150 ease-out focus-visible:ring-2 focus-visible:outline-none",
              compact ? "px-4 py-4" : "px-5 py-5",
              compact
                ? "border-white/8 md:min-h-36"
                : "border-white/8 md:min-h-42",
              option.value !== typeOptions[0].value
                ? "border-t md:border-t-0 md:border-l"
                : undefined,
              selectedType === option.value
                ? "bg-white/4 ring-1 ring-white/10 ring-inset"
                : "bg-transparent hover:bg-white/3",
            )}
            onClick={() => {
              startTransition(() => {
                onSelectedTypeChange(option.value);
                form.setValue("type", option.value, {
                  shouldValidate: true,
                });
              });
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-muted-foreground">
                  <TicketTypeIcon type={option.value} />
                </span>
                <p
                  className={cn(
                    "font-semibold text-white",
                    compact ? "text-sm" : undefined,
                  )}
                >
                  {option.label}
                </p>
              </div>
              {compact ? null : (
                <TicketTypeBadge type={option.value} compact={compact} />
              )}
            </div>
            <p
              className={cn(
                "text-muted-foreground mt-3 max-w-xs",
                compact ? "text-[13px] leading-6" : "text-sm leading-7",
              )}
            >
              {option.summary}
            </p>
            {compact ? null : (
              <p className="text-muted-foreground/80 mt-5 text-[11px] font-semibold tracking-[0.22em] uppercase">
                {option.value === "bug"
                  ? "Fastest path for breakages"
                  : option.value === "suggestion"
                    ? "Use for improvements"
                    : "Use for lighter observations"}
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
