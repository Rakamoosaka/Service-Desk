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
        "flex items-center gap-3 rounded-xl border-l-2 px-4 py-3 text-sm transition duration-150 ease-out",
        isActive
          ? "border-l-accent bg-accent/10 font-semibold text-white"
          : "text-sidebar-foreground/78 border-l-transparent font-medium hover:bg-white/4 hover:text-white",
      )}
    >
      <span className="flex size-4 shrink-0 items-center justify-center">
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}
