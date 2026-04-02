import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    BETTER_AUTH_SECRET: z
      .string()
      .min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
    BETTER_AUTH_URL: z.string().url("BETTER_AUTH_URL must be a valid URL"),
    GITLAB_CLIENT_ID: z.string().min(1, "GITLAB_CLIENT_ID is required"),
    GITLAB_CLIENT_SECRET: z.string().min(1, "GITLAB_CLIENT_SECRET is required"),
    GITLAB_ISSUER: z.string().url().default("https://gitlab.com"),
    GITLAB_ADMIN_ALLOWLIST: z.string().default(""),
    NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
    OPENAI_API_KEY: z.string().min(1).optional(),
    OPENROUTER_API_KEY: z.string().min(1).optional(),
    OPENROUTER_BASE_URL: z.string().url().optional(),
    OPENROUTER_MODEL: z.string().min(1).optional(),
    UPTIME_KUMA_BASE_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
    RESEND_API_KEY: z.string().min(1).optional(),
    RESEND_FROM_EMAIL: z.string().min(1).optional(),
    RESEND_TEST_EMAIL: z.string().email().optional(),
  })
  .superRefine((value, ctx) => {
    const hasUpstashUrl = Boolean(value.UPSTASH_REDIS_REST_URL);
    const hasUpstashToken = Boolean(value.UPSTASH_REDIS_REST_TOKEN);

    if (hasUpstashUrl && !hasUpstashToken) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["UPSTASH_REDIS_REST_TOKEN"],
        message:
          "UPSTASH_REDIS_REST_TOKEN is required when UPSTASH_REDIS_REST_URL is set",
      });
    }

    if (!hasUpstashUrl && hasUpstashToken) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["UPSTASH_REDIS_REST_URL"],
        message:
          "UPSTASH_REDIS_REST_URL is required when UPSTASH_REDIS_REST_TOKEN is set",
      });
    }
  });

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "Invalid environment variables",
    parsedEnv.error.flatten().fieldErrors,
  );
  throw new Error("Invalid environment variables");
}

export const env = parsedEnv.data;
