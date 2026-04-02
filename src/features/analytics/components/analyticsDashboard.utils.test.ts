import assert from "node:assert/strict";
import test from "node:test";
import { getTrendScale } from "./analyticsDashboard.utils";

test("getTrendScale uses the exact peak for very small ranges", () => {
  assert.deepEqual(getTrendScale(0), {
    axisMax: 1,
    ticks: [0, 1],
  });

  assert.deepEqual(getTrendScale(4), {
    axisMax: 4,
    ticks: [0, 1, 2, 3, 4],
  });
});

test("getTrendScale derives a compact rounded scale from the visible peak", () => {
  assert.deepEqual(getTrendScale(7), {
    axisMax: 8,
    ticks: [0, 2, 4, 6, 8],
  });

  assert.deepEqual(getTrendScale(11), {
    axisMax: 15,
    ticks: [0, 5, 10, 15],
  });

  assert.deepEqual(getTrendScale(30), {
    axisMax: 30,
    ticks: [0, 10, 20, 30],
  });
});
