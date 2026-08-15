import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import type { Simulation } from "@/lib/types";

let sqlClient: NeonQueryFunction<false, false> | null = null;

function getSql() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("Simulation history database is not configured.");
  }
  sqlClient ??= neon(databaseUrl);
  return sqlClient;
}

export async function saveSimulation(simulation: Simulation, sessionId: string) {
  const sql = getSql();
  await sql`
    INSERT INTO simulation_runs (
      simulation_id,
      contract_address,
      chain_id,
      contract_kind,
      status,
      mode,
      report_hash,
      session_id,
      payload,
      created_at
    ) VALUES (
      ${simulation.simulationId},
      ${simulation.contractAddress},
      ${simulation.chainId},
      ${simulation.analysis.kind},
      ${simulation.status},
      ${simulation.mode},
      ${simulation.reportHash},
      ${sessionId},
      ${JSON.stringify(simulation)}::jsonb,
      ${simulation.createdAt}::timestamptz
    )
    ON CONFLICT (simulation_id) DO UPDATE SET
      status = EXCLUDED.status,
      session_id = EXCLUDED.session_id,
      payload = EXCLUDED.payload,
      saved_at = NOW()
  `;

  await sql`
    DELETE FROM simulation_runs
    WHERE session_id = ${sessionId}
      AND simulation_id IN (
      SELECT simulation_id
      FROM simulation_runs
      WHERE session_id = ${sessionId}
      ORDER BY created_at DESC
      OFFSET 100
    )
  `;
}

export async function listSimulations(sessionId: string, limit = 30): Promise<Simulation[]> {
  const sql = getSql();
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
  const rows = await sql`
    SELECT payload
    FROM simulation_runs
    WHERE session_id = ${sessionId}
    ORDER BY created_at DESC
    LIMIT ${safeLimit}
  `;
  return rows.map((row: Record<string, unknown>) => row.payload as Simulation);
}

export async function getSimulation(simulationId: string, sessionId: string): Promise<Simulation | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT payload
    FROM simulation_runs
    WHERE simulation_id = ${simulationId}
      AND session_id = ${sessionId}
    LIMIT 1
  `;
  return rows.length ? (rows[0].payload as Simulation) : null;
}

async function incrementAiUsage(scopeId: string, limit: number) {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO ai_usage_windows (scope_id, window_date, request_count)
    VALUES (${scopeId}, CURRENT_DATE, 1)
    ON CONFLICT (scope_id, window_date) DO UPDATE SET
      request_count = ai_usage_windows.request_count + 1
    WHERE ai_usage_windows.request_count < ${limit}
    RETURNING request_count
  `;
  return rows.length ? Number(rows[0].request_count) : null;
}

export async function claimAiInvestigationQuota(sessionId: string) {
  const sessionCount = await incrementAiUsage(`session:${sessionId}`, 3);
  if (sessionCount === null) {
    throw new Error("Daily AI investigation limit reached for this browser. Try again tomorrow.");
  }

  const globalCount = await incrementAiUsage("global", 50);
  if (globalCount === null) {
    throw new Error("Today’s shared AI credit allowance has been used. Try again tomorrow.");
  }

  return { sessionRemaining: 3 - sessionCount };
}
