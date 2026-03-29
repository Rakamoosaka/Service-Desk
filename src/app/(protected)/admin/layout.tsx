import type { Route } from "next";
import Link from "next/link";
import {
  ArrowUpLeft,
  FolderKanban,
  LayoutDashboard,
  Server,
  Ticket,
  UserRoundCog,
} from "lucide-react";
import { SidebarLink } from "@/components/navigation/SidebarLink";
import { SignOutButton } from "@/components/navigation/SignOutButton";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  const links: Array<{ href: Route; label: string; icon: React.ReactNode }> = [
    {
      href: "/admin",
      label: "Overview",
      icon: <LayoutDashboard className="size-4" />,
    },
    {
      href: "/admin/applications" as Route,
      label: "Applications",
      icon: <FolderKanban className="size-4" />,
    },
    {
      href: "/admin/services" as Route,
      label: "Services",
      icon: <Server className="size-4" />,
    },
    {
      href: "/admin/tickets" as Route,
      label: "Tickets",
      icon: <Ticket className="size-4" />,
    },
    {
      href: "/admin/users" as Route,
      label: "Users",
      icon: <UserRoundCog className="size-4" />,
    },
  ];

  return (
    <div className="bg-background min-h-screen lg:grid lg:grid-cols-[296px_1fr]">
      <aside className="border-sidebar-border bg-sidebar text-sidebar-foreground relative border-b lg:border-r lg:border-b-0">
        <div className="panel-grid absolute inset-0 opacity-30" />
        <div className="relative flex h-full flex-col gap-8 p-6">
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sidebar-muted text-[11px] font-semibold tracking-[0.34em] uppercase">
                  KOZ AI
                </p>
                <Link
                  href="/admin"
                  className="display-face mt-2 block text-[2rem] leading-none font-semibold tracking-[-0.04em] text-white"
                >
                  Service Desk
                </Link>
              </div>
              <ThemeToggle />
            </div>

            <div className="border-sidebar-border rounded-[22px] border bg-white/3 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">
                    {session.user.name}
                  </p>
                  <p className="text-sidebar-muted mt-1 text-sm">
                    {session.user.email}
                  </p>
                </div>
                <Badge tone="accent">admin</Badge>
              </div>

              <Button
                asChild
                variant="secondary"
                size="sm"
                className="mt-4 w-full justify-center"
              >
                <Link href="/">
                  <ArrowUpLeft className="size-4" />
                  Shared home
                </Link>
              </Button>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-2">
            {links.map((link) => (
              <SidebarLink
                key={link.href}
                href={link.href}
                icon={link.icon}
                label={link.label}
              />
            ))}
          </nav>

          <div className="border-sidebar-border rounded-[20px] border bg-white/3 p-3">
            <SignOutButton />
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <main className="mx-auto flex min-h-screen w-full max-w-400 flex-col gap-8 px-6 py-8 md:px-8 md:py-10 xl:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
