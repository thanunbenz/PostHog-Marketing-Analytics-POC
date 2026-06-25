"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFirstTouch } from "@/lib/attribution";
import { UTM_KEYS, type UtmParams } from "@/lib/events";

// Sample Dub-style deeplinks (PRD §3/§4). Clicking one simulates a visitor
// landing from that campaign; the SPA tracker then stamps first-touch UTMs.
const SAMPLE_LINKS = [
  {
    label: "YouTube · preflop-series",
    qs: "utm_source=youtube&utm_medium=video&utm_campaign=preflop-series&utm_content=description-link",
  },
  {
    label: "Facebook ad · june-promo",
    qs: "utm_source=facebook&utm_medium=cpc&utm_campaign=june-promo&utm_content=carousel-1",
  },
  {
    label: "Newsletter · weekly",
    qs: "utm_source=newsletter&utm_medium=email&utm_campaign=weekly-newsletter",
  },
];

export function UtmPanel() {
  const router = useRouter();
  const [utm, setUtm] = useState<UtmParams>({});

  // Re-read after navigation so the panel reflects the captured first-touch.
  useEffect(() => {
    const id = setInterval(() => setUtm(getFirstTouch()), 500);
    return () => clearInterval(id);
  }, []);

  const hasUtm = Object.keys(utm).length > 0;

  return (
    <div className="panel">
      <div className="panel-head">
        <h3>First-touch attribution</h3>
        <span className="muted">PRD §3 · persists to payment</span>
      </div>

      <p className="muted small">
        Click a deeplink to simulate landing from that campaign (what Dub /
        Google Campaign URL Builder produces):
      </p>
      <div className="links">
        {SAMPLE_LINKS.map((l) => (
          <button
            key={l.qs}
            className="link-chip"
            onClick={() => router.push(`/?${l.qs}`)}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="utm-grid">
        {UTM_KEYS.map((k) => (
          <div key={k} className="utm-row">
            <code>{k}</code>
            <span className={utm[k] ? "utm-val" : "muted"}>{utm[k] ?? "—"}</span>
          </div>
        ))}
      </div>
      {!hasUtm && (
        <p className="muted small">
          No attribution captured yet (reset the journey to re-capture).
        </p>
      )}
    </div>
  );
}
