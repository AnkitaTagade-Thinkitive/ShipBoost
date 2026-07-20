import { test } from "node:test";
import assert from "node:assert/strict";

import {
  DEFAULT_REC_BUTTON,
  normalizeRecButton,
  recButtonClasses,
  recButtonCssVars,
  recButtonIconSvg,
  sanitizeSvg,
} from "./recButton";

test("normalize fills defaults and never leaves an empty label", () => {
  const b = normalizeRecButton({});
  assert.equal(b.text, "Add to cart");
  assert.equal(b.bg, "");
  assert.equal(b.width, "");
  assert.equal(b.iconPosition, "left");
});

test("normalize trims strings and drops unknown keys", () => {
  const b = normalizeRecButton({ bg: "  #111  ", nope: "x", radius: " 6 " });
  assert.equal(b.bg, "#111");
  assert.equal(b.radius, "6");
  assert.ok(!("nope" in b));
});

test("legacy fullWidth:true migrates to width 'full'", () => {
  assert.equal(normalizeRecButton({ fullWidth: true }).width, "full");
  assert.equal(normalizeRecButton({ width: "fit", fullWidth: true }).width, "fit");
});

test("normalize rejects an unknown size", () => {
  assert.equal(normalizeRecButton({ size: "huge" }).size, "");
  assert.equal(normalizeRecButton({ size: "large" }).size, "large");
});

test("default config produces NO css vars (pure inheritance)", () => {
  assert.deepEqual(recButtonCssVars(DEFAULT_REC_BUTTON), {});
});

test("only non-empty fields become css vars (per-property override)", () => {
  const vars = recButtonCssVars({ ...DEFAULT_REC_BUTTON, bg: "#7c3aed" });
  assert.deepEqual(vars, { "--sb-rec-btn-bg-color": "#7c3aed" });
});

test("numeric fields get a px unit; radius/border width too", () => {
  const vars = recButtonCssVars({
    ...DEFAULT_REC_BUTTON,
    radius: "6",
    borderWidth: "2",
    fontSize: "14",
  });
  assert.equal(vars["--sb-rec-btn-radius"], "6px");
  assert.equal(vars["--sb-rec-btn-border-width"], "2px");
  assert.equal(vars["--sb-rec-btn-font-size"], "14px");
});

test("size preset seeds height, padding and font size", () => {
  const vars = recButtonCssVars({ ...DEFAULT_REC_BUTTON, size: "large" });
  assert.equal(vars["--sb-rec-btn-height"], "40px");
  assert.equal(vars["--sb-rec-btn-padding"], "0 22px");
  assert.equal(vars["--sb-rec-btn-font-size"], "15px");
});

test("explicit values override the size preset", () => {
  const vars = recButtonCssVars({
    ...DEFAULT_REC_BUTTON,
    size: "large",
    fontSize: "12",
    paddingX: "10",
  });
  assert.equal(vars["--sb-rec-btn-font-size"], "12px");
  assert.equal(vars["--sb-rec-btn-padding"], "0 10px");
});

test("vertical padding switches to auto height with symmetric padding", () => {
  const vars = recButtonCssVars({
    ...DEFAULT_REC_BUTTON,
    paddingX: "18",
    paddingY: "10",
  });
  assert.equal(vars["--sb-rec-btn-padding"], "10px 18px");
  assert.equal(vars["--sb-rec-btn-height"], "auto");
});

test("border style, hover vars and transition are emitted", () => {
  const vars = recButtonCssVars({
    ...DEFAULT_REC_BUTTON,
    borderStyle: "dashed",
    hoverBg: "#222",
    transitionDuration: "200",
    transitionTiming: "ease-out",
  });
  assert.equal(vars["--sb-rec-btn-border-style"], "dashed");
  assert.equal(vars["--sb-rec-btn-hover-bg"], "#222");
  assert.equal(vars["--sb-rec-btn-transition"], "all 200ms ease-out");
});

test("alignment maps to the justify var", () => {
  assert.equal(
    recButtonCssVars({ ...DEFAULT_REC_BUTTON, align: "center" })[
      "--sb-rec-btn-justify"
    ],
    "center",
  );
});

test("width maps to layout classes", () => {
  assert.equal(
    recButtonClasses({ ...DEFAULT_REC_BUTTON, width: "full" }),
    "sb-rec-btn-w-full",
  );
  assert.equal(recButtonClasses(DEFAULT_REC_BUTTON), "");
});

test("preset icon returns an SVG; custom SVG is sanitized", () => {
  assert.ok(
    recButtonIconSvg({ ...DEFAULT_REC_BUTTON, icon: "cart" }).startsWith("<svg"),
  );
  const dirty = '<svg onload="x()"><script>bad()</script></svg>';
  const clean = sanitizeSvg(dirty);
  assert.ok(clean.indexOf("onload") === -1);
  assert.ok(clean.indexOf("<script") === -1);
  assert.equal(sanitizeSvg("not an svg"), "");
});
