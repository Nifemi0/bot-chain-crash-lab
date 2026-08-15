import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required.");

const sql = neon(databaseUrl);
await sql`
  CREATE TABLE IF NOT EXISTS simulation_runs (
    simulation_id TEXT PRIMARY KEY,
    contract_address TEXT NOT NULL,
    chain_id INTEGER NOT NULL,
    contract_kind TEXT NOT NULL,
    status TEXT NOT NULL,
    mode TEXT NOT NULL,
    report_hash TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;
await sql`
  CREATE INDEX IF NOT EXISTS simulation_runs_created_at_idx
  ON simulation_runs (created_at DESC)
`;
await sql`
  CREATE INDEX IF NOT EXISTS simulation_runs_contract_address_idx
  ON simulation_runs (contract_address)
`;
await sql`
  ALTER TABLE simulation_runs
  ADD COLUMN IF NOT EXISTS session_id TEXT
`;
await sql`
  CREATE INDEX IF NOT EXISTS simulation_runs_session_created_idx
  ON simulation_runs (session_id, created_at DESC)
`;
await sql`
  CREATE TABLE IF NOT EXISTS ai_usage_windows (
    scope_id TEXT NOT NULL,
    window_date DATE NOT NULL DEFAULT CURRENT_DATE,
    request_count INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (scope_id, window_date)
  )
`;

const result = await sql`SELECT COUNT(*)::int AS count FROM simulation_runs`;
console.log(JSON.stringify({ ok: true, table: "simulation_runs", rows: result[0].count }));
