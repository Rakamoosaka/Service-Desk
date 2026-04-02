"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface SignOutButtonProps {
  className?: string;
  iconOnly?: boolean;
}

export function SignOutButton({
  className,
  iconOnly = false,
}: SignOutButtonProps) {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.replace("/sign-in");
    router.refresh();
  }

  return (
    <Button
      variant="ghost"
      className={cn(
        iconOnly
          ? "text-sidebar-muted hover:text-sidebar-foreground h-8 w-8 justify-center rounded-full px-0 hover:bg-transparent"
          : "text-sidebar-muted hover:text-sidebar-foreground w-full justify-start px-4 py-3 text-sm font-medium hover:bg-transparent",
        className,
      )}
      onClick={handleSignOut}
      aria-label="Sign out"
      title="Sign out"
    >
      <LogOut className="text-sidebar-muted size-4 shrink-0" />
      {iconOnly ? null : "Sign out"}
    </Button>
  );
}
