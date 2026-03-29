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
        "text-sidebar-foreground w-full justify-start border-transparent px-3 hover:bg-white/5 hover:text-white",
        className,
      )}
      onClick={handleSignOut}
    >
      <LogOut className="size-4" />
      Sign out
    </Button>
  );
}
