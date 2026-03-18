"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/Button";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.replace("/sign-in");
    router.refresh();
  }

  return (
    <Button
      variant="ghost"
      className="text-sidebar-foreground w-full justify-start hover:bg-white/5 hover:text-white"
      onClick={handleSignOut}
    >
      <LogOut className="size-4" />
      Sign out
    </Button>
  );
}
