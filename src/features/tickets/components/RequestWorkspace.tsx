"use client";

import type { Route } from "next";
import Link from "next/link";
import { startTransition, useMemo, useState } from "react";
import { ArrowRight, Layers3, ListTree } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardEyebrow,
  CardTitle,
} from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { TicketIntakeForm } from "@/features/tickets/components/TicketIntakeForm";

interface RequestWorkspaceProps {
  applications: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    services: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
  }>;
  initialApplicationSlug?: string;
}

export function RequestWorkspace({
  applications,
  initialApplicationSlug,
}: RequestWorkspaceProps) {
  const fallbackApplication = applications[0] ?? null;
  const initialApplication =
    applications.find(
      (application) => application.slug === initialApplicationSlug,
    ) ?? fallbackApplication;
  const [selectedApplicationSlug, setSelectedApplicationSlug] = useState(
    initialApplication?.slug ?? "",
  );

  const selectedApplication = useMemo(() => {
    return (
      applications.find(
        (application) => application.slug === selectedApplicationSlug,
      ) ?? fallbackApplication
    );
  }, [applications, fallbackApplication, selectedApplicationSlug]);

  if (!selectedApplication) {
    return (
      <Card>
        <CardContent className="space-y-3">
          <CardEyebrow>Request intake</CardEyebrow>
          <CardTitle className="text-white">
            No applications are available yet
          </CardTitle>
          <CardDescription>
            Add an application from the admin dashboard before opening the
            shared intake form.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.84fr_1.16fr]">
      <Card>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <CardEyebrow>Request setup</CardEyebrow>
            <CardTitle className="text-white">
              Choose the application first
            </CardTitle>
            <CardDescription className="leading-7">
              The form stays the same for everyone. Selecting the application
              here scopes the ticket and keeps the service dropdown relevant.
            </CardDescription>
          </div>

          <div className="space-y-2">
            <Label htmlFor="applicationSlug">Application</Label>
            <Select
              id="applicationSlug"
              value={selectedApplication.slug}
              onChange={(event) => {
                startTransition(() => {
                  setSelectedApplicationSlug(event.target.value);
                });
              }}
            >
              {applications.map((application) => (
                <option key={application.id} value={application.slug}>
                  {application.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="border-accent/20 bg-accent/8 rounded-[20px] border p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="accent">/{selectedApplication.slug}</Badge>
              <Badge tone="neutral">
                {selectedApplication.services.length} service
                {selectedApplication.services.length === 1 ? "" : "s"}
              </Badge>
            </div>

            <h3 className="display-face mt-4 text-3xl font-semibold tracking-[-0.04em] text-white">
              {selectedApplication.name}
            </h3>
            <p className="text-muted-foreground mt-3 text-sm leading-7">
              {selectedApplication.description}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="border-border bg-muted/45 rounded-[18px] border p-4">
              <div className="text-muted-foreground flex items-center justify-between text-[11px] font-semibold tracking-[0.22em] uppercase">
                <span>Scope</span>
                <Layers3 className="size-4" />
              </div>
              <p className="mt-3 font-semibold text-white">
                Application-level intake with optional service selection.
              </p>
            </div>

            <div className="border-border bg-muted/45 rounded-[18px] border p-4">
              <div className="text-muted-foreground flex items-center justify-between text-[11px] font-semibold tracking-[0.22em] uppercase">
                <span>Services</span>
                <ListTree className="size-4" />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedApplication.services.length ? (
                  selectedApplication.services.map((service) => (
                    <Badge key={service.id} tone="neutral">
                      {service.name}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No services mapped yet. You can still file an application-
                    level request.
                  </p>
                )}
              </div>
            </div>
          </div>

          <Button asChild variant="secondary">
            <Link href={`/app/${selectedApplication.slug}` as Route}>
              Open full workspace
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <TicketIntakeForm
        key={selectedApplication.id}
        applicationId={selectedApplication.id}
        services={selectedApplication.services}
        eyebrow="Shared intake"
        title="Start a request"
        description="Choose the request type, describe the problem or idea clearly, and submit it directly into the service desk queue."
        submitLabel="Send request"
      />
    </div>
  );
}
