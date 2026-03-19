import type { Route } from "next";
import Link from "next/link";
import {
  AppWindow,
  FolderKanban,
  LayoutDashboard,
  Ticket,
  UserRoundCog,
} from "lucide-react";
import { SidebarLink } from "@/components/navigation/SidebarLink";
import { SignOutButton } from "@/components/navigation/SignOutButton";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Badge } from "@/components/ui/Badge";
import { requireUser } from "@/lib/auth/session";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireUser();

  const links: Array<{ href: Route; label: string; icon: React.ReactNode }> = [
    {
      href: "/",
      label: "Applications",
      icon: <AppWindow className="size-4" />,
    },
  ];

  if (session.user.role === "admin") {
    links.push(
      {
        href: "/admin",
        label: "Overview",
        icon: <LayoutDashboard className="size-4" />,
      },
      {
        href: "/admin/applications",
        label: "Services",
        icon: <FolderKanban className="size-4" />,
      },
      {
        href: "/admin/tickets",
        label: "Tickets",
        icon: <Ticket className="size-4" />,
      },
      {
        href: "/admin/users",
        label: "Users",
        icon: <UserRoundCog className="size-4" />,
      },
    );
  }

  return (
    <div className="bg-background min-h-screen lg:grid lg:grid-cols-[288px_1fr]">
      <aside className="border-sidebar-border bg-sidebar text-sidebar-foreground border-b lg:border-r lg:border-b-0">
        <div className="flex h-full flex-col gap-8 p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sidebar-muted text-xs font-semibold tracking-[0.28em] uppercase">
                  KOZ AI
                </p>
                <Link
                  href="/"
                  className="display-face mt-2 block text-2xl font-semibold text-white"
                >
                  Service Desk
                </Link>
              </div>
              <ThemeToggle />
            </div>

            <div className="border-sidebar-border rounded-3xl border bg-white/4 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{session.user.name}</p>
                  <p className="text-sidebar-muted text-sm">
                    {session.user.email}
                  </p>
                </div>
                <Badge
                  tone={session.user.role === "admin" ? "accent" : "neutral"}
                >
                  {session.user.role}
                </Badge>
              </div>
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

          <div className="border-sidebar-border rounded-3xl border bg-white/4 p-3">
            <SignOutButton />
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-6 py-8 md:px-8 md:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
