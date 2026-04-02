"use client";

import { Pencil, Trash2 } from "lucide-react";
import {
  CardStackSkeleton,
  EmptyState,
  ErrorState,
  InlineNotice,
  LoadingState,
} from "@/components/feedback/AsyncStates";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardEyebrow,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import type {
  ApplicationRecord,
  ServiceRecord,
} from "@/features/applications/components/applicationsManager.types";
import {
  formatTimestamp,
  getServiceSummary,
} from "@/features/applications/components/applicationsManager.utils";

interface ApplicationsCatalogPanelProps {
  applications: ApplicationRecord[];
  totalServices: number;
  totalInactiveServices: number;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry: () => void;
  onEditApplication: (application: ApplicationRecord) => void;
  onEditService: (
    application: ApplicationRecord,
    service: ServiceRecord,
  ) => void;
  onDeleteApplication: (applicationId: string) => void;
}

export function ApplicationsCatalogPanel({
  applications,
  totalServices,
  totalInactiveServices,
  isLoading,
  isFetching,
  isError,
  errorMessage,
  onRetry,
  onEditApplication,
  onEditService,
  onDeleteApplication,
}: ApplicationsCatalogPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardEyebrow>Catalog</CardEyebrow>
        <div className="flex items-center gap-2">
          <CardTitle>Application catalog</CardTitle>
          <InfoTooltip
            content="Each application maps to one public Uptime Kuma status page. Its monitors are synced into services automatically."
            label="About the application catalog"
          />
        </div>
        {isFetching ? (
          <InlineNotice
            title="Refreshing catalog"
            description="Latest application and service sync data is being fetched in the background."
          />
        ) : null}
        {isError && applications.length > 0 ? (
          <InlineNotice
            tone="danger"
            title="Background refresh failed"
            description={errorMessage ?? "Request failed"}
            action={
              <Button variant="secondary" size="sm" onClick={onRetry}>
                Retry fetch
              </Button>
            }
          />
        ) : null}
        {applications.length > 0 ? (
          <div className="grid gap-2 pt-3 sm:grid-cols-3">
            <div className="border-border bg-muted/35 rounded-2xl border px-4 py-3">
              <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.18em] uppercase">
                Applications
              </p>
              <p className="text-foreground mt-2 text-2xl font-semibold">
                {applications.length}
              </p>
            </div>
            <div className="border-border bg-muted/35 rounded-2xl border px-4 py-3">
              <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.18em] uppercase">
                Synced services
              </p>
              <p className="text-foreground mt-2 text-2xl font-semibold">
                {totalServices}
              </p>
            </div>
            <div className="border-border bg-muted/35 rounded-2xl border px-4 py-3">
              <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.18em] uppercase">
                Needs attention
              </p>
              <p className="text-foreground mt-2 text-2xl font-semibold">
                {totalInactiveServices}
              </p>
            </div>
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && applications.length === 0 ? (
          <div className="space-y-4">
            <LoadingState
              title="Loading application catalog"
              description="Fetching applications and their synced services."
            />
            <CardStackSkeleton count={3} />
          </div>
        ) : null}

        {isError && applications.length === 0 ? (
          <ErrorState
            title="Unable to load the application catalog"
            description={errorMessage ?? "Request failed"}
            action={
              <Button variant="secondary" size="sm" onClick={onRetry}>
                Retry fetch
              </Button>
            }
          />
        ) : null}

        {!isLoading && !isError && applications.length === 0 ? (
          <EmptyState
            title="No applications configured yet"
            description="Create an application with a valid Uptime Kuma identifier to sync its services immediately."
          />
        ) : null}

        {applications.map((application) => {
          const serviceSummary = getServiceSummary(application.services);

          return (
            <div
              key={application.id}
              className="border-border rounded-3xl border"
            >
              <div className="space-y-4 p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.18em] uppercase">
                          /{application.slug}
                        </p>
                        <h3 className="display-face text-foreground mt-1.5 text-xl font-semibold tracking-[-0.03em]">
                          {application.name}
                        </h3>
                      </div>
                      {application.description ? (
                        <InfoTooltip
                          content={application.description}
                          label={`About ${application.name}`}
                          align="right"
                          className="mt-0.5 shrink-0"
                        />
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="info">
                        Kuma: {application.uptimeKumaIdentifier}
                      </Badge>
                      <Badge
                        tone={
                          serviceSummary.inactiveCount > 0
                            ? "warning"
                            : "success"
                        }
                      >
                        {serviceSummary.activeCount}/{serviceSummary.totalCount}{" "}
                        active
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 xl:shrink-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onEditApplication(application)}
                    >
                      <Pencil className="size-4" />
                      Edit & sync
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => onDeleteApplication(application.id)}
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="grid gap-2 text-sm md:grid-cols-2">
                  <div className="bg-muted/30 rounded-2xl px-3.5 py-3">
                    <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.18em] uppercase">
                      Last sync
                    </p>
                    <p className="text-foreground mt-1.5 text-[13px] font-medium">
                      {formatTimestamp(application.lastSyncedAt)}
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-2xl px-3.5 py-3">
                    <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.18em] uppercase">
                      Coverage
                    </p>
                    <p className="text-foreground mt-1.5 text-[13px] font-medium">
                      {serviceSummary.totalCount} services
                      {serviceSummary.inactiveCount > 0
                        ? `, ${serviceSummary.inactiveCount} inactive`
                        : ", all live"}
                    </p>
                  </div>
                </div>

                <div className="border-border bg-muted/25 rounded-2xl border">
                  <div className="border-border/70 flex flex-col gap-1 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.18em] uppercase">
                        Synced services
                      </p>
                      <InfoTooltip
                        content="Missing Kuma monitors stay in the list as inactive records."
                        label={`About synced services for ${application.name}`}
                      />
                    </div>
                    <p className="text-muted-foreground text-[12px]">
                      {serviceSummary.totalCount} total
                    </p>
                  </div>

                  {application.services.length === 0 ? (
                    <div className="text-muted-foreground px-4 py-4 text-[13px]">
                      No monitors were discovered for this identifier.
                    </div>
                  ) : (
                    <div className="divide-border/70 divide-y">
                      {application.services.map((service) => (
                        <div
                          key={service.id}
                          className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-start md:justify-between"
                        >
                          <div
                            className={
                              service.isActive
                                ? "min-w-0 flex-1"
                                : "min-w-0 flex-1 opacity-65"
                            }
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-foreground text-[13px] font-semibold">
                                {service.name}
                              </p>
                              <Badge
                                tone={service.isActive ? "success" : "warning"}
                              >
                                {service.isActive ? "active" : "inactive"}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground mt-1 text-[12px] leading-5.5">
                              /{service.slug} · Synced{" "}
                              {formatTimestamp(service.lastSyncedAt)}
                              {service.kumaMonitorName &&
                              service.kumaMonitorName !== service.name
                                ? ` · Kuma ${service.kumaMonitorName}`
                                : ""}
                            </p>
                            {service.description ? (
                              <p className="text-muted-foreground mt-1.5 text-[13px] leading-5.5">
                                {service.description}
                              </p>
                            ) : null}
                          </div>

                          <Button
                            variant="secondary"
                            size="sm"
                            className="shrink-0"
                            onClick={() => onEditService(application, service)}
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
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
