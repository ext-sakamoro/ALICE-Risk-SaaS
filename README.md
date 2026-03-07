# ALICE-Risk-SaaS

Pre-trade risk management SaaS with margin calculation, circuit breakers, and stress testing.

## Architecture

```
Frontend (Next.js 15)          API Gateway (8081)
  /dashboard/console    →      POST /api/v1/risk/pretrade
  /                            POST /api/v1/risk/margin
                               POST /api/v1/risk/circuit-breaker
                               POST /api/v1/risk/stress-test
                               GET  /api/v1/stats
                                        |
                     +------------------+------------------+
                     |                  |                  |
              Pre-Trade Engine    Margin Engine     Stress Engine
              (limit checks)      (SPAN/Portfolio)  (scenarios)
                     |                  |                  |
                     +------------------+------------------+
                                        |
                            In-Memory Portfolio State
                                        |
                              Risk Limits Config DB
```

## Features

| Feature | Description |
|---------|-------------|
| Pre-Trade Checks | Real-time order validation against limits and regulatory restrictions |
| Margin Calculation | SPAN and portfolio margining with initial and variation margin |
| Circuit Breakers | Configurable halt triggers on price moves, volume, and loss thresholds |
| Stress Testing | Historical scenario replay and Monte Carlo simulation |
| Low-Latency Decisions | Sub-millisecond pre-trade risk decisions with in-memory state |
| Risk Analytics | Real-time VaR, CVaR, Greeks, and counterparty exposure dashboards |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| POST | /api/v1/risk/pretrade | Run pre-trade risk check on an order |
| POST | /api/v1/risk/margin | Calculate portfolio margin requirement |
| POST | /api/v1/risk/circuit-breaker | Configure or trigger a circuit breaker |
| POST | /api/v1/risk/stress-test | Run portfolio stress test against a scenario |
| GET | /api/v1/stats | Risk system statistics and metrics |

### POST /api/v1/risk/pretrade

```json
{
  "account_id": "ACC-001",
  "instrument": "AAPL",
  "side": "buy",
  "quantity": 10000,
  "price": 182.50,
  "order_type": "limit",
  "strategy_id": "STRAT-MKT-NEUTRAL"
}
```

### POST /api/v1/risk/margin

```json
{
  "account_id": "ACC-001",
  "portfolio": [
    { "instrument": "AAPL", "quantity": 5000, "price": 182.50 },
    { "instrument": "MSFT", "quantity": 3000, "price": 415.00 }
  ],
  "margin_model": "SPAN",
  "currency": "USD"
}
```

### POST /api/v1/risk/circuit-breaker

```json
{
  "instrument": "AAPL",
  "trigger_type": "price_move",
  "threshold_pct": 10.0,
  "window_seconds": 300,
  "action": "halt_trading"
}
```

### POST /api/v1/risk/stress-test

```json
{
  "account_id": "ACC-001",
  "scenario": "2008_financial_crisis",
  "portfolio_snapshot_id": "SNAP-20260226-001",
  "include_correlation_breakdown": true
}
```

## Quick Start

```bash
docker compose up -d
# API:      http://localhost:8081
# Frontend: http://localhost:3000
```

## License

AGPL-3.0-or-later
