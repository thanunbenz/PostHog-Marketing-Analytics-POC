"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { isDemoMode } from "@/lib/analytics";

// Initialises PostHog in the browser. In production this script is loaded via
// GTM (PRD §6.1); here we init posthog-js directly so the POC is self-contained.
// No key => demo mode, init is skipped, every capture() becomes a local-only log.
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (isDemoMode()) return;
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
      capture_pageview: false, // we fire $pageview manually for the SPA (below)
      capture_pageleave: true,
      persistence: "localStorage+cookie",
    });
  }, []);

  return <>{children}</>;
}
