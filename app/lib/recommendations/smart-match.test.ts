import { test } from "node:test";
import assert from "node:assert/strict";

import { smartMatch, scorePrice } from "./smart-match";

interface P {
  id: string;
  price: number;
}

const pool: P[] = [
  { id: "a", price: 5 },
  { id: "b", price: 9 },
  { id: "c", price: 10 },
  { id: "d", price: 11 },
  { id: "e", price: 40 },
  { id: "f", price: 200 },
];

test("exact-match price scores best (zero)", () => {
  assert.equal(scorePrice(10, 10), 0);
});

test("a closer price scores lower than a farther one", () => {
  assert.ok(scorePrice(11, 10) < scorePrice(20, 10));
});

test("an extremely expensive product is penalized beyond its raw distance", () => {
  // $200 for a $10 gap: raw ratio is 19, plus the overshoot penalty on top.
  assert.ok(scorePrice(200, 10) > 19);
});

test("picks the product nearest the remaining amount", () => {
  const [best] = smartMatch(pool, 10, 1);
  assert.equal(best.id, "c");
});

test("orders the top picks by closeness to remaining", () => {
  // c=10 is exact; b=9 and d=11 are both 10% away (tie → input order b, d).
  const ids = smartMatch(pool, 10, 3).map((p) => p.id);
  assert.deepEqual(ids, ["c", "b", "d"]);
});

test("never returns more than max", () => {
  assert.equal(smartMatch(pool, 10, 2).length, 2);
});

test("ranks the extremely expensive product dead last", () => {
  const ids = smartMatch(pool, 10, pool.length).map((p) => p.id);
  assert.equal(ids[ids.length - 1], "f");
});

test("excludes the extremely expensive product when max is small", () => {
  const ids = smartMatch(pool, 10, 5).map((p) => p.id);
  assert.ok(!ids.includes("f"));
});

test("falls back to the closest prices when nothing is in-band", () => {
  const far: P[] = [
    { id: "x", price: 100 },
    { id: "y", price: 500 },
    { id: "z", price: 60 },
  ];
  const [best] = smartMatch(far, 10, 1);
  assert.equal(best.id, "z");
});

test("ignores products with a non-positive or non-finite price", () => {
  const messy: P[] = [
    { id: "zero", price: 0 },
    { id: "neg", price: -5 },
    { id: "nan", price: Number.NaN },
    { id: "ok", price: 12 },
  ];
  const ids = smartMatch(messy, 10, 4).map((p) => p.id);
  assert.deepEqual(ids, ["ok"]);
});

test("stable order: equal scores keep input order", () => {
  const tied: P[] = [
    { id: "first", price: 12 },
    { id: "second", price: 8 },
  ];
  // 12 and 8 are both 20% away from 10 → equal score → input order wins.
  assert.equal(scorePrice(12, 10), scorePrice(8, 10));
  const ids = smartMatch(tied, 10, 2).map((p) => p.id);
  assert.deepEqual(ids, ["first", "second"]);
});

test("max of 0 (or less) returns nothing", () => {
  assert.deepEqual(smartMatch(pool, 10, 0), []);
});

test("remaining <= 0 ranks by cheapest", () => {
  const [best] = smartMatch(pool, 0, 1);
  assert.equal(best.id, "a");
});

test("an empty pool returns an empty result", () => {
  assert.deepEqual(smartMatch([], 10, 3), []);
});
