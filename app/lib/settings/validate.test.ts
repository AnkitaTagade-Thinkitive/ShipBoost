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

test("sticky top is kept with the Below Header position", () => {
  const { value } = validateSettings({
    ...DEFAULT_SETTINGS,
    position: "none",
    stickyPosition: "sticky-top",
  });
  assert.equal(value.stickyPosition, "sticky-top");
});

test("sticky top is forced to normal for non-Below-Header positions", () => {
  for (const position of ["above-add-to-cart", "below-add-to-cart"] as const) {
    const { value } = validateSettings({
      ...DEFAULT_SETTINGS,
      position,
      stickyPosition: "sticky-top",
    });
    assert.equal(value.stickyPosition, "normal");
  }
});

test("width mode is independent of position (never coerced)", () => {
  for (const widthMode of ["full", "content", "custom"] as const) {
    const { value } = validateSettings({
      ...DEFAULT_SETTINGS,
      position: "below-add-to-cart",
      widthMode,
    });
    assert.equal(value.widthMode, widthMode);
  }
});

/* ---- Product recommendations --------------------------------------------- */

test("an unknown recommendation source falls back to smart", () => {
  const { value } = validateSettings({
    ...DEFAULT_SETTINGS,
    // @ts-expect-error deliberately invalid to test normalization
    recommendationSource: "bogus",
  });
  assert.equal(value.recommendationSource, "smart");
});

test("valid recommendation sources pass through unchanged", () => {
  for (const source of [
    "smart",
    "best-sellers",
    "collection",
    "manual",
  ] as const) {
    const { value } = validateSettings({
      ...DEFAULT_SETTINGS,
      recommendationSource: source,
    });
    assert.equal(value.recommendationSource, source);
  }
});

test("recommendation max is clamped to 1–4", () => {
  assert.equal(
    validateSettings({ ...DEFAULT_SETTINGS, recommendationMax: 0 }).value
      .recommendationMax,
    1,
  );
  assert.equal(
    validateSettings({ ...DEFAULT_SETTINGS, recommendationMax: 99 }).value
      .recommendationMax,
    4,
  );
});

test("a non-finite recommendation max falls back to the default", () => {
  const { value } = validateSettings({
    ...DEFAULT_SETTINGS,
    recommendationMax: Number.NaN,
  });
  assert.equal(value.recommendationMax, 3);
});

test("recommendation max is rounded to an integer", () => {
  const { value } = validateSettings({
    ...DEFAULT_SETTINGS,
    recommendationMax: 2.6,
  });
  assert.equal(value.recommendationMax, 3);
});

test("an unknown recommendation layout falls back to horizontal", () => {
  const { value } = validateSettings({
    ...DEFAULT_SETTINGS,
    // @ts-expect-error deliberately invalid to test normalization
    recommendationLayout: "spiral",
  });
  assert.equal(value.recommendationLayout, "horizontal");
});

test("collection and product IDs are trimmed", () => {
  const { value } = validateSettings({
    ...DEFAULT_SETTINGS,
    recommendationCollectionId: "  gid://shopify/Collection/1  ",
    recommendationProductIds: "  gid://shopify/Product/1, gid://shopify/Product/2  ",
  });
  assert.equal(value.recommendationCollectionId, "gid://shopify/Collection/1");
  assert.equal(
    value.recommendationProductIds,
    "gid://shopify/Product/1, gid://shopify/Product/2",
  );
});

test("recommendation booleans pass through unchanged", () => {
  const { value } = validateSettings({
    ...DEFAULT_SETTINGS,
    recommendationsEnabled: true,
    recommendationShowImage: false,
    recommendationShowPrice: false,
    recommendationShowButton: false,
    recommendationHideAfterGoal: false,
  });
  assert.equal(value.recommendationsEnabled, true);
  assert.equal(value.recommendationShowImage, false);
  assert.equal(value.recommendationShowPrice, false);
  assert.equal(value.recommendationShowButton, false);
  assert.equal(value.recommendationHideAfterGoal, false);
});
