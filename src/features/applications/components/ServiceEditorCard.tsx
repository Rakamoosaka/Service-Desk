"use client";

import { LoaderCircle, Pencil } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
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
import type { ServiceRecord } from "@/features/applications/components/applicationsManager.types";
import type { ServiceMetadataInput } from "@/features/services/schemas/serviceSchemas";

interface EditingServiceState {
  applicationName: string;
  applicationSlug: string;
  service: ServiceRecord;
}

interface ServiceEditorCardProps {
  editingService: EditingServiceState | null;
  form: UseFormReturn<ServiceMetadataInput>;
  isPending: boolean;
  onSubmit: (values: ServiceMetadataInput) => void;
  onCancel: () => void;
}

export function ServiceEditorCard({
  editingService,
  form,
  isPending,
  onSubmit,
  onCancel,
}: ServiceEditorCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardEyebrow>Services</CardEyebrow>
        <CardTitle>
          {editingService ? "Edit synced service" : "Select a synced service"}
        </CardTitle>
        <CardDescription>
          Admins can override local service names and descriptions without
          breaking future syncs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {editingService ? (
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="border-border bg-muted/40 rounded-2xl border px-3.5 py-3">
              <p className="text-[13px] font-semibold text-white">
                {editingService.applicationName}
              </p>
              <p className="text-muted-foreground mt-1 text-[13px]">
                /{editingService.applicationSlug} · Kuma monitor{" "}
                {editingService.service.kumaMonitorName ?? "unknown"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service-name">Display name</Label>
              <Input id="service-name" {...form.register("name")} />
              <p className="text-destructive text-[13px]">
                {form.formState.errors.name?.message}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service-description">Description</Label>
              <Textarea
                id="service-description"
                {...form.register("description")}
              />
              <p className="text-destructive text-[13px]">
                {form.formState.errors.description?.message}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Pencil className="size-4" />
                )}
                Save service details
              </Button>
              <Button type="button" variant="secondary" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="border-border rounded-2xl border border-dashed px-4 py-5">
            <p className="text-[13px] font-medium text-white">
              No service selected.
            </p>
            <p className="text-muted-foreground mt-2 text-[13px] leading-6">
              Choose the Edit label action on any synced service to override its
              local name or description.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
