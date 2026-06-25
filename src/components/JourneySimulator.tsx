"use client";

import { useState } from "react";
import { capture, identifyUser, logServerEvent } from "@/lib/analytics";
import { getFirstTouch, clearFirstTouch } from "@/lib/attribution";
import { EVENTS } from "@/lib/events";

type StepState = "idle" | "done";

// Walks a single user through the funnel, firing the named events at each UI
// point (PRD §C3) and the server-side subscription_started at the end (§C4).
export function JourneySimulator() {
  const [done, setDone] = useState<Record<string, StepState>>({});
  const [serverResp, setServerResp] = useState<string>("");
  const userId = "demo-user-001";

  const mark = (key: string) => setDone((d) => ({ ...d, [key]: "done" }));

  async function subscribe() {
    // Server-side: this is what the Stripe webhook does (PRD §6.4).
    const res = await fetch("/api/billing/webhook", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        userId,
        plan: "pro_monthly",
        amount: 299,
        utm: getFirstTouch(),
      }),
    });
    const json = await res.json();
    // Reflect the authoritative event into the on-screen stream.
    logServerEvent(EVENTS.SUBSCRIPTION_STARTED, (json.sent ?? json.wouldSend).properties);
    setServerResp(JSON.stringify(json, null, 2));
    mark("subscribe");
  }

  const steps: Array<{ key: string; label: string; run: () => void }> = [
    {
      key: "signup",
      label: "1 · Sign up",
      run: () => {
        identifyUser(userId);
        capture(EVENTS.SIGN_UP, { method: "clerk" });
        mark("signup");
      },
    },
    {
      key: "lesson",
      label: "2 · Start free lesson",
      run: () => {
        capture(EVENTS.LESSON_STARTED, { lesson: "preflop-basics-1" });
        mark("lesson");
      },
    },
    {
      key: "paywall",
      label: "3 · View paywall",
      run: () => {
        capture(EVENTS.PAYWALL_VIEWED, { plan: "pro_monthly" });
        mark("paywall");
      },
    },
    {
      key: "checkout",
      label: "4 · Start checkout",
      run: () => {
        capture(EVENTS.CHECKOUT_STARTED, { plan: "pro_monthly", amount: 299 });
        mark("checkout");
      },
    },
    { key: "subscribe", label: "5 · Subscribe (server-side)", run: subscribe },
  ];

  function reset() {
    setDone({});
    setServerResp("");
    clearFirstTouch();
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <h3>Simulate a user journey</h3>
        <button className="link-btn" onClick={reset}>
          reset
        </button>
      </div>
      <div className="steps">
        {steps.map((s) => (
          <button
            key={s.key}
            className={`step-btn ${done[s.key] ? "step-done" : ""} ${
              s.key === "subscribe" ? "step-server" : ""
            }`}
            onClick={s.run}
          >
            <span>{s.label}</span>
            {done[s.key] && <span className="check">captured ✓</span>}
          </button>
        ))}
      </div>
      {serverResp && (
        <div className="server-resp">
          <span className="muted">POST /api/billing/webhook →</span>
          <pre>{serverResp}</pre>
        </div>
      )}
    </div>
  );
}
