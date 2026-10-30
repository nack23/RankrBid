const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");

process.env.RAZORPAY_KEY_ID = "rzp_test_webhook_key";
process.env.RAZORPAY_KEY_SECRET = "checkout_test_secret";
process.env.RAZORPAY_WEBHOOK_SECRET = "webhook_test_secret";

let queryCount = 0;
let updateCount = 0;
let paymentStatus = "pending";
let storedPaymentId = null;

const razorpayPath = require.resolve("razorpay");
const dbPath = require.resolve("../db");
require.cache[razorpayPath] = {
  id: razorpayPath, filename: razorpayPath, loaded: true,
  exports: class FakeRazorpay {
    constructor() {
      this.payments = {
        fetch: async () => ({ order_id: "order_test_1", currency: "INR", amount: 191000, status: "captured" }),
      };
    }
  },
};
require.cache[dbPath] = {
  id: dbPath, filename: dbPath, loaded: true,
  exports: {
    query: async () => {
      queryCount += 1;
      return { rows: [{ id: 9, claim_id: 7, amount: 1910, currency: "INR", exchange_rate: 95.5, original_amount_usd: 20, status: paymentStatus, razorpay_order_id: "order_test_1", razorpay_payment_id: storedPaymentId }] };
    },
    connect: async () => ({
      query: async (sql) => {
        if (sql.includes("FOR UPDATE")) return { rows: [{ id: 9, claim_id: 7, status: paymentStatus, razorpay_payment_id: storedPaymentId }] };
        if (sql.startsWith("UPDATE payments")) { updateCount += 1; paymentStatus = "paid"; storedPaymentId = "pay_test_1"; }
        return { rows: [] };
      },
      release() {},
    }),
  },
};

const { handleRazorpayWebhook, verifyRazorpayPayment } = require("../controllers/paymentController");
const body = Buffer.from(JSON.stringify({ event: "payment.captured", payload: { payment: { entity: { id: "pay_test_1", order_id: "order_test_1" } } } }));
const signature = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET).update(body).digest("hex");
const response = () => ({ code: 200, body: null, status(code) { this.code = code; return this; }, json(value) { this.body = value; return this; } });

test("invalid webhook signature is rejected before any database access", async () => {
  const res = response();
  await handleRazorpayWebhook({ body, get: () => "0".repeat(64) }, res);
  assert.equal(res.code, 400);
  assert.equal(queryCount, 0);
  assert.equal(updateCount, 0);
});

test("valid captured-payment webhook settles once even if delivered twice", async () => {
  const req = { body, get: () => signature };
  const first = response();
  await handleRazorpayWebhook(req, first);
  assert.equal(first.code, 200);
  assert.equal(paymentStatus, "paid");
  assert.equal(updateCount, 1);

  const duplicate = response();
  await handleRazorpayWebhook(req, duplicate);
  assert.equal(duplicate.code, 200);
  assert.equal(updateCount, 1);
});

test("checkout callback requires a valid signature even for an already-paid order", async () => {
  const invalid = response();
  await verifyRazorpayPayment({ body: { razorpay_order_id: "order_test_1", razorpay_payment_id: "pay_test_1", razorpay_signature: "0".repeat(64) } }, invalid);
  assert.equal(invalid.code, 400);

  const checkoutSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update("order_test_1|pay_test_1").digest("hex");
  const valid = response();
  await verifyRazorpayPayment({ body: { razorpay_order_id: "order_test_1", razorpay_payment_id: "pay_test_1", razorpay_signature: checkoutSignature } }, valid);
  assert.equal(valid.code, 200);
  assert.equal(valid.body.claim.status, "paid");
});
