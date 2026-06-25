"use client";

import { useEffect, useState } from "react";
import { subscribe, type LoggedEvent } from "@/lib/analytics";

// Live, on-screen mirror of every event fired (client + server). This is what
// makes the POC convincing without a PostHog key: management literally watches
// the instrumentation fire in real time.
export function EventLog() {
  const [events, setEvents] = useState<LoggedEvent[]>([]);

  useEffect(() => subscribe((e) => setEvents((prev) => [e, ...prev].slice(0, 50))), []);

  return (
    <div className="panel">
      <div className="panel-head">
        <h3>Live event stream</h3>
        <span className="muted">{events.length} captured</span>
      </div>
      <div className="log">
        {events.length === 0 && (
          <p className="muted">No events yet — run the journey on the left.</p>
        )}
        {events.map((e) => (
          <div key={e.id} className="log-row">
            <span className={`tag tag-${e.source}`}>{e.source}</span>
            <code className="ev-name">{e.name}</code>
            <pre className="ev-props">{formatProps(e.props)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatProps(props: Record<string, unknown>): string {
  const entries = Object.entries(props).filter(([k]) => !k.startsWith("$current"));
  if (entries.length === 0) return "{}";
  return entries.map(([k, v]) => `${k}: ${v}`).join("  ·  ");
}
