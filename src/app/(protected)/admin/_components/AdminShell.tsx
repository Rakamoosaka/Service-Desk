"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowUpLeft,
  FolderKanban,
  LayoutDashboard,
  Menu,
  Ticket,
  UserRoundCog,
} from "lucide-react";
import { SidebarLink } from "@/components/navigation/SidebarLink";
import { SignOutButton } from "@/components/navigation/SignOutButton";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogDismissButton,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";

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

interface SidebarContentProps {
  userName: string;
  userEmail: string;
  onNavigate?: () => void;
  showThemeToggle?: boolean;
  showDismissButton?: boolean;
}

function SidebarContent({
  userName,
  userEmail,
  onNavigate,
  showThemeToggle = true,
  showDismissButton = false,
}: SidebarContentProps) {
  return (
    <>
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
                className="display-face text-sidebar-foreground mt-1.5 block text-[1.65rem] leading-none font-semibold tracking-[-0.04em]"
                onClick={onNavigate}
              >
                Service Desk
              </Link>
            </div>

            <div className="flex items-center gap-2">
              {showThemeToggle ? <ThemeToggle /> : null}
              {showDismissButton ? (
                <DialogDismissButton className="border-sidebar-border bg-sidebar-foreground/5 text-sidebar-foreground hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground" />
              ) : null}
            </div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1.5">
          {links.map((link) => (
            <SidebarLink
              key={link.href}
              href={link.href}
              icon={link.icon}
              label={link.label}
              onClick={onNavigate}
            />
          ))}
        </nav>

        <div className="from-sidebar via-sidebar/95 sticky bottom-0 mt-auto space-y-2 bg-linear-to-t to-transparent pt-5">
          <div className="px-1 py-1.5">
            <div>
              <p className="text-sidebar-foreground text-[13px] font-semibold">
                {userName}
              </p>
              <p className="text-sidebar-muted mt-1 text-xs">{userEmail}</p>
            </div>

            <Button
              asChild
              variant="secondary"
              size="sm"
              className="bg-sidebar-foreground/5 border-sidebar-border hover:bg-sidebar-foreground/10 mt-3 w-full justify-center"
            >
              <Link href="/" onClick={onNavigate}>
                <ArrowUpLeft className="size-4" />
                Shared home
              </Link>
            </Button>
          </div>

          <SignOutButton />
        </div>
      </div>
    </>
  );
}

interface AdminShellProps {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
}

export function AdminShell({ children, userName, userEmail }: AdminShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="bg-background min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="border-sidebar-border bg-sidebar text-sidebar-foreground relative hidden border-r lg:sticky lg:top-0 lg:block lg:h-screen lg:self-start">
        <SidebarContent userName={userName} userEmail={userEmail} />
      </aside>

      <div className="min-w-0">
        <header className="border-border bg-background/92 sticky top-0 z-30 flex items-center justify-between gap-3 border-b px-4 py-3 backdrop-blur lg:hidden">
          <div className="min-w-0">
            <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.24em] uppercase">
              KOZ AI
            </p>
            <Link
              href="/admin"
              className="display-face text-foreground mt-1 block truncate text-[1.25rem] leading-none font-semibold tracking-[-0.04em]"
            >
              Service Desk
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <Dialog open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-10 w-10 rounded-full px-0"
                  aria-label="Open navigation menu"
                >
                  <Menu className="size-4" />
                </Button>
              </DialogTrigger>

              <DialogContent className="bg-sidebar text-sidebar-foreground border-sidebar-border top-0 left-0 h-dvh w-[min(88vw,22rem)] max-w-none translate-x-0 translate-y-0 overflow-hidden rounded-none rounded-r-[1.75rem] border-0 border-r p-0 shadow-[0_24px_64px_rgba(0,0,0,0.38)]">
                <DialogHeader className="sr-only">
                  <DialogTitle>Admin navigation</DialogTitle>
                  <DialogDescription>
                    Navigate between admin sections and account actions.
                  </DialogDescription>
                </DialogHeader>

                <SidebarContent
                  userName={userName}
                  userEmail={userEmail}
                  onNavigate={() => setIsMobileMenuOpen(false)}
                  showThemeToggle={false}
                  showDismissButton
                />
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <main className="mx-auto flex min-h-screen w-full max-w-400 flex-col gap-6 px-4 py-5 text-[13px] sm:px-5 md:px-6 md:py-8 xl:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
