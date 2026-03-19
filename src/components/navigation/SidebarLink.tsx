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
        "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold tracking-[0.08em] uppercase transition duration-150 ease-out",
        isActive
          ? "border-accent bg-accent/12 text-accent shadow-[inset_0_0_0_1px_var(--accent),0_0_22px_rgb(from_var(--accent)_r_g_b_/_0.18)]"
          : "text-sidebar-foreground hover:border-sidebar-border border-transparent hover:bg-white/4 hover:text-white",
      )}
    >
      <span className="size-4">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
