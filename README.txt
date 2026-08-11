# BankNiftyCalls — Vercel + WatchPays

## Files
- `public/index.html` — landing page
- `api/create-payment.js` — creates WatchPays payment
- `api/callback.js` — WatchPays callback endpoint
- `.env.example` — environment variable names

## Vercel setup
1. Upload this folder to GitHub.
2. Import the GitHub repository into Vercel.
3. In Vercel: Project → Settings → Environment Variables.
4. Add:
   - `WATCHPAYS_MERCHANT_ID` = `100555424`
   - `WATCHPAYS_API_KEY` = your WatchPays API key
5. Redeploy.
6. Your payment callback URL will be:
   `https://YOUR-VERCEL-DOMAIN.vercel.app/api/callback`

Do not commit the real API key to GitHub.
