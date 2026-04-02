"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
  ticketInputSchema,
  type TicketInput,
} from "@/features/tickets/schemas/ticketSchemas";
import {
  Card,
  CardContent,
  CardDescription,
  CardEyebrow,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { fetchJson } from "@/lib/query/fetchJson";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import {
  TicketInputFields,
  TicketServiceSection,
  TicketSubmitSection,
} from "@/features/tickets/components/TicketIntakeSections";
import { TicketTypePicker } from "@/features/tickets/components/TicketTypePicker";
import {
  ticketTypeCardClass,
  ticketTypeTone,
  type TicketIntakeFormProps,
} from "@/features/tickets/components/ticketIntakeForm.shared";

export function TicketIntakeForm({
  applicationId,
  services = [],
  defaultServiceId = "",
  fixedType,
  eyebrow = "Intake",
  title = "Submit a ticket",
  description = "Every submission is accepted immediately. Priority is scored automatically on create, while AI lane changes stay in admin review.",
  submitLabel,
  titleLabel = "Title",
  titlePlaceholder = "Summarize the issue or request",
  descriptionLabel = "Description",
  descriptionPlaceholder = "Include context, reproduction steps, or the impact on your work.",
  serviceLabel = "Service",
  serviceHelpText = "Select a specific service if the issue is isolated to one microservice.",
  submitButtonClassName,
  className,
  compact = false,
  headerAddon,
  hideTypeBadge = false,
  onSuccess,
}: TicketIntakeFormProps) {
  const [selectedType, setSelectedType] = useState<TicketInput["type"]>(
    fixedType ?? "feedback",
  );
  const activeType = fixedType ?? selectedType;
  const showTypePicker = !fixedType;

  const form = useForm<TicketInput>({
    resolver: zodResolver(ticketInputSchema),
    defaultValues: {
      appId: applicationId,
      serviceId: defaultServiceId,
      type: fixedType ?? "feedback",
      title: "",
      description: "",
    },
  });
  const serviceId = useWatch({
    control: form.control,
    name: "serviceId",
  });

  const createMutation = useMutation({
    mutationFn: (values: TicketInput) =>
      fetchJson("/api/tickets", {
        method: "POST",
        body: JSON.stringify(values),
      }),
    onSuccess: () => {
      toast.success("Ticket submitted");
      form.reset({
        appId: applicationId,
        serviceId: defaultServiceId,
        type: activeType,
        title: "",
        description: "",
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <Card
      className={cn(
        "rounded-[14px] shadow-none after:hidden",
        fixedType ? ticketTypeCardClass(fixedType) : undefined,
        compact
          ? "[&_input]:text-sm [&_label]:text-[13px] [&_label]:font-medium [&_label]:tracking-normal [&_label]:normal-case [&_textarea]:text-sm"
          : undefined,
        className,
      )}
    >
      <CardHeader className={compact ? "gap-1.5" : undefined}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div
            className={cn(
              eyebrow || title || description ? "space-y-2" : "space-y-0",
            )}
          >
            {eyebrow ? <CardEyebrow>{eyebrow}</CardEyebrow> : null}
            {title ? (
              <CardTitle className={compact ? "text-lg" : undefined}>
                {title}
              </CardTitle>
            ) : null}
            {description ? (
              <CardDescription
                className={compact ? "text-[13px] leading-6" : undefined}
              >
                {description}
              </CardDescription>
            ) : null}
            {headerAddon ? <div className="pt-1">{headerAddon}</div> : null}
          </div>
          {hideTypeBadge ? null : (
            <Badge
              tone={ticketTypeTone(activeType)}
              className={cn("shadow-none", compact ? "text-[11px]" : undefined)}
            >
              {activeType}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className={compact ? "space-y-4" : "space-y-5"}>
        {showTypePicker ? (
          <TicketTypePicker
            compact={compact}
            selectedType={selectedType}
            form={form}
            onSelectedTypeChange={setSelectedType}
          />
        ) : null}

        <form
          className={compact ? "space-y-0" : "space-y-4"}
          onSubmit={form.handleSubmit((values) =>
            createMutation.mutate({
              ...values,
              type: activeType,
            }),
          )}
        >
          <TicketServiceSection
            compact={compact}
            form={form}
            services={services}
            serviceId={serviceId ?? ""}
            serviceLabel={serviceLabel}
            serviceHelpText={serviceHelpText}
          />

          <TicketInputFields
            compact={compact}
            form={form}
            titleLabel={titleLabel}
            titlePlaceholder={titlePlaceholder}
            descriptionLabel={descriptionLabel}
            descriptionPlaceholder={descriptionPlaceholder}
          />

          <TicketSubmitSection
            compact={compact}
            activeType={activeType}
            submitLabel={submitLabel}
            submitButtonClassName={submitButtonClassName}
            isPending={createMutation.isPending}
          />
        </form>
      </CardContent>
    </Card>
  );
}
