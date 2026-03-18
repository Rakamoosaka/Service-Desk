"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SidebarLinkProps {
  href: Route;
  icon: ReactNode;
  label: string;
}

export function SidebarLink({ href, icon, label }: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition",
        isActive
          ? "border-accent bg-accent text-accent-foreground"
          : "text-sidebar-foreground hover:border-sidebar-border border-transparent hover:bg-white/5",
      )}
    >
      <span className="size-4">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
