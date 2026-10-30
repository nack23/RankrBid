const Razorpay = require("razorpay");
const crypto = require("crypto");
const pool = require("../db");
const { PaymentError, createPaymentSettlement } = require("../services/paymentSettlement");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
const { settleCapturedPayment } = createPaymentSettlement(pool, razorpay);

let paymentMethodsCache = null;

async function getAvailablePaymentMethods(req, res) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  if (!keyId) return res.status(503).json({ success: false, message: "Payment methods are not configured" });

  if (paymentMethodsCache && paymentMethodsCache.expiresAt > Date.now()) {
    return res.json({ success: true, methods: paymentMethodsCache.methods });
  }

  try {
    const response = await fetch(`https://api.razorpay.com/v1/methods?key_id=${encodeURIComponent(keyId)}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Razorpay methods returned ${response.status}`);
    const available = await response.json();
    const enabled = (value) => value === true || value === 1 || (value && typeof value === "object" && Object.keys(value).length > 0);
    const methods = {
      upi: Boolean(enabled(available.upi)),
      card: Boolean(enabled(available.credit_card) || enabled(available.debit_card) || enabled(available.card)),
      netbanking: Boolean(enabled(available.netbanking)),
      wallet: Boolean(enabled(available.wallet)),
    };
    methods.other = Object.values(methods).some(Boolean);
    paymentMethodsCache = { methods, expiresAt: Date.now() + 60_000 };
    return res.json({ success: true, methods });
  } catch (error) {
    console.error("Razorpay payment method lookup failed:", error.message);
    return res.status(503).json({ success: false, message: "Could not check available payment methods" });
  }
}


// =====================================================
// USD → INR EXCHANGE RATE
// =====================================================
//
// For now, keep the rate in backend .env:
//
// USD_TO_INR_RATE=88.50
//
// IMPORTANT:
// Never put this rate in Vite/frontend .env.
// This conversion must happen on the backend.
// =====================================================

function getUsdToInrRate() {
  const rate = Number(
    process.env.USD_TO_INR_RATE
  );

  if (
    !Number.isFinite(rate) ||
    rate <= 0
  ) {
    throw new Error(
      "Invalid USD_TO_INR_RATE in backend .env"
    );
  }

  return rate;
}

// Public, read-only quote. The same server-side rate is used when the order is created.
function getPaymentQuote(req, res) {
  try {
    const amountUsd = Number(req.query.amountUsd);
    if (!Number.isFinite(amountUsd) || amountUsd <= 0 || amountUsd > 1000000) {
      return res.status(400).json({ success: false, message: "Valid amountUsd is required" });
    }
    const exchangeRate = getUsdToInrRate();
    const amountInr = Number((amountUsd * exchangeRate).toFixed(2));
    return res.json({ success: true, amountUsd, amountInr, exchangeRate, currency: "INR" });
  } catch (error) {
    return res.status(503).json({ success: false, message: "INR quote is temporarily unavailable" });
  }
}


// =====================================================
// CREATE RAZORPAY ORDER
// =====================================================

