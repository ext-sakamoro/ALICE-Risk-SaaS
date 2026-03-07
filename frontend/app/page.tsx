export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0a0a, #2e0a0a)",
        color: "#fff",
        fontFamily: "system-ui",
      }}
    >
      <header
        style={{
          padding: "24px 48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #ffffff10",
        }}
      >
        <h2 style={{ margin: 0, color: "#dc2626" }}>ALICE Risk-SaaS</h2>
        <a href="/dashboard/console" style={{ color: "#dc2626", textDecoration: "none", fontWeight: 600 }}>
          Console →
        </a>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <div
          style={{
            display: "inline-block",
            background: "#dc262620",
            color: "#dc2626",
            borderRadius: 20,
            padding: "4px 16px",
            fontSize: 13,
            marginBottom: 24,
            border: "1px solid #dc262640",
          }}
        >
          Pre-Trade Risk Infrastructure
        </div>

        <h1 style={{ fontSize: 48, marginBottom: 16, lineHeight: 1.2 }}>
          Risk Controls Before the Trade Hits the Market
        </h1>
        <p style={{ fontSize: 20, color: "#aaa", marginBottom: 48, maxWidth: 600, margin: "0 auto 48px" }}>
          Pre-trade checks, margin calculation, circuit breakers, and stress testing to protect capital at every stage of execution.
        </p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 80 }}>
          <a
            href="/dashboard/console"
            style={{
              padding: "12px 32px",
              background: "#dc2626",
              color: "#fff",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            Open Console
          </a>
          <a
            href="#features"
            style={{
              padding: "12px 32px",
              background: "#ffffff10",
              color: "#fff",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 16,
              border: "1px solid #ffffff20",
            }}
          >
            Learn More
          </a>
        </div>

        <div
          id="features"
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, textAlign: "left" }}
        >
          <div style={{ background: "#ffffff10", borderRadius: 12, padding: 24, border: "1px solid #ffffff10" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🛡️</div>
            <h3 style={{ margin: "0 0 8px" }}>Pre-Trade Checks</h3>
            <p style={{ color: "#aaa", margin: 0, fontSize: 14, lineHeight: 1.6 }}>
              Real-time order validation against buying power, position limits, concentration limits, and regulatory restrictions before order submission.
            </p>
          </div>
          <div style={{ background: "#ffffff10", borderRadius: 12, padding: 24, border: "1px solid #ffffff10" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📐</div>
            <h3 style={{ margin: "0 0 8px" }}>Margin Calculation</h3>
            <p style={{ color: "#aaa", margin: 0, fontSize: 14, lineHeight: 1.6 }}>
              SPAN and portfolio margining models with real-time initial and variation margin computation across all asset classes.
            </p>
          </div>
          <div style={{ background: "#ffffff10", borderRadius: 12, padding: 24, border: "1px solid #ffffff10" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔴</div>
            <h3 style={{ margin: "0 0 8px" }}>Circuit Breakers</h3>
            <p style={{ color: "#aaa", margin: 0, fontSize: 14, lineHeight: 1.6 }}>
              Configurable circuit breakers that halt or throttle trading when price moves, volume spikes, or loss thresholds breach defined limits.
            </p>
          </div>
          <div style={{ background: "#ffffff10", borderRadius: 12, padding: 24, border: "1px solid #ffffff10" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🌪️</div>
            <h3 style={{ margin: "0 0 8px" }}>Stress Testing</h3>
            <p style={{ color: "#aaa", margin: 0, fontSize: 14, lineHeight: 1.6 }}>
              Historical scenario replay (2008 crisis, COVID crash, flash crashes) and Monte Carlo simulation to assess portfolio resilience.
            </p>
          </div>
          <div style={{ background: "#ffffff10", borderRadius: 12, padding: 24, border: "1px solid #ffffff10" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚡</div>
            <h3 style={{ margin: "0 0 8px" }}>Low-Latency Decisions</h3>
            <p style={{ color: "#aaa", margin: 0, fontSize: 14, lineHeight: 1.6 }}>
              Sub-millisecond pre-trade risk decisions with in-memory portfolio state, branchless limit checking, and SIMD-accelerated VaR.
            </p>
          </div>
          <div style={{ background: "#ffffff10", borderRadius: 12, padding: 24, border: "1px solid #ffffff10" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
            <h3 style={{ margin: "0 0 8px" }}>Risk Analytics</h3>
            <p style={{ color: "#aaa", margin: 0, fontSize: 14, lineHeight: 1.6 }}>
              Real-time VaR, CVaR, Greeks aggregation, sector concentration, and counterparty exposure dashboards for risk officers.
            </p>
          </div>
        </div>
      </main>

      <footer style={{ textAlign: "center", padding: 32, color: "#555", borderTop: "1px solid #ffffff10" }}>
        ALICE Risk-SaaS — AGPL-3.0-or-later
      </footer>
    </div>
  );
}
