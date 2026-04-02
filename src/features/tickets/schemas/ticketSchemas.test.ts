import assert from "node:assert/strict";
import test from "node:test";
import {
  bulkTicketUpdateSchema,
  parseTicketFilters,
  ticketInputSchema,
} from "./ticketSchemas";

const appId = "11111111-1111-4111-8111-111111111111";
const serviceId = "22222222-2222-4222-8222-222222222222";

test("parseTicketFilters returns trimmed valid filter data", () => {
  const result = parseTicketFilters(
    new URLSearchParams({
      appId,
      status: "new",
      type: "bug",
      search: " payroll outage ",
    }),
  );

  assert.equal(result.success, true);

  if (!result.success) {
    throw new Error("Expected valid ticket filters");
  }

  assert.deepEqual(result.data, {
    appId,
    status: "new",
    type: "bug",
    search: "payroll outage",
  });
});

test("parseTicketFilters rejects invalid status values", () => {
  const result = parseTicketFilters(
    new URLSearchParams({
      status: "pending",
    }),
  );

  assert.equal(result.success, false);
});

test("ticketInputSchema accepts an empty serviceId but rejects malformed IDs", () => {
  const validInput = ticketInputSchema.safeParse({
    appId,
    serviceId: "",
    type: "bug",
    title: "Payroll login fails",
    description: "Users cannot log in to payroll in production right now.",
  });
  const invalidInput = ticketInputSchema.safeParse({
    appId,
    serviceId: "service-123",
    type: "bug",
    title: "Payroll login fails",
    description: "Users cannot log in to payroll in production right now.",
  });

  assert.equal(validInput.success, true);

  if (!validInput.success) {
    throw new Error("Expected empty serviceId to be accepted");
  }

  assert.equal(validInput.data.serviceId, "");
  assert.equal(invalidInput.success, false);
});

test("bulkTicketUpdateSchema requires exactly one update action", () => {
  const validStatusUpdate = bulkTicketUpdateSchema.safeParse({
    ids: [serviceId],
    status: "resolved",
  });
  const invalidCombinedUpdate = bulkTicketUpdateSchema.safeParse({
    ids: [serviceId],
    status: "resolved",
    priority: "high",
  });
  const invalidEmptyUpdate = bulkTicketUpdateSchema.safeParse({
    ids: [serviceId],
  });

  assert.equal(validStatusUpdate.success, true);
  assert.equal(invalidCombinedUpdate.success, false);
  assert.equal(invalidEmptyUpdate.success, false);

  if (invalidCombinedUpdate.success || invalidEmptyUpdate.success) {
    throw new Error("Expected invalid bulk ticket updates to fail");
  }

  assert.equal(
    invalidCombinedUpdate.error.issues[0]?.message,
    "Provide exactly one bulk ticket update action",
  );
  assert.equal(
    invalidEmptyUpdate.error.issues[0]?.message,
    "Provide exactly one bulk ticket update action",
  );
});
