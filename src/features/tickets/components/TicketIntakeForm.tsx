"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Bug, Lightbulb, MessageSquare } from "lucide-react";
import { type ReactNode, startTransition, useState } from "react";
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
  submitButtonClassName?: string;
  className?: string;
  compact?: boolean;
  headerAddon?: ReactNode;
  hideTypeBadge?: boolean;
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
      return "border-destructive/35";
    case "suggestion":
      return "border-accent/35";
    default:
      return "border-info/30";
  }
}

function TicketTypeIcon({ type }: { type: TicketInput["type"] }) {
  switch (type) {
    case "bug":
      return <Bug className="size-4" />;
    case "suggestion":
      return <Lightbulb className="size-4" />;
    default:
      return <MessageSquare className="size-4" />;
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
  submitButtonClassName,
  className,
  compact = false,
  headerAddon,
  hideTypeBadge = false,
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
                      setSelectedType(option.value);
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
                      <Badge
                        tone={ticketTypeTone(option.value)}
                        className={cn(
                          "shadow-none",
                          compact ? "text-[11px]" : undefined,
                        )}
                      >
                        {option.value}
                      </Badge>
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
          {services.length ? (
            <div
              className={cn(
                "rounded-[14px] border border-white/8 bg-black/15",
                compact
                  ? "px-4 py-4 md:px-5 md:py-5"
                  : "px-5 py-5 md:px-6 md:py-6",
              )}
            >
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
          ) : null}

          <div
            className={cn(
              compact ? "border-t-0" : "border-t border-white/8",
              compact
                ? "px-4 py-4 md:px-5 md:py-5"
                : "px-5 py-5 md:px-6 md:py-6",
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
              compact
                ? "px-4 py-4 md:px-5 md:py-5"
                : "px-5 py-5 md:px-6 md:py-6",
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

          <div
            className={cn(
              "flex flex-col gap-4 border-t border-white/8 md:flex-row md:items-center md:justify-between",
              compact
                ? "px-4 py-4 md:px-5 md:py-5"
                : "px-5 py-5 md:px-6 md:py-6",
            )}
          >
            <p
              className={cn(
                "text-muted-foreground max-w-2xl",
                compact ? "text-[13px] leading-6" : "text-sm leading-7",
              )}
            >
              Requests go straight into the service desk queue with the lane,
              scope, and description you provide here.
            </p>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className={submitButtonClassName}
            >
              {submitLabel ?? `Submit ${activeType}`}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
