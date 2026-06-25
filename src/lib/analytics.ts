"use client";

import posthog from "posthog-js";
import type { EventName } from "./events";
import { getFirstTouch } from "./attribution";

// Thin wrapper over posthog-js. Two jobs:
//  1. Forward events to PostHog (no-op in demo mode = no key configured).
//  2. Mirror every event onto a local bus so the POC can SHOW them live on
//     screen — so the demo is convincing even before a PostHog key exists.

export type LoggedEvent = {
  id: string;
  name: EventName;
  props: Record<string, unknown>;
  source: "client" | "server";
  at: number;
};

type Listener = (e: LoggedEvent) => void;
const listeners = new Set<Listener>();
let seq = 0;

export function isDemoMode(): boolean {
  return !process.env.NEXT_PUBLIC_POSTHOG_KEY;
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit(e: LoggedEvent) {
  for (const fn of listeners) fn(e);
}

// Push a server-confirmed event into the on-screen log (called from the UI
// after the webhook responds) so the funnel shows the authoritative step too.
export function logServerEvent(name: EventName, props: Record<string, unknown>) {
  emit({ id: `s${seq++}`, name, props, source: "server", at: Date.now() });
}

export function capture(name: EventName, props: Record<string, unknown> = {}) {
  // Always attach first-touch attribution so every event is breakable down by
  // utm_source / utm_campaign in PostHog (PRD §4 Step 3).
  const enriched = { ...getFirstTouch(), ...props };

  if (!isDemoMode()) {
    posthog.capture(name, enriched);
  }
  emit({ id: `c${seq++}`, name, props: enriched, source: "client", at: Date.now() });
}

export function identifyUser(userId: string) {
  const utm = getFirstTouch();
  if (!isDemoMode()) {
    // $set_once => first-touch attribution sticks to the person forever.
    posthog.identify(userId, {}, utm);
  }
}
