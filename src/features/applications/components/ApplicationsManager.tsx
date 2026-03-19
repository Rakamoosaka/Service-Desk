"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  applicationInputSchema,
  type ApplicationInput,
} from "@/features/applications/schemas/applicationSchemas";
import { fetchJson } from "@/lib/query/fetchJson";
import { queryKeys } from "@/lib/query/keys";
import { slugify } from "@/lib/utils";
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

type ApplicationRecord = {
  id: string;
  name: string;
  slug: string;
  description: string;
  uptimeKumaIdentifier: string | null;
};

interface ApplicationsManagerProps {
  initialApplications: ApplicationRecord[];
}

export function ApplicationsManager({
  initialApplications,
}: ApplicationsManagerProps) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<ApplicationRecord | null>(null);

  const form = useForm<ApplicationInput>({
    resolver: zodResolver(applicationInputSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      uptimeKumaIdentifier: "",
    },
  });

  const applicationsQuery = useQuery({
    queryKey: queryKeys.applications,
    queryFn: () => fetchJson<ApplicationRecord[]>("/api/applications"),
    initialData: initialApplications,
  });

  const saveMutation = useMutation({
    mutationFn: async (values: ApplicationInput) => {
      if (editing) {
        return fetchJson(`/api/applications/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(values),
        });
      }

      return fetchJson("/api/applications", {
        method: "POST",
        body: JSON.stringify(values),
      });
    },
    onSuccess: async () => {
      toast.success(editing ? "Application updated" : "Application created");
      await queryClient.invalidateQueries({ queryKey: queryKeys.applications });
      setEditing(null);
      form.reset({
        name: "",
        slug: "",
        description: "",
        uptimeKumaIdentifier: "",
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) =>
      fetchJson(`/api/applications/${id}`, {
        method: "DELETE",
      }),
    onSuccess: async () => {
      toast.success("Application removed");
      await queryClient.invalidateQueries({ queryKey: queryKeys.applications });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function editApplication(application: ApplicationRecord) {
    setEditing(application);
    form.reset({
      name: application.name,
      slug: application.slug,
      description: application.description,
      uptimeKumaIdentifier: application.uptimeKumaIdentifier ?? "",
    });
  }

  function clearForm() {
    setEditing(null);
    form.reset({
      name: "",
      slug: "",
      description: "",
      uptimeKumaIdentifier: "",
    });
  }

  const applications = applicationsQuery.data;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardEyebrow>Catalog</CardEyebrow>
          <CardTitle>Service catalog</CardTitle>
          <CardDescription>
            Manage the applications users can submit tickets against.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {applications.map((application) => (
            <div
              key={application.id}
              className="border-border bg-muted/50 rounded-[18px] border p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div>
                    <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.22em] uppercase">
                      /{application.slug}
                    </p>
                    <h3 className="display-face mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                      {application.name}
                    </h3>
                  </div>
                  <p className="text-muted-foreground max-w-xl text-sm leading-7">
                    {application.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => editApplication(application)}
                  >
                    <Pencil className="size-4" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => deleteMutation.mutate(application.id)}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardEyebrow>{editing ? "Edit" : "Create"}</CardEyebrow>
          <CardTitle>{editing ? "Update service" : "Add service"}</CardTitle>
          <CardDescription>
            Use clear names and stable slugs so the public catalog remains
            predictable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-5"
            onSubmit={form.handleSubmit((values) =>
              saveMutation.mutate(values),
            )}
          >
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...form.register("name")}
                onChange={(event) => {
                  form.setValue("name", event.target.value);
                  if (!editing) {
                    form.setValue("slug", slugify(event.target.value), {
                      shouldValidate: true,
                    });
                  }
                }}
              />
              <p className="text-destructive text-sm">
                {form.formState.errors.name?.message}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" {...form.register("slug")} />
              <p className="text-destructive text-sm">
                {form.formState.errors.slug?.message}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...form.register("description")} />
              <p className="text-destructive text-sm">
                {form.formState.errors.description?.message}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="uptimeKumaIdentifier">Uptime identifier</Label>
              <Input
                id="uptimeKumaIdentifier"
                {...form.register("uptimeKumaIdentifier")}
                placeholder="Optional for phase 6"
              />
              <p className="text-destructive text-sm">
                {form.formState.errors.uptimeKumaIdentifier?.message}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={saveMutation.isPending}>
                <Plus className="size-4" />
                {editing ? "Save changes" : "Create application"}
              </Button>
              {editing ? (
                <Button type="button" variant="secondary" onClick={clearForm}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
