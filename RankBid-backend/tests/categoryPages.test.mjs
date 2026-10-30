import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import catalog from "../categoryCatalog.js";
import { CATEGORIES, slugify } from "../../RankBid/src/data/categories.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

test("every category has a matching route, claim page, and backend catalog entry", () => {
  const app = readFileSync(path.join(root, "RankBid/src/App.jsx"), "utf8");
  const routes = new Map([...app.matchAll(/<Route path="\/category\/([^"]+)" element={<(\w+) \/>}/g)]
    .map((match) => [match[1], match[2]]));
  const expected = CATEGORIES.filter((name) => name !== "All")
    .map((name) => ({ name, slug: slugify(name) }));

  assert.deepEqual(catalog, expected);
  assert.equal(routes.size, expected.length);

  for (const { name, slug } of expected) {
    const component = routes.get(slug);
    assert.ok(component, `Missing route for ${name}`);
    const file = path.join(root, `RankBid/src/pages/categories/${component}.jsx`);
    const source = readFileSync(file, "utf8");
    assert.equal(source.match(/const category = "([^"]+)"/)?.[1], name);
    assert.equal(source.match(/const categorySlug\s*=\s*"([^"]+)"/)?.[1], slug);
    assert.match(source, /<ClaimRank\b/);
    assert.match(source, /<ClaimListings\b/);
  }
});
