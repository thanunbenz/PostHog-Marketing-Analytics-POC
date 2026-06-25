// Single source of truth for event names + the marketing funnel definition.
// Mirrors PRD §C3 (named events) and §4 (the YouTube use-case funnel).

export const EVENTS = {
  PAGE_VIEW: "$pageview", // PostHog built-in; fired by SPA tracker on route change
  SIGN_UP: "sign_up",
  LESSON_STARTED: "lesson_started",
  PAYWALL_VIEWED: "paywall_viewed",
  CHECKOUT_STARTED: "checkout_started",
  SUBSCRIPTION_STARTED: "subscription_started", // server-side, authoritative
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

// The funnel management cares about (PRD §4, Step 3).
// `serverSide: true` => fired from the Stripe webhook, not the browser.
export const FUNNEL_STEPS: Array<{
  key: EventName;
  label: string;
  serverSide?: boolean;
}> = [
  { key: EVENTS.PAGE_VIEW, label: "Landed (page_view)" },
  { key: EVENTS.SIGN_UP, label: "Signed up" },
  { key: EVENTS.LESSON_STARTED, label: "Started a lesson" },
  { key: EVENTS.PAYWALL_VIEWED, label: "Viewed paywall" },
  { key: EVENTS.CHECKOUT_STARTED, label: "Started checkout" },
  { key: EVENTS.SUBSCRIPTION_STARTED, label: "Subscribed", serverSide: true },
];

// UTM keys we persist as first-touch attribution (PRD §3).
export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export type UtmParams = Partial<Record<(typeof UTM_KEYS)[number], string>>;
