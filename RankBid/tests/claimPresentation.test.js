import test from "node:test";
import assert from "node:assert/strict";
import { claimTimestamp, sortByBid, utcDayKey } from "../src/utils/claimPresentation.js";

test("paid listing is grouped by its UTC payment day", () => {
  const claim = { paid_at: "2026-10-28T00:30:00+05:30", created_at: "2026-10-28T00:30:00Z" };
  assert.equal(utcDayKey(claimTimestamp(claim)), "2026-10-27");
});

test("daily and category leaders sort by bid, then earlier payment", () => {
  const claims = [
    { id: 1, amount: 10, paid_at: "2026-10-28T10:00:00Z" },
    { id: 2, amount: 20, paid_at: "2026-10-28T09:00:00Z" },
    { id: 3, amount: 20, paid_at: "2026-10-28T08:00:00Z" },
  ];
  assert.deepEqual(sortByBid(claims).map((claim) => claim.id), [3, 2, 1]);
});
