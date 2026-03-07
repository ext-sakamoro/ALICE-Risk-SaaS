"use client";
import { useState } from "react";

type Tab = "pretrade" | "margin" | "circuit-breaker" | "stress-test" | "stats";

const DEFAULTS: Record<Tab, string> = {
  "pretrade": JSON.stringify({
    account_id: "ACC-001",
    instrument: "AAPL",
    side: "buy",
    quantity: 10000,
    price: 182.50,
    order_type: "limit",
    strategy_id: "STRAT-MKT-NEUTRAL"
  }, null, 2),
  "margin": JSON.stringify({
    account_id: "ACC-001",
    portfolio: [
      { instrument: "AAPL", quantity: 5000, price: 182.50 },
      { instrument: "MSFT", quantity: 3000, price: 415.00 },
      { instrument: "NVDA", quantity: 1000, price: 875.00 }
    ],
    margin_model: "SPAN",
    currency: "USD"
  }, null, 2),
  "circuit-breaker": JSON.stringify({
    instrument: "AAPL",
    trigger_type: "price_move",
    threshold_pct: 10.0,
    window_seconds: 300,
    action: "halt_trading"
  }, null, 2),
  "stress-test": JSON.stringify({
    account_id: "ACC-001",
    scenario: "2008_financial_crisis",
    portfolio_snapshot_id: "SNAP-20260226-001",
    include_correlation_breakdown: true
  }, null, 2),
  stats: JSON.stringify({}, null, 2),
};

const ENDPOINTS: Record<Tab, { method: string; path: string }> = {
  "pretrade":       { method: "POST", path: "/api/v1/risk/pretrade" },
  "margin":         { method: "POST", path: "/api/v1/risk/margin" },
  "circuit-breaker":{ method: "POST", path: "/api/v1/risk/circuit-breaker" },
  "stress-test":    { method: "POST", path: "/api/v1/risk/stress-test" },
  stats:            { method: "GET",  path: "/api/v1/stats" },
};

const TAB_LABELS: Record<Tab, string> = {
  "pretrade":        "Pre-Trade",
  "margin":          "Margin",
  "circuit-breaker": "Circuit Breaker",
  "stress-test":     "Stress Test",
  stats:             "Stats",
};

export default function ConsolePage() {
  const [activeTab, setActiveTab] = useState<Tab>("pretrade");
  const [inputs, setInputs] = useState<Record<Tab, string>>(DEFAULTS);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const API = "http://localhost:8081";

  const send = async () => {
    setLoading(true);
    setResponse("");
    const { method, path } = ENDPOINTS[activeTab];
    try {
      const opts: RequestInit = { method, headers: { "Content-Type": "application/json" } };
      if (method !== "GET") opts.body = inputs[activeTab];
      const res = await fetch(`${API}${path}`, opts);
      setResponse(JSON.stringify(await res.json(), null, 2));
    } catch (e: any) {
      setResponse(`Error: ${e.message}`);
    }
    setLoading(false);
  };

  const tabs: Tab[] = ["pretrade", "margin", "circuit-breaker", "stress-test", "stats"];

  return (
    <div style={{ padding: 24, fontFamily: "monospace", background: "#0a0a0a", minHeight: "100vh", color: "#fff" }}>
      <h1 style={{ marginBottom: 4 }}>ALICE Risk-SaaS — Console</h1>
      <p style={{ color: "#888", marginBottom: 24, fontSize: 14 }}>
        Pre-trade risk management with margin calculation, circuit breakers, and stress testing.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 16px",
              background: activeTab === tab ? "#dc2626" : "#1a1a2e",
              color: activeTab === tab ? "#fff" : "#ccc",
              border: "1px solid #333",
              borderRadius: 6,
              cursor: "pointer",
              fontFamily: "monospace",
              fontWeight: activeTab === tab ? 700 : 400,
            }}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 8, fontSize: 12, color: "#888" }}>
        <span style={{ color: ENDPOINTS[activeTab].method === "GET" ? "#0f0" : "#dc2626" }}>
          {ENDPOINTS[activeTab].method}
        </span>{" "}
        {API}{ENDPOINTS[activeTab].path}
      </div>

      {ENDPOINTS[activeTab].method !== "GET" && (
        <textarea
          value={inputs[activeTab]}
          onChange={e => setInputs(prev => ({ ...prev, [activeTab]: e.target.value }))}
          rows={12}
          style={{
            width: "100%",
            fontFamily: "monospace",
            background: "#111",
            color: "#fff",
            border: "1px solid #333",
            borderRadius: 6,
            padding: 12,
            boxSizing: "border-box",
            fontSize: 13,
          }}
        />
      )}

      <button
        onClick={send}
        disabled={loading}
        style={{
          marginTop: 8,
          padding: "10px 24px",
          background: loading ? "#333" : "#dc2626",
          color: loading ? "#666" : "#fff",
          border: "none",
          borderRadius: 6,
          cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "monospace",
          fontWeight: 700,
          fontSize: 14,
        }}
      >
        {loading ? "Sending..." : "Send"}
      </button>

      <pre
        style={{
          background: "#111",
          color: "#0f0",
          padding: 16,
          marginTop: 16,
          minHeight: 200,
          overflow: "auto",
          borderRadius: 6,
          border: "1px solid #222",
          fontSize: 13,
        }}
      >
        {response || "// Response will appear here"}
      </pre>
    </div>
  );
}
