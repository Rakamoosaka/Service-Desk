"use client";

import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";
import type { TicketInput } from "@/features/tickets/schemas/ticketSchemas";

interface TicketServiceSectionProps {
  compact: boolean;
  form: UseFormReturn<TicketInput>;
  services: Array<{ id: string; name: string; slug: string }>;
  serviceId: string;
  serviceLabel: string;
  serviceHelpText: string;
}

export function TicketServiceSection({
  compact,
  form,
  services,
  serviceId,
  serviceLabel,
  serviceHelpText,
}: TicketServiceSectionProps) {
  if (!services.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-[14px] border border-white/8 bg-black/15",
        compact ? "px-4 py-4 md:px-5 md:py-5" : "px-5 py-5 md:px-6 md:py-6",
      )}
    >
      <div className="space-y-2">
        <Label htmlFor="serviceId">{serviceLabel}</Label>
        <Select
          id="serviceId"
          name="serviceId"
          value={serviceId}
          onChange={(event) =>
            form.setValue("serviceId", event.target.value, {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            })
          }
        >
          <option value="">Application-level ticket</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </Select>
        <p
          className={cn(
            "text-muted-foreground",
            compact ? "text-[13px] leading-5" : "text-sm leading-6",
          )}
        >
          {serviceHelpText}
        </p>
        <p className="text-destructive text-sm">
          {form.formState.errors.serviceId?.message}
        </p>
      </div>
    </div>
  );
}

interface TicketInputFieldsProps {
  compact: boolean;
  form: UseFormReturn<TicketInput>;
  titleLabel: string;
  titlePlaceholder: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
}

export function TicketInputFields({
  compact,
  form,
  titleLabel,
  titlePlaceholder,
  descriptionLabel,
  descriptionPlaceholder,
}: TicketInputFieldsProps) {
  return (
    <>
      <div
        className={cn(
          compact ? "border-t-0" : "border-t border-white/8",
          compact ? "px-4 py-4 md:px-5 md:py-5" : "px-5 py-5 md:px-6 md:py-6",
        )}
      >
        <div className="space-y-2">
          <Label htmlFor="title">{titleLabel}</Label>
          <Input
            id="title"
            {...form.register("title")}
            placeholder={titlePlaceholder}
          />
          <p className="text-destructive text-sm">
            {form.formState.errors.title?.message}
          </p>
        </div>
      </div>

      <div
        className={cn(
          "border-t border-white/8",
          compact ? "px-4 py-4 md:px-5 md:py-5" : "px-5 py-5 md:px-6 md:py-6",
        )}
      >
        <div className="space-y-2">
          <Label htmlFor="description">{descriptionLabel}</Label>
          <Textarea
            id="description"
            {...form.register("description")}
            placeholder={descriptionPlaceholder}
          />
          <p className="text-destructive text-sm">
            {form.formState.errors.description?.message}
          </p>
        </div>
      </div>
    </>
  );
}

interface TicketSubmitSectionProps {
  compact: boolean;
  activeType: TicketInput["type"];
  submitLabel?: string;
  submitButtonClassName?: string;
  isPending: boolean;
}

export function TicketSubmitSection({
  compact,
  activeType,
  submitLabel,
  submitButtonClassName,
  isPending,
}: TicketSubmitSectionProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-t border-white/8 md:flex-row md:items-center md:justify-between",
        compact ? "px-4 py-4 md:px-5 md:py-5" : "px-5 py-5 md:px-6 md:py-6",
      )}
    >
      <p
        className={cn(
          "text-muted-foreground max-w-2xl",
          compact ? "text-[13px] leading-6" : "text-sm leading-7",
        )}
      >
        Requests go straight into the service desk queue with the lane, scope,
        and description you provide here. Priority is assigned automatically
        from the ticket content after submission.
      </p>
      <Button
        type="submit"
        disabled={isPending}
        className={submitButtonClassName}
      >
        {submitLabel ?? `Submit ${activeType}`}
      </Button>
    </div>
  );
}
