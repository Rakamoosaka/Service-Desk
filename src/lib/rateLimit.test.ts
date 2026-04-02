import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { NextRequest } from "next/server";
import { enforceRateLimit } from "./rateLimit";

function createRequest(ip = "127.0.0.1") {
  return new NextRequest("http://localhost/api/tickets", {
    headers: {
      "x-forwarded-for": ip,
    },
  });
}

test("enforceRateLimit blocks requests after the local ticketCreate limit", async () => {
  const userId = randomUUID();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await enforceRateLimit(createRequest(), {
      policy: "ticketCreate",
      userId,
      extraKey: "contract",
    });

    assert.equal(response, null);
  }

  const blockedResponse = await enforceRateLimit(createRequest(), {
    policy: "ticketCreate",
    userId,
    extraKey: "contract",
  });

  assert.ok(blockedResponse);
  assert.equal(blockedResponse.status, 429);
  assert.equal(blockedResponse.headers.get("Retry-After"), "60");
  assert.equal(blockedResponse.headers.get("X-RateLimit-Limit"), "5");
  assert.equal(blockedResponse.headers.get("X-RateLimit-Remaining"), "0");
  assert.ok(
    Number(blockedResponse.headers.get("X-RateLimit-Reset")) > Date.now(),
  );
  assert.deepEqual(await blockedResponse.json(), {
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Too many requests. Please try again shortly.",
    },
  });
});

test("enforceRateLimit keeps counters isolated by extraKey", async () => {
  const userId = randomUUID();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await enforceRateLimit(createRequest(), {
      policy: "ticketCreate",
      userId,
      extraKey: "first-scope",
    });

    assert.equal(response, null);
  }

  const blockedResponse = await enforceRateLimit(createRequest(), {
    policy: "ticketCreate",
    userId,
    extraKey: "first-scope",
  });
  const separateScopeResponse = await enforceRateLimit(createRequest(), {
    policy: "ticketCreate",
    userId,
    extraKey: "second-scope",
  });

  assert.ok(blockedResponse);
  assert.equal(blockedResponse.status, 429);
  assert.equal(separateScopeResponse, null);
});
