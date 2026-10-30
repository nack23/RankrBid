# Payment deployment setup

The listing bid is shown in USD. The backend calculates the INR total, creates a Razorpay INR order, and verifies the captured payment before publishing the claim. Card numbers and UPI credentials stay in Razorpay Checkout.

## Configure the services

1. Set a working `DATABASE_URL` in the backend environment. Run `node createTables.js` once against the intended database before starting the API. Back up an existing production database before applying schema changes.
2. Set `NODE_ENV=production`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `USD_TO_INR_RATE`, and `FRONTEND_ORIGINS` (comma-separated exact HTTPS origins) on the backend. Supply `DATABASE_SSL_CA` if the database provider requires its CA certificate. Keep these secrets out of the frontend build and repository.
3. Set `VITE_API_URL` to the public HTTPS backend origin at frontend build time. Run `npm run build` in `RankBid` and `npm start` in `RankBid-backend` with a production process manager or hosting platform.
4. Add an HTTPS Razorpay webhook pointing to `https://YOUR_API_DOMAIN/api/payments/webhook`. Subscribe to `payment.captured`. Use the webhook secret from that endpoint's Dashboard configuration. The handler validates the signature using the raw request body and fetches the captured payment from Razorpay before marking a claim paid.
5. Enable each intended payment method in the Razorpay account. UPI and international cards need account eligibility/activation; the local UI only offers methods the account reports as available. Test the actual checkout with the correct test or live account. A QR or UPI ID entry is shown only if Razorpay supports it for that account and device.

## Before accepting live traffic

- Confirm the database connection and schema in the target environment. The current local Supabase connection was unavailable during development, so a real database payment round trip has not been verified here.
- Confirm HTTPS, exact CORS origins, a trusted database TLS certificate, and that the public frontend receives only the Razorpay key ID.
- Finalize the operator's full business address and review the Terms and Privacy pages before enabling live checkout. The current pages identify Qais Alam in India and use cosmicwaveglaxy@gmail.com as the provisional support contact.
- In Razorpay test mode, exercise successful payment, failure, checkout dismissal, page refresh, webhook retry, and duplicate webhook delivery. Check that each paid claim is published once and failed or abandoned orders stay pending.
- Make one small authorized live payment after account activation and confirm the INR amount, captured status, webhook delivery, listing visibility, and refund/support process. Razorpay's transaction fees still apply under the merchant's plan.
- Add production monitoring for webhook failures and pending orders, database backups, API rate limiting, and alerting before scaling traffic. A payment that is still pending should be checked in Razorpay before the customer starts a fresh order.
