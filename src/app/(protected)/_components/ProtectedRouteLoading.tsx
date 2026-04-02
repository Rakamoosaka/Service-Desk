"use client";

import { usePathname } from "next/navigation";
import { RouteLoadingState } from "@/components/feedback/AsyncStates";
import {
  AdminApplicationsSkeleton,
  AdminOverviewSkeleton,
  AdminShellSkeleton,
  AdminTicketsSkeleton,
  AdminUsersSkeleton,
  ApplicationStatusSkeleton,
  HomePageSkeleton,
} from "@/components/feedback/RouteSkeletons";

function renderAdminSkeleton(pathname: string) {
  if (pathname.startsWith("/admin/applications")) {
    return <AdminApplicationsSkeleton />;
  }

  if (pathname.startsWith("/admin/tickets")) {
    return <AdminTicketsSkeleton />;
  }

  if (pathname.startsWith("/admin/users")) {
    return <AdminUsersSkeleton />;
  }

  return <AdminOverviewSkeleton />;
}

export function ProtectedRouteLoading() {
  const pathname = usePathname();

  if (pathname === "/") {
    return <HomePageSkeleton />;
  }

  if (pathname.startsWith("/admin")) {
    return (
      <AdminShellSkeleton>{renderAdminSkeleton(pathname)}</AdminShellSkeleton>
    );
  }

  if (pathname.startsWith("/app/")) {
    if (pathname.includes("/services/")) {
      return (
        <RouteLoadingState
          eyebrow="Loading service"
          title="Preparing the service detail view"
          description="Fetching service health, ticket activity, and live uptime data."
        />
      );
    }

    return <ApplicationStatusSkeleton />;
  }

  if (pathname.startsWith("/request")) {
    return (
      <RouteLoadingState
        eyebrow="Loading request"
        title="Preparing the request flow"
        description="Loading the latest application and service context for this request."
      />
    );
  }

  return (
    <RouteLoadingState
      eyebrow="Loading workspace"
      title="Preparing the service desk"
      description="Checking access and loading the latest application, ticket, and uptime context."
    />
  );
}

export function AdminRouteLoading() {
  const pathname = usePathname();

  return (
    <AdminShellSkeleton>{renderAdminSkeleton(pathname)}</AdminShellSkeleton>
  );
}
