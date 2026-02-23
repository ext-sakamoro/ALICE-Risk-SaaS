-- ALICE Risk: Domain-specific tables
CREATE TABLE IF NOT EXISTS risk_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    order_id TEXT NOT NULL,
    symbol TEXT NOT NULL,
    check_type TEXT NOT NULL CHECK (check_type IN ('pretrade', 'position-limit', 'notional-limit', 'concentration')),
    var_95 DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    var_99 DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    max_drawdown DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    passed BOOLEAN NOT NULL DEFAULT true,
    reason TEXT,
    latency_us BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS margin_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    portfolio_value DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    initial_margin DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    maintenance_margin DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    available_margin DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    margin_utilization DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    margin_call BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS circuit_breaker_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    symbol TEXT,
    level TEXT NOT NULL CHECK (level IN ('L1', 'L2', 'L3')),
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('price-move', 'volume-spike', 'loss-limit', 'manual')),
    threshold DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    actual_value DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    action TEXT NOT NULL CHECK (action IN ('pause-5min', 'halt-trading', 'liquidate-all')),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_risk_checks_user ON risk_checks(user_id, created_at);
CREATE INDEX idx_risk_checks_order ON risk_checks(order_id);
CREATE INDEX idx_margin_calculations_user ON margin_calculations(user_id, created_at);
CREATE INDEX idx_circuit_breaker_events_user ON circuit_breaker_events(user_id, created_at);
CREATE INDEX idx_circuit_breaker_events_symbol ON circuit_breaker_events(symbol);
