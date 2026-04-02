"use client";

import { LoaderCircle, Plus, RefreshCw } from "lucide-react";
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
import type { ApplicationRecord } from "@/features/applications/components/applicationsManager.types";
import { type ApplicationInput } from "@/features/applications/schemas/applicationSchemas";
import { slugify } from "@/lib/utils";

interface ApplicationEditorCardProps {
  editingApplication: ApplicationRecord | null;
  form: UseFormReturn<ApplicationInput>;
  isPending: boolean;
  onSubmit: (values: ApplicationInput) => void;
  onCancel: () => void;
}

export function ApplicationEditorCard({
  editingApplication,
  form,
  isPending,
  onSubmit,
  onCancel,
}: ApplicationEditorCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardEyebrow>{editingApplication ? "Edit" : "Create"}</CardEyebrow>
        <CardTitle>
          {editingApplication ? "Update application" : "Add application"}
        </CardTitle>
        <CardDescription>
          Saving this form validates the identifier against Kuma and syncs the
          latest monitor list immediately.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...form.register("name")}
              onChange={(event) => {
                form.setValue("name", event.target.value);
                if (!editingApplication) {
                  form.setValue("slug", slugify(event.target.value), {
                    shouldValidate: true,
                  });
                }
              }}
            />
            <p className="text-destructive text-[13px]">
              {form.formState.errors.name?.message}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" {...form.register("slug")} />
            <p className="text-destructive text-[13px]">
              {form.formState.errors.slug?.message}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="uptimeKumaIdentifier">Uptime identifier</Label>
            <Input
              id="uptimeKumaIdentifier"
              placeholder="example-status-page"
              {...form.register("uptimeKumaIdentifier")}
            />
            <p className="text-muted-foreground text-[13px] leading-5.5">
              Use the public status page slug that appears after /status/ in
              Uptime Kuma.
            </p>
            <p className="text-destructive text-[13px]">
              {form.formState.errors.uptimeKumaIdentifier?.message}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...form.register("description")} />
            <p className="text-destructive text-[13px]">
              {form.formState.errors.description?.message}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : editingApplication ? (
                <RefreshCw className="size-4" />
              ) : (
                <Plus className="size-4" />
              )}
              {editingApplication ? "Save and sync" : "Create application"}
            </Button>
            {editingApplication ? (
              <Button type="button" variant="secondary" onClick={onCancel}>
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
