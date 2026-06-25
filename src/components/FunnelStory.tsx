// Static, illustrative funnel + campaign comparison straight from the PRD
// (§4 Step 3 + Step 5). This is the "saved subscription funnel" management would
// open in PostHog, filtered to a campaign. Server component — no interactivity.

const FUNNEL = [
  { step: "Landed (page_view)", users: 800, conv: "—" },
  { step: "Signed up", users: 240, conv: "30%" },
  { step: "Started a lesson", users: 180, conv: "75%" },
  { step: "Viewed paywall", users: 90, conv: "50%", drop: true },
  { step: "Started checkout", users: 35, conv: "39%" },
  { step: "Subscribed", users: 22, conv: "63%" },
];

const CAMPAIGNS = [
  { name: "preflop-series (YouTube)", clicks: 800, subs: 22, rate: "2.75%" },
  { name: "june-promo (Facebook ad)", clicks: 1200, subs: 9, rate: "0.75%" },
  { name: "weekly-newsletter", clicks: 300, subs: 14, rate: "4.67%", best: true },
];

export function FunnelStory() {
  const max = FUNNEL[0].users;
  return (
    <div className="panel">
      <div className="panel-head">
        <h3>Saved funnel · preflop-series</h3>
        <span className="muted">PostHog view (illustrative, PRD §4)</span>
      </div>

      <div className="funnel">
        {FUNNEL.map((f) => (
          <div key={f.step} className={`funnel-row ${f.drop ? "funnel-drop" : ""}`}>
            <div className="funnel-label">{f.step}</div>
            <div className="funnel-bar-wrap">
              <div className="funnel-bar" style={{ width: `${(f.users / max) * 100}%` }}>
                <span>{f.users}</span>
              </div>
            </div>
            <div className="funnel-conv">{f.conv}</div>
          </div>
        ))}
      </div>
      <p className="insight">
        Biggest drop: lesson → paywall (180 → 90). Half of engaged users never
        see the paywall → add an "Unlock the full series" CTA (PRD §4 Step 4).
      </p>

      <div className="panel-head" style={{ marginTop: 20 }}>
        <h3>Compare content · click → paid</h3>
        <span className="muted">PRD §4 Step 5</span>
      </div>
      <table className="cmp">
        <thead>
          <tr>
            <th>Campaign</th>
            <th>Clicks</th>
            <th>Subscribed</th>
            <th>Click→Paid</th>
          </tr>
        </thead>
        <tbody>
          {CAMPAIGNS.map((c) => (
            <tr key={c.name} className={c.best ? "cmp-best" : ""}>
              <td>{c.name}</td>
              <td>{c.clicks.toLocaleString()}</td>
              <td>{c.subs}</td>
              <td>{c.rate}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="insight">
        Newsletter converts ~6× the Facebook ad per click → shift budget to the
        newsletter. This is the decision the whole system exists to enable.
      </p>
    </div>
  );
}
