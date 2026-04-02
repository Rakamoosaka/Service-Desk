import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { errorResponse } from "@/lib/http";

type RateLimitPolicyName = keyof typeof RATE_LIMIT_POLICIES;

type PolicyConfig = {
  limit: number;
  window: `${number} ${"s" | "m" | "h"}`;
  windowMs: number;
};

type LocalRateLimitState = {
  count: number;
  reset: number;
};

type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

const RATE_LIMIT_POLICIES = {
  ticketCreate: {
    limit: 5,
    window: "1 m",
    windowMs: 60_000,
  },
  ticketAiReview: {
    limit: 3,
    window: "1 m",
    windowMs: 60_000,
  },
  ticketRespond: {
    limit: 3,
    window: "1 m",
    windowMs: 60_000,
  },
  bulkTicketUpdate: {
    limit: 10,
    window: "1 m",
    windowMs: 60_000,
  },
  analytics: {
    limit: 30,
    window: "1 m",
    windowMs: 60_000,
  },
  ticketExport: {
    limit: 10,
    window: "1 m",
    windowMs: 60_000,
  },
  uptime: {
    limit: 20,
    window: "1 m",
    windowMs: 60_000,
  },
} satisfies Record<string, PolicyConfig>;

const localRateLimitStore = new Map<string, LocalRateLimitState>();

const redis =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const upstashLimiters = redis
  ? Object.fromEntries(
      Object.entries(RATE_LIMIT_POLICIES).map(([name, policy]) => [
        name,
        new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(policy.limit, policy.window),
          analytics: true,
          prefix: `service-desk:${name}`,
          timeout: 1_000,
        }),
      ]),
    )
  : null;

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    const [clientIp] = forwardedFor.split(",");
    return clientIp?.trim() ?? null;
  }

  return request.headers.get("x-real-ip")?.trim() ?? null;
}

function buildIdentifier(
  request: NextRequest,
  userId: string | null | undefined,
  extraKey: string | null | undefined,
) {
  const identity = userId
    ? `user:${userId}`
    : `ip:${getClientIp(request) ?? "unknown"}`;

  if (!extraKey) {
    return identity;
  }

  return `${identity}:${extraKey}`;
}

function checkLocalRateLimit(
  policyName: RateLimitPolicyName,
  identifier: string,
): RateLimitResult {
  const policy = RATE_LIMIT_POLICIES[policyName];
  const now = Date.now();
  const storageKey = `${policyName}:${identifier}`;
  const currentState = localRateLimitStore.get(storageKey);

  if (!currentState || now >= currentState.reset) {
    const reset = now + policy.windowMs;

    localRateLimitStore.set(storageKey, {
      count: 1,
      reset,
    });

    return {
      success: true,
      limit: policy.limit,
      remaining: policy.limit - 1,
      reset,
    };
  }

  if (currentState.count >= policy.limit) {
    return {
      success: false,
      limit: policy.limit,
      remaining: 0,
      reset: currentState.reset,
    };
  }

  currentState.count += 1;
  localRateLimitStore.set(storageKey, currentState);

  return {
    success: true,
    limit: policy.limit,
    remaining: Math.max(policy.limit - currentState.count, 0),
    reset: currentState.reset,
  };
}

async function checkRateLimit(
  policyName: RateLimitPolicyName,
  identifier: string,
): Promise<RateLimitResult> {
  if (!upstashLimiters) {
    return checkLocalRateLimit(policyName, identifier);
  }

  const result = await upstashLimiters[policyName].limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

function createRateLimitResponse(result: RateLimitResult) {
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((result.reset - Date.now()) / 1_000),
  );

  return errorResponse(
    "TOO_MANY_REQUESTS",
    "Too many requests. Please try again shortly.",
    429,
    {
      headers: {
        "Retry-After": String(retryAfterSeconds),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(result.reset),
      },
    },
  );
}

export async function enforceRateLimit(
  request: NextRequest,
  options: {
    policy: RateLimitPolicyName;
    userId?: string | null;
    extraKey?: string | null;
  },
): Promise<NextResponse | null> {
  const identifier = buildIdentifier(request, options.userId, options.extraKey);
  const result = await checkRateLimit(options.policy, identifier);

  if (result.success) {
    return null;
  }

  return createRateLimitResponse(result);
}
