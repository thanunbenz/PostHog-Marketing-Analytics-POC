"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { capture } from "@/lib/analytics";
import { captureFirstTouch } from "@/lib/attribution";
import { EVENTS } from "@/lib/events";

// SPA page_view tracker — the one gap the PRD says the funnel cannot be measured
// without (PRD §C2, §6.2, §11). In a real SPA, route changes don't reload the
// page, so a $pageview must be fired manually on every navigation.
export function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const last = useRef<string>("");

  useEffect(() => {
    // Capture first-touch UTMs the moment the user lands (before any nav).
    captureFirstTouch(window.location.search);

    const url = pathname + (searchParams.toString() ? `?${searchParams}` : "");
    if (url === last.current) return; // guard double-fire (StrictMode / same route)
    last.current = url;

    capture(EVENTS.PAGE_VIEW, { $current_url: url, pathname });
  }, [pathname, searchParams]);

  return null;
}
