import { UtmPanel } from "@/components/UtmPanel";
import { JourneySimulator } from "@/components/JourneySimulator";
import { EventLog } from "@/components/EventLog";
import { FunnelStory } from "@/components/FunnelStory";

export default function Home() {
  const demoMode = !process.env.NEXT_PUBLIC_POSTHOG_KEY;

  return (
    <main className="wrap">
      <header className="hero">
        <div>
          <h1>DeepRun · Marketing-Analytics POC</h1>
          <p className="muted">
            PostHog funnel · first-touch UTM · server-side subscription_started —
            the ~1 day of engineering from the Buy-First PRD.
          </p>
        </div>
        <span className={`mode ${demoMode ? "mode-demo" : "mode-live"}`}>
          {demoMode ? "DEMO MODE · events logged locally" : "LIVE · sending to PostHog"}
        </span>
      </header>

      {/* Zone A — the entire dev scope. */}
      <div className="zone zone-build">
        <h2>What we build · ~1 day of engineering</h2>
        <p>
          SPA page_view + named events + server-side subscription_started +
          first-touch UTM. This is the whole engineering scope (PRD §6).
        </p>
      </div>
      <section className="grid">
        <div className="col">
          <UtmPanel />
          <JourneySimulator />
        </div>
        <div className="col">
          <EventLog />
        </div>
      </section>

      {/* Zone B — bought, not built (PRD's "buy, don't build" thesis). */}
      <div className="zone zone-bought">
        <h2>What PostHog gives us · bought, no build (PRD §B)</h2>
        <p>
          Funnels, dashboards and session replay come ready-made from PostHog.
          Marketing builds these in the PostHog UI with no engineering — shown
          here illustratively, not built by us.
        </p>
      </div>
      <section className="grid">
        <div className="col col-wide">
          <FunnelStory />
        </div>
      </section>

      <footer className="foot muted small">
        Maps to prod: SPA <code>page_view</code> → layout.tsx · named events →
        UI points · <code>subscription_started</code> → billing/webhook
        route.ts (inside <code>handleSubscriptionUpsert</code>, after the paid
        guard). See README.md.
      </footer>
    </main>
  );
}
