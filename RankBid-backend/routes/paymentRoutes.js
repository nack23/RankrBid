const express = require("express");

const {
  getPaymentQuote,
  getAvailablePaymentMethods,
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook,
  getPaymentStatus,
} = require("../controllers/paymentController");

const router = express.Router();

router.get("/api/payments/quote", getPaymentQuote);
router.get("/api/payments/methods", getAvailablePaymentMethods);
router.get("/api/payments/status/:orderId", getPaymentStatus);

// The raw body is parsed before express.json(), then HMAC-checked in the handler.
router.post("/api/payments/webhook", handleRazorpayWebhook);


// =====================================================
// CREATE RAZORPAY ORDER
// =====================================================

router.post(
  "/api/payments/create-order",
  createRazorpayOrder
);


// =====================================================
// VERIFY RAZORPAY PAYMENT
// =====================================================

router.post(
  "/api/payments/verify",
  verifyRazorpayPayment
);


module.exports = router;
