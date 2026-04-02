"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ApplicationsCatalogPanel } from "@/features/applications/components/ApplicationsCatalogPanel";
import { ApplicationEditorCard } from "@/features/applications/components/ApplicationEditorCard";
import { ServiceEditorCard } from "@/features/applications/components/ServiceEditorCard";
import type {
  ApplicationRecord,
  ServiceRecord,
} from "@/features/applications/components/applicationsManager.types";
import {
  countApplicationServices,
  countInactiveApplicationServices,
} from "@/features/applications/components/applicationsManager.utils";
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
import {
  optimisticQueryUpdate,
  rollbackOptimisticQueryUpdate,
} from "@/lib/query/optimistic";

interface ApplicationsManagerProps {
  initialApplications: ApplicationRecord[];
}

type SaveApplicationVariables = {
  values: ApplicationInput;
  applicationId?: string;
};

export function ApplicationsManager({
  initialApplications,
}: ApplicationsManagerProps) {
  const queryClient = useQueryClient();
  const applicationsQueryKey = queryKeys.applications;
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
    queryKey: applicationsQueryKey,
    queryFn: () => fetchJson<ApplicationRecord[]>("/api/applications"),
    initialData: initialApplications,
  });

  function setApplicationsData(
    updater: (applications: ApplicationRecord[]) => ApplicationRecord[],
  ) {
    queryClient.setQueryData<ApplicationRecord[]>(
      applicationsQueryKey,
      (current) => updater(current ?? []),
    );
  }

  const saveMutation = useMutation({
    mutationFn: async ({ values, applicationId }: SaveApplicationVariables) => {
      if (applicationId) {
        return fetchJson<
          Omit<ApplicationRecord, "services"> & { services?: ServiceRecord[] }
        >(`/api/applications/${applicationId}`, {
          method: "PATCH",
          body: JSON.stringify(values),
        });
      }

      return fetchJson<
        Omit<ApplicationRecord, "services"> & { services?: ServiceRecord[] }
      >("/api/applications", {
        method: "POST",
        body: JSON.stringify(values),
      });
    },
    onMutate: ({ values, applicationId }) => {
      if (!applicationId) {
        return undefined;
      }

      return optimisticQueryUpdate<ApplicationRecord[]>({
        queryClient,
        queryKey: applicationsQueryKey,
        updater: (current) =>
          current?.map((application) =>
            application.id === applicationId
              ? {
                  ...application,
                  ...values,
                }
              : application,
          ) ?? [],
      });
    },
    onSuccess: async (savedApplication, variables) => {
      if (variables.applicationId) {
        setApplicationsData((applications) =>
          applications.map((application) =>
            application.id === variables.applicationId
              ? {
                  ...application,
                  ...savedApplication,
                }
              : application,
          ),
        );
      } else {
        setApplicationsData((applications) =>
          [...applications, { ...savedApplication, services: [] }].sort(
            (left, right) => left.name.localeCompare(right.name),
          ),
        );
      }

      toast.success(
        variables.applicationId ? "Application synced" : "Application created",
      );

      await queryClient.invalidateQueries({ queryKey: applicationsQueryKey });
      setEditingApplication(null);
      applicationForm.reset({
        name: "",
        slug: "",
        description: "",
        uptimeKumaIdentifier: "",
      });
    },
    onError: (error, _, context) => {
      rollbackOptimisticQueryUpdate({
        queryClient,
        queryKey: applicationsQueryKey,
        context,
      });

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
      fetchJson<Partial<ServiceRecord>>(`/api/services/${id}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      }),
    onMutate: ({ id, values }) =>
      optimisticQueryUpdate<ApplicationRecord[]>({
        queryClient,
        queryKey: applicationsQueryKey,
        updater: (current) =>
          current?.map((application) => ({
            ...application,
            services: application.services.map((service) =>
              service.id === id
                ? {
                    ...service,
                    ...values,
                  }
                : service,
            ),
          })) ?? [],
      }),
    onSuccess: async (savedService, variables) => {
      setApplicationsData((applications) =>
        applications.map((application) => ({
          ...application,
          services: application.services.map((service) =>
            service.id === variables.id
              ? {
                  ...service,
                  ...savedService,
                }
              : service,
          ),
        })),
      );

      toast.success("Service details updated");

      await queryClient.invalidateQueries({ queryKey: applicationsQueryKey });
      setEditingService(null);
      serviceForm.reset({
        name: "",
        description: "",
      });
    },
    onError: (error, _, context) => {
      rollbackOptimisticQueryUpdate({
        queryClient,
        queryKey: applicationsQueryKey,
        context,
      });

      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) =>
      fetchJson(`/api/applications/${id}`, {
        method: "DELETE",
      }),
    onMutate: (id) =>
      optimisticQueryUpdate<ApplicationRecord[]>({
        queryClient,
        queryKey: applicationsQueryKey,
        updater: (current) =>
          current?.filter((application) => application.id !== id) ?? [],
      }),
    onSuccess: async (_, id) => {
      toast.success("Application removed");

      await queryClient.invalidateQueries({ queryKey: applicationsQueryKey });
      if (editingApplication?.id === id) {
        clearApplicationForm();
      }
    },
    onError: (error, _, context) => {
      rollbackOptimisticQueryUpdate({
        queryClient,
        queryKey: applicationsQueryKey,
        context,
      });

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

  const applications = applicationsQuery.data ?? [];
  const totalServices = countApplicationServices(applications);
  const totalInactiveServices = countInactiveApplicationServices(applications);

  return (
    <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <ApplicationsCatalogPanel
        applications={applications}
        totalServices={totalServices}
        totalInactiveServices={totalInactiveServices}
        isLoading={applicationsQuery.isLoading}
        isFetching={applicationsQuery.isFetching}
        isError={applicationsQuery.isError}
        errorMessage={applicationsQuery.error?.message}
        onRetry={() => applicationsQuery.refetch()}
        onEditApplication={editApplication}
        onEditService={editService}
        onDeleteApplication={(applicationId) =>
          deleteMutation.mutate(applicationId)
        }
      />

      <div className="space-y-5">
        <ApplicationEditorCard
          editingApplication={editingApplication}
          form={applicationForm}
          isPending={saveMutation.isPending}
          onSubmit={(values) =>
            saveMutation.mutate({
              values,
              applicationId: editingApplication?.id,
            })
          }
          onCancel={clearApplicationForm}
        />

        <ServiceEditorCard
          editingService={editingService}
          form={serviceForm}
          isPending={saveServiceMutation.isPending}
          onSubmit={(values) => {
            if (!editingService) {
              return;
            }

            saveServiceMutation.mutate({
              id: editingService.service.id,
              values,
            });
          }}
          onCancel={clearServiceForm}
        />
      </div>
    </div>
  );
}
