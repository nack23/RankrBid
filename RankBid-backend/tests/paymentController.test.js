const test = require("node:test");
const assert = require("node:assert/strict");

process.env.RAZORPAY_KEY_ID = "rzp_test_public_key";
process.env.RAZORPAY_KEY_SECRET = "test_secret";
process.env.USD_TO_INR_RATE = "95.50";

const fakeOrders = [];
const razorpayPath = require.resolve("razorpay");
const dbPath = require.resolve("../db");
require.cache[razorpayPath] = {
  id: razorpayPath,
  filename: razorpayPath,
  loaded: true,
  exports: class FakeRazorpay {
    constructor() {
      this.orders = {
        create: async (options) => {
          fakeOrders.push(options);
          return { id: "order_test_1", amount: options.amount, currency: options.currency, status: "created" };
        },
      };
    }
  },
};
require.cache[dbPath] = {
  id: dbPath,
  filename: dbPath,
  loaded: true,
  exports: {
    query: async (sql) => {
      if (sql.includes("FROM rank_claims")) {
        return { rows: [{ id: 7, amount: 20, status: "pending", target: "example.com", category_id: 2 }] };
      }
      return { rows: [{ id: 9, claim_id: 7, amount: 1910, currency: "INR" }] };
    },
  },
};

const { getPaymentQuote, createRazorpayOrder } = require("../controllers/paymentController");

function response() {
  return {
    code: 200,
    body: null,
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

test("quote uses the server-side INR rate and rejects invalid bids", () => {
  const valid = response();
  getPaymentQuote({ query: { amountUsd: "20" } }, valid);
  assert.equal(valid.body.amountInr, 1910);
  assert.equal(valid.body.currency, "INR");
  assert.equal(valid.body.keyId, undefined);

  const invalid = response();
  getPaymentQuote({ query: { amountUsd: "-1" } }, invalid);
  assert.equal(invalid.code, 400);
});

test("order charges INR and returns only the public checkout key", async () => {
  const result = response();
  await createRazorpayOrder({ body: { claimId: 7 } }, result);
  assert.equal(result.code, 200);
  assert.equal(fakeOrders[0].amount, 191000);
  assert.equal(fakeOrders[0].currency, "INR");
  assert.equal(result.body.amountInr, 1910);
  assert.equal(result.body.keyId, "rzp_test_public_key");
  assert.equal(JSON.stringify(result.body).includes("test_secret"), false);
});
