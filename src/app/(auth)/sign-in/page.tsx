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
    <main className="bg-background grid min-h-screen overflow-hidden lg:grid-cols-[1.15fr_0.85fr]">
      <section className="border-border relative flex items-end border-b px-6 py-12 lg:border-r lg:border-b-0 lg:px-10 lg:py-14">
        <div className="panel-grid absolute inset-0 opacity-40" />
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-400/70 to-transparent" />
        <div className="relative max-w-3xl space-y-8">
          <p className="text-accent text-[11px] font-semibold tracking-[0.36em] uppercase">
            KOZ AI Service Desk
          </p>
          <div className="space-y-5">
            <h1 className="display-face text-foreground text-5xl leading-[0.9] font-semibold tracking-[-0.04em] md:text-7xl xl:text-8xl">
              Internal support operations on a sharper grid.
            </h1>
            <p className="text-muted-foreground max-w-2xl text-base leading-8 md:text-lg">
              Sign in with GitLab to manage applications, submit tickets, and
              coordinate admin workflows from a single App Router workspace.
            </p>
          </div>
          <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
            {[
              ["Auth", "GitLab OAuth gate"],
              ["Queue", "Ticket operations"],
              ["Access", "Admin role controls"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="border-border bg-panel/60 rounded-[18px] border px-4 py-4 backdrop-blur-sm"
              >
                <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.24em] uppercase">
                  {label}
                </p>
                <p className="text-foreground mt-3 font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-10 lg:px-10 lg:py-12">
        <Card className="w-full max-w-md">
          <CardContent className="space-y-8 p-8 md:p-9">
            <div className="space-y-3">
              <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.3em] uppercase">
                Authentication
              </p>
              <div>
                <h2 className="display-face text-foreground text-3xl font-semibold tracking-[-0.03em]">
                  Access the workspace
                </h2>
                <p className="text-muted-foreground mt-3 text-sm leading-7">
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
