# PRD Review — Marketing Analytics & Growth Insight System

Reviewer comment on **§4 Step 1 — Create the deeplink (in Dub, ~30 sec)**.

## Comment: do Step 1 with Google tools first, defer Dub.co

The PRD makes Dub.co a paid dependency just to create UTM links. For Step 1 that
job is fully covered by a **free Google tool we can use today** — and GTM (also
Google) is already installed. Recommend starting on Google tooling and treating
Dub.co as an optional upgrade, not a launch requirement.

### What Step 1 actually needs vs. what Dub sells

| Step 1 need | Google option (free) | Dub.co (paid) |
| --- | --- | --- |
| Build a UTM-tagged URL | **Campaign URL Builder** (ga-dev-tools, free) | UTM builder |
| Consistent UTM convention | Shared Google Sheet registry + dropdowns | Link workspace |
| QR code | Free QR generator | Built-in QR |
| Branded short link (deeprun.link) | **Not available** (see gotcha) | Yes |
| Pre-landing click analytics (geo/device/referrer) | No | Yes |

Key point: the link only has to carry UTM text. PostHog reads those UTMs on
landing and measures the whole journey to payment (PRD §3) — so the *click→paid*
analysis the system exists for does **not** depend on Dub. Dub's pre-landing
click counts are nice-to-have, not required to start measuring.

### Recommended Step 1 (Google, ~30 sec, $0)

1. Open **Google Campaign URL Builder** → enter destination + utm_source /
   medium / campaign / content.
2. Copy the generated URL into the YouTube description / ad / newsletter.
3. Log it in a shared **Google Sheet** (one row per link) so the UTM vocabulary
   stays controlled — this is the §A1 "controlled vocabulary" requirement,
   solved with a Sheet instead of a subscription.

This unblocks Phase 1 measurement immediately with no new vendor, no billing,
no DNS.

## Gotcha — Google has no native URL shortener anymore

If we want a short, branded link (`deeprun.link/preflop`), **Google can't do it**:

- `goo.gl` (Google URL Shortener) — shut down; legacy links stopped resolving
  Aug 2025.
- Firebase Dynamic Links — deprecated, shut down Aug 2025.

So "Google tools" cover **UTM generation + QR + registry**, but **not** the
branded short link. That capability is the *only* real reason to buy Dub.

## Recommendation

- **Phase 1 (now):** Google Campaign URL Builder + Google Sheet registry. $0,
  unblocks the funnel today. Long UTM URLs are fine in descriptions; use a free
  QR for print/video.
- **Phase 3 (when needed):** add Dub.co *only if* we want branded short links,
  pre-click analytics, or the §A4 in-`/admin` link builder. Re-evaluate against a
  branded short domain + free/cheap shortener alternatives at that point.

Net: removes one paid dependency from the critical path. Aligns with the PRD's
own "validate on free tiers first" stance (§9).

## Open question for Marketing

Do we need pre-landing click analytics (geo/device before the user lands), or is
PostHog's landed→paid funnel enough? If the latter, Dub may never be needed.
