import { test } from "node:test";
import assert from "node:assert/strict";

import { validateSettings, MESSAGE_MAX_LENGTH } from "./validate";
import { DEFAULT_SETTINGS } from "./defaults";

test("default settings are valid", () => {
  const { errors } = validateSettings(DEFAULT_SETTINGS);
  assert.equal(errors, null);
});

test("empty remaining message is rejected", () => {
  const { errors } = validateSettings({
    ...DEFAULT_SETTINGS,
    remainingMessage: "   ",
  });
  assert.ok(errors?.remainingMessage);
});

test("message longer than the max is rejected", () => {
  const tooLong = "x".repeat(MESSAGE_MAX_LENGTH + 1);
  const { errors } = validateSettings({
    ...DEFAULT_SETTINGS,
    successMessage: tooLong,
  });
  assert.ok(errors?.successMessage);
});

test("message exactly at the max length passes", () => {
  const atMax = "x".repeat(MESSAGE_MAX_LENGTH);
  const { errors } = validateSettings({
    ...DEFAULT_SETTINGS,
    remainingMessage: atMax,
    successMessage: atMax,
  });
  assert.equal(errors, null);
});

test("negative goal is rejected", () => {
  const { errors } = validateSettings({ ...DEFAULT_SETTINGS, goalAmount: "-5" });
  assert.ok(errors?.goalAmount);
});

test("non-numeric goal is rejected", () => {
  const { errors } = validateSettings({
    ...DEFAULT_SETTINGS,
    goalAmount: "abc",
  });
  assert.ok(errors?.goalAmount);
});

test("out-of-range border radius is rejected", () => {
  const { errors } = validateSettings({
    ...DEFAULT_SETTINGS,
    borderRadius: 999,
  });
  assert.ok(errors?.borderRadius);
});

test("out-of-range bar height is rejected", () => {
  const { errors } = validateSettings({ ...DEFAULT_SETTINGS, barHeight: 1 });
  assert.ok(errors?.barHeight);
});

test("colors are normalized with a leading #", () => {
  const { value } = validateSettings({
    ...DEFAULT_SETTINGS,
    barColor: "2E7D32",
  });
  assert.equal(value.barColor, "#2E7D32");
});
