# Local development and commerce setup

## Laptop resource use

Use `npm run dev`. The launcher uses Webpack, a 1,536 MB JavaScript heap limit per Node process, two Rayon threads, and a lower OS scheduling priority where supported. The heap limit is not a total RAM limit. Next.js build workers and Webpack parallelism are restricted to two; page compilation entries expire after 20 seconds with a one-page buffer. Tailwind only scans `src`.

The launcher refuses concurrent `dev` / `build` runs from these scripts. Stop the running server with Ctrl+C before `npm run build`. A build uses a 2,048 MB heap limit per process. `npm start` serves an already-built site without development compilation. The lock cannot prevent an unrelated terminal or IDE from invoking `next` directly. Do not run a second server or production build alongside development on a memory-constrained machine.

`npm test` runs the regression suite sequentially. `npm run typecheck` and `npm run lint` check code without a production build.

References: [Next.js memory controls](https://nextjs.org/docs/app/guides/memory-usage), [Tailwind source boundaries](https://tailwindcss.com/docs/detecting-classes-in-source-files).

## Current configuration

- Razorpay **test** key pair imported from `../2/server/.env` into private `.env.local`. A read-only Razorpay request accepted those credentials. No real payment was made.
- Numeric prices are now INR: the previous 428 is ₹428. All integer price fields named `*Cents` represent paise for schema compatibility, not an exchange-rate conversion.
- Existing shipping amounts remain numerically unchanged: standard ₹12, free from ₹250, express ₹24. Shared settings are in `src/lib/commerce-config.ts`.
- Seller address, support email, and GSTIN have not yet been supplied. Current documents are payment receipts, not GST tax invoices. No tax rate or GST registration has been fabricated.
- No courier was selected or connected. Paid live orders can receive manual courier and tracking updates. Test orders cannot be dispatched.

## Payment flow

Checkout creates a persisted pending order with an immutable cart/address/price snapshot and a stock reservation. Razorpay receives the server-calculated amount and INR currency. The browser opens Razorpay's hosted checkout; secrets never enter browser code. Verification checks the signature against the saved gateway order, fetches the payment from Razorpay, and requires captured status, exact amount, currency, and order ID. Repeated callbacks are idempotent. A signed webhook also handles `payment.captured` and `order.paid`.

Configure automatic capture in the Razorpay dashboard and the public HTTPS endpoint:

`https://YOUR_DOMAIN/api/payments/webhook`

Use the private `RAZORPAY_WEBHOOK_SECRET` from `.env.local` and subscribe to `payment.captured` and `order.paid`. Localhost cannot receive public webhooks without an HTTPS tunnel. The dashboard/webhook has not been configured automatically. Reference: [Razorpay integration steps](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/) and [webhook validation](https://razorpay.com/docs/webhooks/validate-test/).

Closing checkout does not confirm an order. Use “Resume payment” or “Check payment status” on checkout. A pending checkout freezes its saved items/address and holds inventory until resolved, preventing accidental double payment. Stale or abandoned reservations require operational reconciliation with Razorpay before release; automated expiry, refunds, and customer cancellation are not implemented. Do not delete pending orders or reservations blindly.

Order pages and receipts require the original HTTP-only cart cookie. Print or save the receipt from the paid order page. Email delivery is not configured and the UI does not claim emails were sent.

## Storage and deployment limits

Payment/order/fulfillment records are durable in `.data/commerce.sqlite`, using Node's built-in SQLite (use Node 24). Back up that file with its SQLite WAL safely. This implementation targets a **single persistent Node server**, not ephemeral serverless hosts or multiple replicas. A multi-instance deployment needs a shared transactional database and distributed gateway-creation coordination first.

The existing optional PostgreSQL catalog/cart remains separate. Without DATABASE_URL, the catalog/cart is a development-only in-memory store; those carts reset on process restart, while saved payment orders remain recoverable with the same browser cookie. Configure persistent catalog/cart storage before live use.

Test reservations and paid test orders do not consume live inventory. Reservations are conservative and include pending and paid orders. Current stock figures are the initial stock pool; inventory restocking, reconciliation, and admin management require further operational tooling.

Do not turn on live keys until seller/tax details, persistent deployment storage, real catalog stock, webhook delivery, and a full test-mode hosted checkout have been verified. The automated suite uses mocked payment responses. It is not a completed interactive Razorpay payment test.

## Delivery tracking

Choose a courier and provide its API credentials/pickup details before automatic label creation and booking can be integrated. No shipment has been booked.

For manual dispatch, `POST /api/fulfillment` accepts a server-side `Authorization: Bearer <FULFILLMENT_ADMIN_TOKEN>` and a JSON body with `orderNumber`, `status` (`shipped` or `delivered`), `partner`, `trackingNumber`, and optional HTTPS `trackingUrl`. Keep the token outside browser code. Only paid non-test orders can be updated. Tracking then appears on that customer's order page.

## Seller setup

Set SELLER_NAME, SELLER_ADDRESS, SELLER_EMAIL and, if applicable, SELLER_GSTIN before new orders. Seller details are snapshotted at order creation. A GST tax invoice additionally requires the actual tax configuration and item classifications; the current payment receipt deliberately does not claim GST compliance.
