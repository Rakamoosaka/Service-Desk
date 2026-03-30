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
  const isActive =
    href === "/admin"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "flex cursor-default items-center gap-2.5 rounded-xl border-l-2 px-3 py-2.5 text-[13px] transition duration-150 ease-out",
        isActive
          ? "border-l-accent bg-accent/10 font-semibold text-white"
          : "text-sidebar-foreground/78 border-l-transparent font-medium hover:bg-white/4 hover:font-semibold hover:text-white",
      )}
    >
      <span className="flex size-3.5 shrink-0 items-center justify-center">
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}
