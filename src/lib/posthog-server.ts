import "server-only";

import { PostHog } from "posthog-node";

// Server-side PostHog client for the authoritative subscription_started event
// (PRD §6.4). Fired from the Stripe webhook so paid-conversion numbers can't be
// lost to ad-blockers or client crashes.

let client: PostHog | null = null;

export function getServerPostHog(): PostHog | null {
  const key = process.env.POSTHOG_SERVER_KEY;
  if (!key) return null; // demo mode — webhook reports what it WOULD send.

  if (!client) {
    client = new PostHog(key, {
      host: process.env.POSTHOG_SERVER_HOST ?? "https://eu.i.posthog.com",
      flushAt: 1, // POC: send immediately so the demo is observable.
      flushInterval: 0,
    });
  }
  return client;
}
