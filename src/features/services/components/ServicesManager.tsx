"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  serviceInputSchema,
  type ServiceInput,
} from "@/features/services/schemas/serviceSchemas";
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
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

type ApplicationOption = {
  id: string;
  name: string;
  slug: string;
};

type ServiceRecord = {
  id: string;
  applicationId: string;
  name: string;
  slug: string;
  description: string;
  uptimeKumaIdentifier: string | null;
  application: ApplicationOption;
};

interface ServicesManagerProps {
  initialServices: ServiceRecord[];
  initialApplications: ApplicationOption[];
}

export function ServicesManager({
  initialServices,
  initialApplications,
}: ServicesManagerProps) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<ServiceRecord | null>(null);

  const form = useForm<ServiceInput>({
    resolver: zodResolver(serviceInputSchema),
    defaultValues: {
      applicationId: initialApplications[0]?.id ?? "",
      name: "",
      slug: "",
      description: "",
      uptimeKumaIdentifier: "",
    },
  });

  const servicesQuery = useQuery({
    queryKey: queryKeys.services,
    queryFn: () => fetchJson<ServiceRecord[]>("/api/services"),
    initialData: initialServices,
  });

  const saveMutation = useMutation({
    mutationFn: async (values: ServiceInput) => {
      if (editing) {
        return fetchJson(`/api/services/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(values),
        });
      }

      return fetchJson("/api/services", {
        method: "POST",
        body: JSON.stringify(values),
      });
    },
    onSuccess: async () => {
      toast.success(editing ? "Service updated" : "Service created");
      await queryClient.invalidateQueries({ queryKey: queryKeys.services });
      setEditing(null);
      form.reset({
        applicationId: initialApplications[0]?.id ?? "",
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
      fetchJson(`/api/services/${id}`, {
        method: "DELETE",
      }),
    onSuccess: async () => {
      toast.success("Service removed");
      await queryClient.invalidateQueries({ queryKey: queryKeys.services });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function editService(service: ServiceRecord) {
    setEditing(service);
    form.reset({
      applicationId: service.applicationId,
      name: service.name,
      slug: service.slug,
      description: service.description,
      uptimeKumaIdentifier: service.uptimeKumaIdentifier ?? "",
    });
  }

  function clearForm() {
    setEditing(null);
    form.reset({
      applicationId: initialApplications[0]?.id ?? "",
      name: "",
      slug: "",
      description: "",
      uptimeKumaIdentifier: "",
    });
  }

  const services = servicesQuery.data;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Card>
        <CardHeader>
          <CardEyebrow>Catalog</CardEyebrow>
          <CardTitle>Service catalog</CardTitle>
          <CardDescription>
            Map microservices to their parent application and attach their
            uptime monitor identifiers here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="border-border bg-muted/50 rounded-[18px] border p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div>
                    <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.22em] uppercase">
                      {service.application.name} / {service.slug}
                    </p>
                    <h3 className="display-face mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                      {service.name}
                    </h3>
                  </div>
                  <p className="text-muted-foreground max-w-xl text-sm leading-7">
                    {service.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => editService(service)}
                  >
                    <Pencil className="size-4" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => deleteMutation.mutate(service.id)}
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
            Keep service slugs stable because they power the nested workspace
            routes and uptime endpoints.
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
              <Label htmlFor="applicationId">Application</Label>
              <Select id="applicationId" {...form.register("applicationId")}>
                {initialApplications.map((application) => (
                  <option key={application.id} value={application.id}>
                    {application.name}
                  </option>
                ))}
              </Select>
              <p className="text-destructive text-sm">
                {form.formState.errors.applicationId?.message}
              </p>
            </div>

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
                placeholder="Public status page identifier"
              />
              <p className="text-destructive text-sm">
                {form.formState.errors.uptimeKumaIdentifier?.message}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={saveMutation.isPending}>
                <Plus className="size-4" />
                {editing ? "Save changes" : "Create service"}
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
