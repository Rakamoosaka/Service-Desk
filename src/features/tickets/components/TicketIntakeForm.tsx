"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  ticketInputSchema,
  type TicketInput,
} from "@/features/tickets/schemas/ticketSchemas";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardEyebrow,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { fetchJson } from "@/lib/query/fetchJson";
import { cn } from "@/lib/utils";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";

const typeOptions: Array<{
  value: TicketInput["type"];
  label: string;
  summary: string;
}> = [
  {
    value: "feedback",
    label: "Feedback",
    summary: "Share what is working well or what feels rough around the edges.",
  },
  {
    value: "suggestion",
    label: "Suggestion",
    summary: "Request a workflow improvement or a missing capability.",
  },
  {
    value: "bug",
    label: "Bug",
    summary: "Report a broken flow, unexpected behavior, or runtime defect.",
  },
];

interface TicketIntakeFormProps {
  applicationId: string;
  services?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  defaultServiceId?: string;
  fixedType?: TicketInput["type"];
  eyebrow?: string;
  title?: string;
  description?: string;
  submitLabel?: string;
  titleLabel?: string;
  titlePlaceholder?: string;
  descriptionLabel?: string;
  descriptionPlaceholder?: string;
  serviceLabel?: string;
  serviceHelpText?: string;
  className?: string;
}

function ticketTypeTone(type: TicketInput["type"]) {
  switch (type) {
    case "bug":
      return "danger" as const;
    case "suggestion":
      return "accent" as const;
    default:
      return "info" as const;
  }
}

function ticketTypeCardClass(type: TicketInput["type"]) {
  switch (type) {
    case "bug":
      return "border-destructive/35 shadow-[0_0_28px_rgb(from_var(--destructive)_r_g_b_/_0.08)]";
    case "suggestion":
      return "border-accent/35 shadow-[0_0_28px_rgb(from_var(--accent)_r_g_b_/_0.08)]";
    default:
      return "border-info/30 shadow-[0_0_28px_rgb(from_var(--info)_r_g_b_/_0.08)]";
  }
}

export function TicketIntakeForm({
  applicationId,
  services = [],
  defaultServiceId = "",
  fixedType,
  eyebrow = "Intake",
  title = "Submit a ticket",
  description = "Every submission is accepted immediately. AI triage is planned later, so priority stays manual for now.",
  submitLabel,
  titleLabel = "Title",
  titlePlaceholder = "Summarize the issue or request",
  descriptionLabel = "Description",
  descriptionPlaceholder = "Include context, reproduction steps, or the impact on your work.",
  serviceLabel = "Service",
  serviceHelpText = "Select a specific service if the issue is isolated to one microservice.",
  className,
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
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <Card
      className={cn(
        fixedType ? ticketTypeCardClass(fixedType) : undefined,
        className,
      )}
    >
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <CardEyebrow>{eyebrow}</CardEyebrow>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Badge tone={ticketTypeTone(activeType)}>{activeType}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {showTypePicker ? (
          <div className="grid gap-3 md:grid-cols-3">
            {typeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "rounded-[18px] border p-4 text-left transition duration-150 ease-out",
                  selectedType === option.value
                    ? "border-accent bg-accent/10 shadow-[0_0_24px_rgb(from_var(--accent)_r_g_b/0.14)]"
                    : "border-border bg-muted/50 hover:border-accent/40 hover:bg-muted",
                )}
                onClick={() => {
                  startTransition(() => {
                    setSelectedType(option.value);
                    form.setValue("type", option.value, {
                      shouldValidate: true,
                    });
                  });
                }}
              >
                <p className="font-semibold text-white">{option.label}</p>
                <p className="text-muted-foreground mt-2 text-sm leading-7">
                  {option.summary}
                </p>
              </button>
            ))}
          </div>
        ) : null}

        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) =>
            createMutation.mutate({
              ...values,
              type: activeType,
            }),
          )}
        >
          {services.length ? (
            <div className="space-y-2">
              <Label htmlFor="serviceId">{serviceLabel}</Label>
              <Select id="serviceId" {...form.register("serviceId")}>
                <option value="">Application-level ticket</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </Select>
              <p className="text-muted-foreground text-sm leading-6">
                {serviceHelpText}
              </p>
              <p className="text-destructive text-sm">
                {form.formState.errors.serviceId?.message}
              </p>
            </div>
          ) : null}

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

          <Button type="submit" disabled={createMutation.isPending}>
            {submitLabel ?? `Submit ${activeType}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
