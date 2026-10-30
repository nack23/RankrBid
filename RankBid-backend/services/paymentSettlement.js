class PaymentError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

function createPaymentSettlement(pool, razorpay) {
  async function settleCapturedPayment(orderId, paymentId, checkoutSignature = null) {
    if (!orderId || !paymentId) throw new PaymentError("Payment identifiers are required");

    const result = await pool.query(
      `SELECT id, claim_id, amount, currency, exchange_rate, original_amount_usd,
              status, razorpay_order_id, razorpay_payment_id
       FROM payments WHERE razorpay_order_id = $1 LIMIT 1`,
      [orderId]
    );
    const payment = result.rows[0];
    if (!payment) throw new PaymentError("Payment order not found", 404);

    if (payment.status === "paid") {
      if (payment.razorpay_payment_id !== paymentId) throw new PaymentError("Order was paid with a different payment", 409);
      return { payment, claimId: payment.claim_id, alreadyPaid: true };
    }

    const captured = await razorpay.payments.fetch(paymentId);
    if (captured.order_id !== orderId) throw new PaymentError("Payment order mismatch");
    if (captured.currency !== "INR" || payment.currency !== "INR") throw new PaymentError("Payment currency mismatch");
    if (Number(captured.amount) !== Math.round(Number(payment.amount) * 100)) throw new PaymentError("Payment amount mismatch");
    if (captured.status !== "captured") throw new PaymentError("Payment has not been captured yet", 409);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const locked = await client.query(
        "SELECT id, claim_id, status, razorpay_payment_id FROM payments WHERE id = $1 FOR UPDATE",
        [payment.id]
      );
      const current = locked.rows[0];
      if (!current) throw new PaymentError("Payment order not found", 404);
      if (current.status === "paid") {
        if (current.razorpay_payment_id !== paymentId) throw new PaymentError("Order was paid with a different payment", 409);
        await client.query("COMMIT");
        return { payment: { ...payment, status: "paid", razorpay_payment_id: paymentId }, claimId: current.claim_id, alreadyPaid: true };
      }

      await client.query(
        `UPDATE payments SET razorpay_payment_id = $1, razorpay_signature = $2,
                status = 'paid', paid_at = NOW() WHERE id = $3`,
        [paymentId, checkoutSignature, payment.id]
      );
      await client.query(
        "UPDATE rank_claims SET status = 'paid', paid_at = NOW() WHERE id = $1",
        [current.claim_id]
      );
      await client.query("COMMIT");
      return { payment: { ...payment, status: "paid", razorpay_payment_id: paymentId }, claimId: current.claim_id, alreadyPaid: false };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  return { settleCapturedPayment };
}

module.exports = { PaymentError, createPaymentSettlement };
