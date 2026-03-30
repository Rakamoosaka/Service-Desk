"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Badge } from "@/components/ui/Badge";
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
import {
  applicationInputSchema,
  type ApplicationInput,
} from "@/features/applications/schemas/applicationSchemas";
import {
  serviceMetadataInputSchema,
  type ServiceMetadataInput,
} from "@/features/services/schemas/serviceSchemas";
import { fetchJson } from "@/lib/query/fetchJson";
import { queryKeys } from "@/lib/query/keys";
import { slugify } from "@/lib/utils";

type ServiceRecord = {
  id: string;
  name: string;
  slug: string;
  description: string;
  kumaMonitorId: string | null;
  kumaMonitorName: string | null;
  isActive: boolean;
  lastSyncedAt: string | Date | null;
};

type ApplicationRecord = {
  id: string;
  name: string;
  slug: string;
  description: string;
  uptimeKumaIdentifier: string;
  lastSyncedAt: string | Date | null;
  services: ServiceRecord[];
};

interface ApplicationsManagerProps {
  initialApplications: ApplicationRecord[];
}

function formatTimestamp(value: string | Date | null) {
  if (!value) {
    return "Not synced yet";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value instanceof Date ? value : new Date(value));
}

export function ApplicationsManager({
  initialApplications,
}: ApplicationsManagerProps) {
  const queryClient = useQueryClient();
  const [editingApplication, setEditingApplication] =
    useState<ApplicationRecord | null>(null);
  const [editingService, setEditingService] = useState<{
    applicationName: string;
    applicationSlug: string;
    service: ServiceRecord;
  } | null>(null);

  const applicationForm = useForm<ApplicationInput>({
    resolver: zodResolver(applicationInputSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      uptimeKumaIdentifier: "",
    },
  });

  const serviceForm = useForm<ServiceMetadataInput>({
    resolver: zodResolver(serviceMetadataInputSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const applicationsQuery = useQuery({
    queryKey: queryKeys.applications,
    queryFn: () => fetchJson<ApplicationRecord[]>("/api/applications"),
    initialData: initialApplications,
  });

  const saveMutation = useMutation({
    mutationFn: async (values: ApplicationInput) => {
      if (editingApplication) {
        return fetchJson(`/api/applications/${editingApplication.id}`, {
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
      toast.success(
        editingApplication ? "Application synced" : "Application created",
      );
      await queryClient.invalidateQueries({ queryKey: queryKeys.applications });
      setEditingApplication(null);
      applicationForm.reset({
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

  const saveServiceMutation = useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string;
      values: ServiceMetadataInput;
    }) =>
      fetchJson(`/api/services/${id}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      }),
    onSuccess: async () => {
      toast.success("Service details updated");
      await queryClient.invalidateQueries({ queryKey: queryKeys.applications });
      setEditingService(null);
      serviceForm.reset({
        name: "",
        description: "",
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
    onSuccess: async (_, id) => {
      toast.success("Application removed");
      await queryClient.invalidateQueries({ queryKey: queryKeys.applications });
      if (editingApplication?.id === id) {
        clearApplicationForm();
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function editApplication(application: ApplicationRecord) {
    setEditingApplication(application);
    applicationForm.reset({
      name: application.name,
      slug: application.slug,
      description: application.description,
      uptimeKumaIdentifier: application.uptimeKumaIdentifier,
    });
  }

  function editService(application: ApplicationRecord, service: ServiceRecord) {
    setEditingService({
      applicationName: application.name,
      applicationSlug: application.slug,
      service,
    });
    serviceForm.reset({
      name: service.name,
      description: service.description,
    });
  }

  function clearApplicationForm() {
    setEditingApplication(null);
    applicationForm.reset({
      name: "",
      slug: "",
      description: "",
      uptimeKumaIdentifier: "",
    });
  }

  function clearServiceForm() {
    setEditingService(null);
    serviceForm.reset({
      name: "",
      description: "",
    });
  }

  const applications = applicationsQuery.data;

  return (
    <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardEyebrow>Catalog</CardEyebrow>
          <CardTitle>Application catalog</CardTitle>
          <CardDescription>
            Each application maps to one public Uptime Kuma status page. Its
            monitors are synced into services automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3.5">
          {applications.length === 0 ? (
            <div className="border-border bg-muted/50 rounded-2xl border border-dashed p-5">
              <p className="text-[13px] font-medium text-white">
                No applications configured yet.
              </p>
              <p className="text-muted-foreground mt-2 text-[13px] leading-6">
                Create an application with a valid Uptime Kuma identifier to
                sync its services immediately.
              </p>
            </div>
          ) : null}

          {applications.map((application) => (
            <div
              key={application.id}
              className="border-border bg-muted/50 rounded-2xl border p-4"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div>
                    <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.18em] uppercase">
                      /{application.slug}
                    </p>
                    <h3 className="display-face mt-1.5 text-xl font-semibold tracking-[-0.03em] text-white">
                      {application.name}
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="info">
                      {application.uptimeKumaIdentifier}
                    </Badge>
                    <Badge tone="neutral">
                      Synced {formatTimestamp(application.lastSyncedAt)}
                    </Badge>
                    <Badge tone="success">
                      {
                        application.services.filter(
                          (service) => service.isActive,
                        ).length
                      }{" "}
                      active
                    </Badge>
                    {application.services.some(
                      (service) => !service.isActive,
                    ) ? (
                      <Badge tone="warning">
                        {
                          application.services.filter(
                            (service) => !service.isActive,
                          ).length
                        }{" "}
                        inactive
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-muted-foreground max-w-xl text-[13px] leading-6">
                    {application.description}
                  </p>
                  <div className="space-y-2.5 pt-1.5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.18em] uppercase">
                        Synced services
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        Missing Kuma monitors are preserved as inactive records.
                      </p>
                    </div>

                    {application.services.length === 0 ? (
                      <div className="border-border text-muted-foreground rounded-2xl border border-dashed px-3.5 py-3 text-[13px]">
                        No monitors were discovered for this identifier.
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {application.services.map((service) => (
                          <div
                            key={service.id}
                            className="border-border/70 bg-background/35 flex flex-col gap-2.5 rounded-2xl border px-3.5 py-3 md:flex-row md:items-start md:justify-between"
                          >
                            <div
                              className={service.isActive ? "" : "opacity-60"}
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-[13px] font-semibold text-white">
                                  {service.name}
                                </p>
                                <Badge
                                  tone={
                                    service.isActive ? "success" : "warning"
                                  }
                                >
                                  {service.isActive ? "active" : "inactive"}
                                </Badge>
                                {service.kumaMonitorName &&
                                service.kumaMonitorName !== service.name ? (
                                  <Badge tone="neutral">
                                    Kuma: {service.kumaMonitorName}
                                  </Badge>
                                ) : null}
                              </div>
                              <p className="text-muted-foreground mt-1.5 text-[13px] leading-5.5">
                                {service.description}
                              </p>
                              <p className="text-muted-foreground mt-1.5 text-[11px]">
                                /{service.slug} ·{" "}
                                {formatTimestamp(service.lastSyncedAt)}
                              </p>
                            </div>

                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => editService(application, service)}
                            >
                              <Pencil className="size-4" />
                              Edit label
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => editApplication(application)}
                  >
                    <Pencil className="size-4" />
                    Edit & sync
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

      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardEyebrow>{editingApplication ? "Edit" : "Create"}</CardEyebrow>
            <CardTitle>
              {editingApplication ? "Update application" : "Add application"}
            </CardTitle>
            <CardDescription>
              Saving this form validates the identifier against Kuma and syncs
              the latest monitor list immediately.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={applicationForm.handleSubmit((values) =>
                saveMutation.mutate(values),
              )}
            >
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  {...applicationForm.register("name")}
                  onChange={(event) => {
                    applicationForm.setValue("name", event.target.value);
                    if (!editingApplication) {
                      applicationForm.setValue(
                        "slug",
                        slugify(event.target.value),
                        {
                          shouldValidate: true,
                        },
                      );
                    }
                  }}
                />
                <p className="text-destructive text-[13px]">
                  {applicationForm.formState.errors.name?.message}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" {...applicationForm.register("slug")} />
                <p className="text-destructive text-[13px]">
                  {applicationForm.formState.errors.slug?.message}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="uptimeKumaIdentifier">Uptime identifier</Label>
                <Input
                  id="uptimeKumaIdentifier"
                  placeholder="example-status-page"
                  {...applicationForm.register("uptimeKumaIdentifier")}
                />
                <p className="text-muted-foreground text-[13px] leading-5.5">
                  Use the public status page slug that appears after /status/ in
                  Uptime Kuma.
                </p>
                <p className="text-destructive text-[13px]">
                  {
                    applicationForm.formState.errors.uptimeKumaIdentifier
                      ?.message
                  }
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...applicationForm.register("description")}
                />
                <p className="text-destructive text-[13px]">
                  {applicationForm.formState.errors.description?.message}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : editingApplication ? (
                    <RefreshCw className="size-4" />
                  ) : (
                    <Plus className="size-4" />
                  )}
                  {editingApplication ? "Save and sync" : "Create application"}
                </Button>
                {editingApplication ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={clearApplicationForm}
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardEyebrow>Services</CardEyebrow>
            <CardTitle>
              {editingService
                ? "Edit synced service"
                : "Select a synced service"}
            </CardTitle>
            <CardDescription>
              Admins can override local service names and descriptions without
              breaking future syncs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {editingService ? (
              <form
                className="space-y-4"
                onSubmit={serviceForm.handleSubmit((values) =>
                  saveServiceMutation.mutate({
                    id: editingService.service.id,
                    values,
                  }),
                )}
              >
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
                  <Input id="service-name" {...serviceForm.register("name")} />
                  <p className="text-destructive text-[13px]">
                    {serviceForm.formState.errors.name?.message}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service-description">Description</Label>
                  <Textarea
                    id="service-description"
                    {...serviceForm.register("description")}
                  />
                  <p className="text-destructive text-[13px]">
                    {serviceForm.formState.errors.description?.message}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    type="submit"
                    disabled={saveServiceMutation.isPending}
                  >
                    {saveServiceMutation.isPending ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <Pencil className="size-4" />
                    )}
                    Save service details
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={clearServiceForm}
                  >
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
                  Choose the Edit label action on any synced service to override
                  its local name or description.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
