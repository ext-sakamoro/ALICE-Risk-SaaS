use axum::{extract::State, response::Json, routing::{get, post}, Router};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use std::time::Instant;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;

struct AppState { start_time: Instant, stats: Mutex<Stats> }
struct Stats { total_checks: u64, total_margin_calcs: u64, total_alerts: u64, trades_blocked: u64 }

#[derive(Serialize)]
struct Health { status: String, version: String, uptime_secs: u64, total_ops: u64 }

#[derive(Deserialize)]
struct PreTradeCheckRequest { account: String, instrument: String, side: String, quantity: f64, price: f64 }
#[derive(Serialize)]
struct PreTradeCheckResponse { check_id: String, approved: bool, reasons: Vec<String>, risk_score: f64, margin_impact: f64, position_limit_used_pct: f64, elapsed_us: u128 }

#[derive(Deserialize)]
struct MarginRequest { account: String, positions: Option<Vec<PositionInput>> }
#[derive(Deserialize)]
struct PositionInput { instrument: String, quantity: f64, price: f64 }
#[derive(Serialize)]
struct MarginResponse { account: String, initial_margin: f64, maintenance_margin: f64, available_margin: f64, margin_utilization_pct: f64, var_95: f64, var_99: f64, elapsed_us: u128 }

#[derive(Deserialize)]
struct CircuitBreakerRequest { instrument: String, price_change_pct: f64 }
#[derive(Serialize)]
struct CircuitBreakerResponse { instrument: String, triggered: bool, level: String, halt_duration_secs: u64, price_change_pct: f64 }

#[derive(Deserialize)]
struct StressTestRequest { scenario: Option<String>, shock_pct: Option<f64> }
#[derive(Serialize)]
struct StressTestResponse { scenario: String, portfolio_impact: f64, worst_case_loss: f64, instruments_affected: u32, breaches: Vec<String> }

#[derive(Serialize)]
struct StatsResponse { total_checks: u64, total_margin_calcs: u64, total_alerts: u64, trades_blocked: u64, block_rate_pct: f64 }

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt().with_env_filter(tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| "risk_engine=info".into())).init();
    let state = Arc::new(AppState { start_time: Instant::now(), stats: Mutex::new(Stats { total_checks: 0, total_margin_calcs: 0, total_alerts: 0, trades_blocked: 0 }) });
    let cors = CorsLayer::new().allow_origin(Any).allow_methods(Any).allow_headers(Any);
    let app = Router::new()
        .route("/health", get(health))
        .route("/api/v1/risk/pretrade", post(pretrade_check))
        .route("/api/v1/risk/margin", post(margin_calc))
        .route("/api/v1/risk/circuit-breaker", post(circuit_breaker))
        .route("/api/v1/risk/stress-test", post(stress_test))
        .route("/api/v1/risk/stats", get(stats))
        .layer(cors).layer(TraceLayer::new_for_http()).with_state(state);
    let addr = std::env::var("RISK_ADDR").unwrap_or_else(|_| "0.0.0.0:8081".into());
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    tracing::info!("Risk Engine on {addr}");
    axum::serve(listener, app).await.unwrap();
}

async fn health(State(s): State<Arc<AppState>>) -> Json<Health> {
    let st = s.stats.lock().unwrap();
    Json(Health { status: "ok".into(), version: env!("CARGO_PKG_VERSION").into(), uptime_secs: s.start_time.elapsed().as_secs(), total_ops: st.total_checks + st.total_margin_calcs })
}

async fn pretrade_check(State(s): State<Arc<AppState>>, Json(req): Json<PreTradeCheckRequest>) -> Json<PreTradeCheckResponse> {
    let t = Instant::now();
    let notional = req.quantity * req.price;
    let risk_score = (notional / 1_000_000.0).min(1.0);
    let approved = risk_score < 0.8;
    let mut reasons = Vec::new();
    if !approved { reasons.push("Position limit exceeded".into()); }
    if notional > 500_000.0 { reasons.push("Large order flag".into()); }
    { let mut st = s.stats.lock().unwrap(); st.total_checks += 1; if !approved { st.trades_blocked += 1; st.total_alerts += 1; } }
    Json(PreTradeCheckResponse { check_id: uuid::Uuid::new_v4().to_string(), approved, reasons, risk_score, margin_impact: notional * 0.1, position_limit_used_pct: risk_score * 100.0, elapsed_us: t.elapsed().as_micros() })
}

async fn margin_calc(State(s): State<Arc<AppState>>, Json(req): Json<MarginRequest>) -> Json<MarginResponse> {
    let t = Instant::now();
    let positions = req.positions.unwrap_or_default();
    let total_notional: f64 = positions.iter().map(|p| p.quantity * p.price).sum();
    let initial = total_notional * 0.10;
    let maintenance = total_notional * 0.05;
    let var95 = total_notional * 0.02;
    let var99 = total_notional * 0.035;
    s.stats.lock().unwrap().total_margin_calcs += 1;
    Json(MarginResponse { account: req.account, initial_margin: initial, maintenance_margin: maintenance, available_margin: 1_000_000.0 - initial, margin_utilization_pct: (initial / 1_000_000.0) * 100.0, var_95: var95, var_99: var99, elapsed_us: t.elapsed().as_micros() })
}

async fn circuit_breaker(State(s): State<Arc<AppState>>, Json(req): Json<CircuitBreakerRequest>) -> Json<CircuitBreakerResponse> {
    let abs_change = req.price_change_pct.abs();
    let (triggered, level, halt) = if abs_change >= 20.0 { (true, "L3", 3600) } else if abs_change >= 13.0 { (true, "L2", 900) } else if abs_change >= 7.0 { (true, "L1", 300) } else { (false, "none", 0) };
    if triggered { s.stats.lock().unwrap().total_alerts += 1; }
    Json(CircuitBreakerResponse { instrument: req.instrument, triggered, level: level.into(), halt_duration_secs: halt, price_change_pct: req.price_change_pct })
}

async fn stress_test(State(_s): State<Arc<AppState>>, Json(req): Json<StressTestRequest>) -> Json<StressTestResponse> {
    let scenario = req.scenario.unwrap_or_else(|| "market-crash".into());
    let shock = req.shock_pct.unwrap_or(-20.0);
    let impact = shock * 10000.0;
    let breaches = if shock.abs() > 15.0 { vec!["VaR limit breach".into(), "Margin call triggered".into()] } else { vec![] };
    Json(StressTestResponse { scenario, portfolio_impact: impact, worst_case_loss: impact * 1.5, instruments_affected: 25, breaches })
}

async fn stats(State(s): State<Arc<AppState>>) -> Json<StatsResponse> {
    let st = s.stats.lock().unwrap();
    let block_rate = if st.total_checks > 0 { st.trades_blocked as f64 / st.total_checks as f64 * 100.0 } else { 0.0 };
    Json(StatsResponse { total_checks: st.total_checks, total_margin_calcs: st.total_margin_calcs, total_alerts: st.total_alerts, trades_blocked: st.trades_blocked, block_rate_pct: block_rate })
}
