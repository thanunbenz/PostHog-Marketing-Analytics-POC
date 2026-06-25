# DeepRun · PostHog Marketing-Analytics POC

A runnable proof-of-concept for the Buy-First Marketing Analytics PRD. It
implements the four instrumentation points (SPA pageview, named events,
server-side `subscription_started`, first-touch UTM) and runs **with or without**
a PostHog key.

## Prerequisites

- Node.js 22+
- A PostHog account only if you want LIVE mode (free tier is enough)

## Quick start (demo mode — no key needed)

```bash
npm install
npm run dev      # http://localhost:3030
```

The top-right badge shows **DEMO MODE**: events are mirrored to the on-screen
"Live event stream" but not sent anywhere. Good enough to demo the whole flow.

## Connect to PostHog (LIVE mode)

1. Sign up at <https://posthog.com> and pick a region (EU or US).
2. Settings → Project → **Project API Key** (`phc_...`), copy it.
3. Create `.env` from the template and fill it:

   ```bash
   cp .env.example .env
   ```

   ```bash
   NEXT_PUBLIC_POSTHOG_KEY=phc_xxxx
   NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com   # match your region
   POSTHOG_SERVER_KEY=phc_xxxx                          # same key is fine
   POSTHOG_SERVER_HOST=https://eu.i.posthog.com
   ```

4. `npm run dev` again. The badge flips to **LIVE** and events flow into PostHog
   (Activity → Events, within seconds).

> The `phc_` key is write-only and safe to expose in the browser.

## Demo walkthrough (for the Monday meeting)

1. Click a deeplink chip (e.g. **YouTube · preflop-series**) — simulates landing
   from that campaign. First-touch UTM appears top-left.
   *To switch campaign, press **reset** first (first-touch never overwrites.)*
2. Run journey buttons 1 → 5. Each named event appears tagged `client`, carrying
   the UTM source.
3. Step 5 (**Subscribe**) calls the webhook; `subscription_started` returns
   tagged `server` — same person, still attributed to youtube.
4. Bottom panel = the funnel + campaign table PostHog produces (illustrative).

## Files in this folder

| File | What it is |
| --- | --- |
| `POC-REPORT.md` | Main report (PRD format) — the deliverable. `.docx` lives in `docs/deeprun/reports/` |
| `assets/posthog-activity-proof.png` | Screenshot proof of the live event |
| `src/components/PageviewTracker.tsx` | SPA `page_view` tracker (PRD C2) |
| `src/components/JourneySimulator.tsx` | Fires the named events (PRD C3) |
| `src/app/api/billing/webhook/route.ts` | Server-side `subscription_started` (PRD C4) |
| `src/lib/attribution.ts` | First-touch UTM capture (PRD §3) |
| `src/lib/analytics.ts` | posthog-js wrapper + on-screen event bus |
| `.env.example` | Template for the PostHog keys |

## Mapping to production (deeprun-frontend)

| POC | Production |
| --- | --- |
| `PageviewTracker` in `app/layout.tsx` | `src/app/[lang]/layout.tsx` |
| posthog-js init in `providers.tsx` | loaded via existing GTM (GTM-KM659L5K) |
| `api/billing/webhook/route.ts` | `src/app/api/billing/webhook/route.ts` — fire inside `handleSubscriptionUpsert` after the `shouldMirror()` guard (route.ts:106), and dedupe; do **not** use the raw `customer.subscription.created` case |
| (not in POC) | PostHog host in CSP `src/lib/security-headers.ts`; env-var pipeline (infra / P'F) |

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| Badge stuck on DEMO MODE | `NEXT_PUBLIC_POSTHOG_KEY` empty — set it in `.env`, restart |
| UTM panel shows "—" after a 2nd campaign | first-touch is sticky by design; press **reset**, then click the deeplink |
| Webhook returns `"mode":"demo"` | `POSTHOG_SERVER_KEY` empty — expected; set it to send for real |
| Events not in PostHog | wrong region host — match `*_HOST` to your EU/US project |
| Port 3030 in use | change the `-p` flag in `package.json` scripts |
