# DeepRun · PostHog Marketing-Analytics POC

Proof-of-concept for the **Buy-First Marketing Analytics PRD**. It implements the
"~1 day of real engineering" — SPA pageview, named events, server-side
`subscription_started`, first-touch UTM — and runs locally **without a PostHog
key** (demo mode mirrors every event on screen).

Purpose: show management the dev work is small and the attribution chain
(YouTube click → payment) actually works, before buying any SaaS.

## What it proves (vs PRD)

| PRD requirement | File |
| --- | --- |
| C2 · SPA `page_view` tracker (the open gap, §6.2) | `src/components/PageviewTracker.tsx` |
| C3 · named events: sign_up, lesson_started, paywall_viewed, checkout_started | `src/components/JourneySimulator.tsx` |
| C4 · server-side `subscription_started` (authoritative, §6.4) | `src/app/api/billing/webhook/route.ts` |
| §3 · first-touch UTM carried through to payment | `src/lib/attribution.ts` |
| §4 · funnel + campaign comparison (illustrative only) | `src/components/FunnelStory.tsx` |

## Run

```bash
npm install
npm run dev      # http://localhost:3030
```

No env required → **demo mode**: events show in the on-screen "Live event
stream"; the webhook reports what it *would* send. To send to PostHog for real,
`cp .env.example .env` and fill the keys (banner flips to LIVE).

## How it works

```text
Deeplink (?utm_source=youtube)         <- Dub / Google URL Builder produces this
        |
        v  land
PageviewTracker  -- captureFirstTouch() --> localStorage (first-touch UTM)
        |                                          |
        |  every named event reads UTM ------------+
        v
capture()  --> posthog-js (LIVE)  +  on-screen log (always)
        |
        v  step 5
POST /api/billing/webhook  --> posthog-node  $subscription_started$
                               distinct_id = userId  (stitches to same person)
```

- **First-touch** (`attribution.ts`): UTMs are stored on first landing and never
  overwritten — so a payment days later is still credited to the original source.
- **Demo mode** (`analytics.ts`): when no key, `posthog.capture` is skipped but
  the event is still mirrored to the live stream, so the demo is observable.

## Demo script (management walkthrough)

1. Click a deeplink chip (e.g. **YouTube · preflop-series**) → simulates landing
   from that campaign. First-touch UTM appears top-left.
   *To switch campaign, press **reset** first (first-touch never overwrites).*
2. Run journey buttons 1→5. Each named event appears tagged `client`, carrying
   the UTM source.
3. Step 5 (**Subscribe**) POSTs to the webhook; `subscription_started` returns
   tagged `server` — same `distinct_id`, still attributed to youtube, even
   though it fired server-side.
4. Bottom panel = the PostHog funnel + campaign table management reads:
   newsletter converts ~6× the FB ad → shift budget.

## Mapping to production (deeprun-frontend)

| POC | Production |
| --- | --- |
| `PageviewTracker` in `app/layout.tsx` | `src/app/[lang]/layout.tsx` |
| `providers.tsx` posthog-js init | loaded via existing GTM container (GTM-KM659L5K), not a direct init |
| `api/billing/webhook/route.ts` | `src/app/api/billing/webhook/route.ts` — see note below |
| (not in POC) | add PostHog host to CSP `src/lib/security-headers.ts`; wire `NEXT_PUBLIC_POSTHOG_*` through Dockerfile + CI + build-args + GitHub env (infra/P'F) |

### Where `subscription_started` really goes

Do **not** fire it on the raw `customer.subscription.created` case. That case
also receives `incomplete` (not-yet-paid) subscriptions, which the real webhook
skips via `shouldMirror()` (`route.ts:106`). Firing there would count unpaid
subs and inflate conversions.

Fire it **inside `handleSubscriptionUpsert`, after the `shouldMirror()` guard
passes**, and **dedupe**: `created`/`updated` fire on every renewal and plan
change, so guard to emit only on the first transition into `active` (e.g. check
prior status, or key off `invoice.payment_succeeded` with
`billing_reason = subscription_create`). Otherwise one payer is counted many
times.

## Out of scope (intentionally)

- Cookie-consent gate and PII masking in replays — launch requirement (§6, §10),
  not a POC concern.
- `subscription_canceled` (C4 pairs it with started) — same pattern, omitted.
- Autocapture (C1) — a PostHog feature, nothing to build.
- Funnel/campaign numbers in `FunnelStory.tsx` are the PRD's illustrative
  figures, not live data.

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| Banner stuck on DEMO MODE | `NEXT_PUBLIC_POSTHOG_KEY` empty — set it in `.env`, restart |
| UTM panel shows "—" after clicking a 2nd campaign | first-touch is sticky by design; press **reset** then click the deeplink |
| Webhook returns `"mode":"demo"` | `POSTHOG_SERVER_KEY` empty — expected; set it to send for real |
| Port 3030 in use | edit the `-p` flag in `package.json` scripts |
