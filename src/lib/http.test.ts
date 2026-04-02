import assert from "node:assert/strict";
import test from "node:test";
import { errorResponse } from "./http";

test("errorResponse returns the standard error envelope and status", async () => {
  const response = errorResponse("FORBIDDEN", "Admin access required", 403, {
    headers: {
      "X-Test": "1",
    },
  });

  assert.equal(response.status, 403);
  assert.equal(response.headers.get("X-Test"), "1");
  assert.deepEqual(await response.json(), {
    error: {
      code: "FORBIDDEN",
      message: "Admin access required",
    },
  });
});
