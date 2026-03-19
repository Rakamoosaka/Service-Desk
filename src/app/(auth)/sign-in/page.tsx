import { redirect } from "next/navigation";
import { GitLabSignInButton } from "@/components/navigation/GitLabSignInButton";
import { Card, CardContent } from "@/components/ui/Card";
import { getSession } from "@/lib/auth/session";

export default async function SignInPage() {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  return (
    <main className="bg-background grid min-h-screen overflow-hidden lg:grid-cols-[1.2fr_0.8fr]">
      <section className="border-border/70 relative flex items-end border-b px-6 py-10 lg:border-r lg:border-b-0 lg:px-10 lg:py-12">
        <div className="panel-grid absolute inset-0 opacity-30" />
        <div className="relative max-w-2xl space-y-6">
          <p className="text-accent text-xs font-semibold tracking-[0.32em] uppercase">
            KOZ AI Service Desk
          </p>
          <div className="space-y-4">
            <h1 className="display-face text-5xl leading-none font-semibold tracking-tight md:text-7xl">
              Internal support operations without the clutter.
            </h1>
            <p className="text-muted-foreground max-w-xl text-base leading-7 md:text-lg">
              Sign in with GitLab to manage applications, submit tickets, and
              coordinate admin workflows from a single App Router workspace.
            </p>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-10 lg:px-10 lg:py-12">
        <Card className="w-full max-w-md">
          <CardContent className="space-y-8 p-8">
            <div className="space-y-3">
              <p className="text-muted-foreground text-xs font-semibold tracking-[0.28em] uppercase">
                Authentication
              </p>
              <div>
                <h2 className="text-2xl font-semibold">Access the workspace</h2>
                <p className="text-muted-foreground mt-2 text-sm leading-6">
                  GitLab OAuth is the only sign-in method. Roles are assigned
                  automatically on first login and can later be adjusted by
                  admins.
                </p>
              </div>
            </div>
            <GitLabSignInButton />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
