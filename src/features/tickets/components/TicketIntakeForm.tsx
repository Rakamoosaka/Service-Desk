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
  appId: string;
}

export function TicketIntakeForm({ appId }: TicketIntakeFormProps) {
  const [selectedType, setSelectedType] =
    useState<TicketInput["type"]>("feedback");
  const form = useForm<TicketInput>({
    resolver: zodResolver(ticketInputSchema),
    defaultValues: {
      appId,
      type: "feedback",
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
      form.reset({ appId, type: selectedType, title: "", description: "" });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardEyebrow>Intake</CardEyebrow>
        <CardTitle>Submit a ticket</CardTitle>
        <CardDescription>
          Every submission is accepted immediately. AI triage is planned later,
          so priority stays manual for now.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 md:grid-cols-3">
          {typeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={cn(
                "rounded-[18px] border p-4 text-left transition duration-150 ease-out",
                selectedType === option.value
                  ? "border-accent bg-accent/10 shadow-[0_0_24px_rgb(from_var(--accent)_r_g_b_/_0.14)]"
                  : "border-border bg-muted/50 hover:border-accent/40 hover:bg-muted",
              )}
              onClick={() => {
                startTransition(() => {
                  setSelectedType(option.value);
                  form.setValue("type", option.value, { shouldValidate: true });
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

        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) =>
            createMutation.mutate(values),
          )}
        >
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="Summarize the issue or request"
            />
            <p className="text-destructive text-sm">
              {form.formState.errors.title?.message}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Include context, reproduction steps, or the impact on your work."
            />
            <p className="text-destructive text-sm">
              {form.formState.errors.description?.message}
            </p>
          </div>

          <Button type="submit" disabled={createMutation.isPending}>
            Submit {selectedType}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
