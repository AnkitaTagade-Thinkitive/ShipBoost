import { test } from "node:test";
import assert from "node:assert/strict";

import { normalizeHexColor, contrastRatio, readableTextColor } from "./color";

test("normalizeHexColor adds a leading # when missing", () => {
  assert.equal(normalizeHexColor("2E7D32"), "#2E7D32");
});

test("normalizeHexColor leaves an already-# value unchanged", () => {
  assert.equal(normalizeHexColor("#2E7D32"), "#2E7D32");
});

test("normalizeHexColor returns empty input as-is", () => {
  assert.equal(normalizeHexColor(""), "");
  assert.equal(normalizeHexColor("   "), "");
});

test("contrastRatio of black on white is ~21", () => {
  const ratio = contrastRatio("#000000", "#ffffff");
  assert.ok(ratio !== null && Math.abs(ratio - 21) < 0.1);
});

test("contrastRatio supports 3-digit hex", () => {
  const ratio = contrastRatio("#000", "#fff");
  assert.ok(ratio !== null && Math.abs(ratio - 21) < 0.1);
});

test("contrastRatio returns null for invalid hex", () => {
  assert.equal(contrastRatio("zzz", "#ffffff"), null);
});

test("readableTextColor keeps a preferred color that is already legible", () => {
  assert.equal(readableTextColor("#ffffff", "#000000"), "#000000");
});

test("readableTextColor swaps an illegible preferred color", () => {
  const result = readableTextColor("#ffffff", "#ffffff");
  assert.notEqual(result.toLowerCase(), "#ffffff");
});
