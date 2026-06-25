import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerPostHog } from "@/lib/posthog-server";
import { EVENTS } from "@/lib/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POC stand-in for src/app/api/billing/webhook/route.ts in the real frontend.
// In production this is the existing Stripe webhook; on the
// `customer.subscription.created` case (route.ts:79) we ALSO fire the
// authoritative server-side subscription_started (PRD §6.4 — the most important
// piece for accurate paid-conversion numbers).
//
// distinct_id = the Clerk user id, so the event stitches onto the same person
// PostHog has been tracking in the browser, and inherits their first-touch UTMs.
export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    userId?: string;
    plan?: string;
    amount?: number;
    utm?: Record<string, string>;
  };

  const userId = body.userId ?? "demo-user";
  const properties = {
    plan: body.plan ?? "pro_monthly",
    amount: body.amount ?? 299,
    currency: "THB",
    source: "stripe_webhook",
    ...(body.utm ?? {}), // first-touch attribution carried through to payment
  };

  const ph = getServerPostHog();

  if (!ph) {
    // Demo mode — no server key. Report exactly what WOULD be sent so the POC
    // is honest and still demonstrable.
    return NextResponse.json({
      ok: true,
      mode: "demo",
      wouldSend: { event: EVENTS.SUBSCRIPTION_STARTED, distinctId: userId, properties },
      note: "Set POSTHOG_SERVER_KEY to send this event to PostHog for real.",
    });
  }

  ph.capture({
    distinctId: userId,
    event: EVENTS.SUBSCRIPTION_STARTED,
    properties,
  });
  await ph.flush();

  return NextResponse.json({
    ok: true,
    mode: "live",
    sent: { event: EVENTS.SUBSCRIPTION_STARTED, distinctId: userId, properties },
  });
}
