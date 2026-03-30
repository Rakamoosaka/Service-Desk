import type { Route } from "next";
import Link from "next/link";
import {
  ArrowUpLeft,
  FolderKanban,
  LayoutDashboard,
  Ticket,
  UserRoundCog,
} from "lucide-react";
import { SidebarLink } from "@/components/navigation/SidebarLink";
import { SignOutButton } from "@/components/navigation/SignOutButton";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
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
    <div className="bg-background min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="border-sidebar-border bg-sidebar text-sidebar-foreground relative border-b lg:sticky lg:top-0 lg:h-screen lg:self-start lg:border-r lg:border-b-0">
        <div className="panel-grid absolute inset-0 opacity-30" />
        <div className="relative flex h-full flex-col gap-6 overflow-y-auto p-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sidebar-muted text-[10px] font-semibold tracking-[0.24em] uppercase">
                  KOZ AI
                </p>
                <Link
                  href="/admin"
                  className="display-face mt-1.5 block text-[1.65rem] leading-none font-semibold tracking-[-0.04em] text-white"
                >
                  Service Desk
                </Link>
              </div>
              <ThemeToggle />
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-1.5">
            {links.map((link) => (
              <SidebarLink
                key={link.href}
                href={link.href}
                icon={link.icon}
                label={link.label}
              />
            ))}
          </nav>

          <div className="from-sidebar via-sidebar/95 sticky bottom-0 mt-auto space-y-2 bg-linear-to-t to-transparent pt-5">
            <div className="px-1 py-1.5">
              <div>
                <p className="text-[13px] font-semibold text-white">
                  {session.user.name}
                </p>
                <p className="text-sidebar-muted mt-1 text-xs">
                  {session.user.email}
                </p>
              </div>

              <Button
                asChild
                variant="secondary"
                size="sm"
                className="mt-3 w-full justify-center border-white/10 bg-white/6 hover:bg-white/10"
              >
                <Link href="/">
                  <ArrowUpLeft className="size-4" />
                  Shared home
                </Link>
              </Button>
            </div>

            <SignOutButton />
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <main className="mx-auto flex min-h-screen w-full max-w-400 flex-col gap-6 px-5 py-6 text-[13px] md:px-6 md:py-8 xl:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