async function createRazorpayOrder(req, res) {
  try {
    const { claimId } =
      req.body || {};

    // -------------------------------------------------
    // Validate claim ID
    // -------------------------------------------------

    if (!claimId) {
      return res.status(400).json({
        success: false,
        message: "claimId is required",
      });
    }

    console.log("");
    console.log(
      "========================================"
    );
    console.log(
      "CREATE RAZORPAY ORDER"
    );
    console.log(
      "Received claimId:",
      claimId
    );
    console.log(
      "========================================"
    );

    // -------------------------------------------------
    // Get claim
    // -------------------------------------------------

    const claimResult =
      await pool.query(
        `
        SELECT
          id,
          amount,
          status,
          target,
          category_id
        FROM rank_claims
        WHERE id = $1
        `,
        [claimId]
      );

    // -------------------------------------------------
    // Claim not found
    // -------------------------------------------------

    if (
      claimResult.rows.length === 0
    ) {
      console.log(
        "❌ Claim not found:",
        claimId
      );

      return res.status(404).json({
        success: false,
        message: "Claim not found",
      });
    }

    const claim =
      claimResult.rows[0];

    // -------------------------------------------------
    // DEBUG
    // -------------------------------------------------

    console.log(
      "Claim ID:",
      claim.id
    );

    console.log(
      "Claim Amount USD:",
      claim.amount
    );

    console.log(
      "Claim Status:",
      claim.status
    );

    console.log(
      "Claim Target:",
      claim.target
    );

    // -------------------------------------------------
    // Already paid check
    // -------------------------------------------------

    if (
      String(claim.status).toLowerCase() ===
      "paid"
    ) {
      console.log(
        "❌ CLAIM IS ALREADY PAID"
      );

      return res.status(400).json({
        success: false,
        message: "This claim is already paid",
      });
    }

    // -------------------------------------------------
    // Validate amount
    // -------------------------------------------------

    const usdAmount =
      Number(claim.amount);

    if (
      !Number.isFinite(
        usdAmount
      ) ||
      usdAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid claim amount",
      });
    }

    // -------------------------------------------------
    // Get USD → INR rate
    // -------------------------------------------------

    const exchangeRate =
      getUsdToInrRate();

    // -------------------------------------------------
    // Convert USD → INR
    // -------------------------------------------------

    const inrAmount =
      Number(
        (
          usdAmount *
          exchangeRate
        ).toFixed(2)
      );

    if (
      !Number.isFinite(
        inrAmount
      ) ||
      inrAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid converted INR amount",
      });
    }

    // -------------------------------------------------
    // Razorpay uses smallest currency unit
    //
    // ₹100.50
    // becomes
    // 10050 paise
    // -------------------------------------------------

    const razorpayAmount =
      Math.round(
        inrAmount * 100
      );

    console.log(
      "USD Amount:",
      usdAmount
    );

    console.log(
      "USD → INR Rate:",
      exchangeRate
    );

    console.log(
      "INR Amount:",
      inrAmount
    );

    console.log(
      "Razorpay Amount Paise:",
      razorpayAmount
    );

    // -------------------------------------------------
    // Create Razorpay order
    // -------------------------------------------------

    const options = {
      amount:
        razorpayAmount,

      currency:
        "INR",

      receipt:
        `rankbid_claim_${claimId}_${Date.now()}`,
    };

    const order =
      await razorpay.orders.create(
        options
      );

    console.log(
      "✅ Razorpay Order Created:",
      order.id
    );

    // -------------------------------------------------
    // Store payment
    // -------------------------------------------------

    const paymentResult =
      await pool.query(
        `
        INSERT INTO payments (
          claim_id,
          amount,
          payment_method,
          payment_reference,
          status,
          razorpay_order_id,
          currency,
          exchange_rate,
          original_amount_usd
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9
        )
        RETURNING
          id,
          claim_id,
          amount,
          payment_method,
          payment_reference,
          status,
          razorpay_order_id,
          currency,
          exchange_rate,
          original_amount_usd,
          created_at
        `,
        [
          claimId,
          inrAmount,
          "razorpay",
          order.id,
          "pending",
          order.id,
          "INR",
          exchangeRate,
          usdAmount,
        ]
      );

    console.log(
      "✅ Payment record created:",
      paymentResult.rows[0].id
    );

    // -------------------------------------------------
    // Response
    // -------------------------------------------------

    return res.status(200).json({
      success: true,

      // Public checkout key only. The Razorpay secret never leaves the server.
      keyId: process.env.RAZORPAY_KEY_ID,

      order: {
        id:
          order.id,

        amount:
          order.amount,

        currency:
          order.currency,

        status:
          order.status,
      },

      originalAmountUsd:
        usdAmount,

      exchangeRate:
        exchangeRate,

      amountInr:
        inrAmount,

      payment:
        paymentResult.rows[0],
    });

  } catch (error) {
    console.error(
      "",
      error
    );

    console.error(
      "Razorpay order creation error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to create Razorpay order",
    });
  }
}


