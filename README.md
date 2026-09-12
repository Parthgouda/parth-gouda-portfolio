# Parth Gouda Portfolio

Premium React/TypeScript portfolio with Supabase-backed booking requests and protected admin routes.

## Local setup

1. `npm install`
2. Copy `.env.example` to `.env` and add the Supabase URL + anon key.
3. Create the `bookings` table using `supabase/schema.sql`.
4. Deploy `supabase/functions/submit-booking`.
5. Configure these Edge Function secrets:
   - `SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
6. Configure your Supabase Auth admin user and ensure its JWT contains the `role=admin` claim through your chosen secure authorization setup.
7. `npm run dev`

## Important

The public browser never receives the Supabase service-role key or Resend API key. Booking insertion and email sending happen in the Edge Function.

For production, add rate limiting/Turnstile or reCAPTCHA at the Edge Function layer, configure your exact allowed origin instead of `*`, and use a robust server-side sequence/UUID strategy if multiple concurrent submissions can occur. The provided request-number implementation is suitable as a starter but should be replaced with a transactional sequence/RPC for strict collision-free numbering under high concurrency.
