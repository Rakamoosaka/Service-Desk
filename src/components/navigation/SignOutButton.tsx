"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface SignOutButtonProps {
  className?: string;
}

export function SignOutButton({ className }: SignOutButtonProps) {
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
        "text-sidebar-muted w-full justify-start px-4 py-3 text-sm font-medium hover:bg-transparent hover:text-white",
        className,
      )}
      onClick={handleSignOut}
    >
      <LogOut className="text-sidebar-muted size-4 shrink-0" />
      Sign out
    </Button>
  );
}