// =====================================================
// VERIFY RAZORPAY PAYMENT
// =====================================================

function signaturesMatch(expected, received) {
  if (!/^[a-f0-9]{64}$/i.test(received || "")) return false;
  return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(received, "hex"));
}

async function verifyRazorpayPayment(req, res) {
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body || {};
  if (!orderId || !paymentId || !signature) {
    return res.status(400).json({ success: false, message: "Payment verification details are required" });
  }

  try {
    const stored = await pool.query(
      "SELECT razorpay_order_id FROM payments WHERE razorpay_order_id = $1 LIMIT 1",
      [orderId]
    );
    if (!stored.rows.length) throw new PaymentError("Payment order not found", 404);
    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(stored.rows[0].razorpay_order_id + "|" + paymentId).digest("hex");
    if (!signaturesMatch(expected, signature)) throw new PaymentError("Invalid payment signature");

    const result = await settleCapturedPayment(orderId, paymentId, signature);
    return res.status(200).json({
      success: true,
      message: result.alreadyPaid ? "Payment already verified" : "Payment verified successfully",
      payment: {
        payment_id: paymentId,
        order_id: orderId,
        status: "paid",
        amount_inr: Number(result.payment.amount),
        original_amount_usd: Number(result.payment.original_amount_usd),
        exchange_rate: Number(result.payment.exchange_rate),
      },
      claim: { id: result.claimId, status: "paid" },
    });
  } catch (error) {
    console.error("Razorpay payment verification failed:", error.message);
    return res.status(error.status || 500).json({ success: false, message: error.status ? error.message : "Payment verification is temporarily unavailable" });
  }
}

async function handleRazorpayWebhook(req, res) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return res.status(503).json({ success: false, message: "Webhook is not configured" });
  if (!Buffer.isBuffer(req.body)) return res.status(400).json({ success: false, message: "Raw webhook body is required" });

  const expected = crypto.createHmac("sha256", secret).update(req.body).digest("hex");
  if (!signaturesMatch(expected, req.get("x-razorpay-signature"))) {
    return res.status(400).json({ success: false, message: "Invalid webhook signature" });
  }

  try {
    const event = JSON.parse(req.body.toString("utf8"));
    if (event.event !== "payment.captured") return res.status(200).json({ success: true });
    const payment = event.payload?.payment?.entity;
    if (!payment?.id || !payment?.order_id) throw new PaymentError("Webhook payment identifiers are missing");
    await settleCapturedPayment(payment.order_id, payment.id);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Razorpay webhook processing failed:", error.message);
    return res.status(error.status || 500).json({ success: false, message: "Webhook processing failed" });
  }
}

async function getPaymentStatus(req, res) {
  const orderId = req.params.orderId;
  if (!/^order_[A-Za-z0-9_]{1,80}$/.test(orderId || "")) {
    return res.status(400).json({ success: false, message: "Invalid order ID" });
  }
  try {
    const result = await pool.query(
      "SELECT p.status, p.razorpay_payment_id, p.amount, p.original_amount_usd, " +
      "rc.id AS claim_id, rc.target, c.name AS category " +
      "FROM payments p JOIN rank_claims rc ON rc.id = p.claim_id " +
      "JOIN categories c ON c.id = rc.category_id " +
      "WHERE p.razorpay_order_id = $1 LIMIT 1",
      [orderId]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: "Payment order not found" });
    const row = result.rows[0];
    return res.json({
      success: true,
      status: row.status === "paid" ? "paid" : "pending",
      orderId,
      paymentId: row.status === "paid" ? row.razorpay_payment_id : null,
      amountInr: Number(row.amount),
      claim: { id: row.claim_id, target: row.target, category: row.category, amountUsd: Number(row.original_amount_usd) },
    });
  } catch (error) {
    console.error("Payment status lookup failed:", error.message);
    return res.status(503).json({ success: false, message: "Payment status is temporarily unavailable" });
  }
}

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getPaymentQuote,
  getAvailablePaymentMethods,
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook,
  getPaymentStatus,
};
