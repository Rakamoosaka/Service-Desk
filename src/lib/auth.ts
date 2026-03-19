import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { env } from "@/lib/env";
import { isAdminBootstrapCandidate } from "@/lib/auth/allowlist";

export const auth = betterAuth({
  appName: "KOZ AI Service Desk",
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  advanced: {
    useSecureCookies: env.NODE_ENV === "production",
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
  user: {
    modelName: "users",
    fields: {
      image: "avatarUrl",
    },
    additionalFields: {
      role: {
        type: ["user", "admin"],
        input: false,
        defaultValue: "user",
      },
      gitlabUserId: {
        type: "string",
        input: false,
        required: false,
      },
    },
  },
  session: {
    modelName: "sessions",
    cookieCache: {
      enabled: true,
      maxAge: 300,
    },
  },
  account: {
    modelName: "accounts",
    updateAccountOnSignIn: true,
  },
  verification: {
    modelName: "verifications",
  },
  socialProviders: {
    gitlab: {
      clientId: env.GITLAB_CLIENT_ID,
      clientSecret: env.GITLAB_CLIENT_SECRET,
      issuer: env.GITLAB_ISSUER,
      mapProfileToUser: (profile) => ({
        gitlabUserId: String(profile.id),
        image: profile.avatar_url ?? null,
        name: profile.name ?? profile.username ?? "GitLab User",
      }),
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const email = typeof user.email === "string" ? user.email : null;
          const gitlabUserId =
            typeof user.gitlabUserId === "string" ? user.gitlabUserId : null;

          return {
            data: {
              ...user,
              role: isAdminBootstrapCandidate(email, gitlabUserId)
                ? "admin"
                : "user",
            },
          };
        },
      },
    },
  },
  plugins: [nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;
