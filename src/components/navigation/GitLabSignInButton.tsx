"use client";

import { startTransition, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/Button";

export function GitLabSignInButton() {
  const [isPending, setIsPending] = useState(false);

  function handleSignIn() {
    setIsPending(true);

    startTransition(async () => {
      await signIn.social({
        provider: "gitlab",
        callbackURL: "/",
      });

      setIsPending(false);
    });
  }

  return (
    <Button
      className="w-full"
      size="lg"
      onClick={handleSignIn}
      disabled={isPending}
    >
      {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
      Continue with GitLab
    </Button>
  );
}
