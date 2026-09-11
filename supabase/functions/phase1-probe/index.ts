// Phase 1 probe, third of three signals in one push.
//
// Reaching this at all answers the question the backend plan's §7 route depends
// on: whether an edge function pushed through git is ever deployed. If it is,
// the payload answers the rest — whether SUPABASE_DB_URL is really in the
// environment, whether code can open a direct Postgres connection and author
// DDL, whether CREATE INDEX CONCURRENTLY works outside a transaction, and what
// extensions a Cloud project starts with.
//
// It also reports whether the migration in this same commit was applied, so the
// two answers can be compared rather than inferred from each other.
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const json = (body: unknown) =>
  new Response(JSON.stringify(body, null, 2), {
    headers: { "content-type": "application/json" },
  });

Deno.serve(async () => {
  const url = Deno.env.get("SUPABASE_DB_URL");
  const report: Record<string, unknown> = {
    probe: "phase1-probe",
    function_deployed_from_git_push: true,
    env_SUPABASE_DB_URL: Boolean(url),
    env_SUPABASE_SERVICE_ROLE_KEY: Boolean(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")),
  };

  if (!url) return json({ ...report, verdict: "no SUPABASE_DB_URL in this environment" });

  const client = new Client(url);
  try {
    await client.connect();
    report.connected = true;

    const who = await client.queryObject<{ user: string; db: string; version: string }>(
      "select current_user as user, current_database() as db, version() as version",
    );
    report.connected_as = who.rows[0];

    // Did the migration in this same commit run?
    const probe = await client.queryObject<{ n: number }>(
      "select count(*)::int as n from pg_class where relname = '_phase1_probe'",
    );
    const hook = await client.queryObject<{ n: number }>(
      "select count(*)::int as n from pg_proc where proname = 'custom_access_token_hook'",
    );
    report.pushed_migration_applied = probe.rows[0]?.n === 1;
    report.hook_function_exists = hook.rows[0]?.n === 1;

    // Can this connection author DDL?
    await client.queryArray("create table if not exists _route_probe (id int primary key)");
    const made = await client.queryObject<{ n: number }>(
      "select count(*)::int as n from pg_class where relname = '_route_probe'",
    );
    report.ddl_create_table = made.rows[0]?.n === 1;
    await client.queryArray("drop table if exists _route_probe");

    // CONCURRENTLY, which the seven out-of-band files need and a transaction forbids.
    await client.queryArray("create table if not exists _route_probe2 (id int)");
    try {
      await client.queryArray(
        "create index concurrently if not exists _route_probe2_idx on _route_probe2 (id)",
      );
      report.ddl_create_index_concurrently = true;
    } catch (error) {
      report.ddl_create_index_concurrently = `refused: ${String(error)}`;
    }
    await client.queryArray("drop table if exists _route_probe2");

    // A Cloud project starts bare; pg_trgm is required by the duplicate-hint indexes.
    const ext = await client.queryObject<{ extname: string }>(
      "select extname from pg_extension order by extname",
    );
    report.extensions = ext.rows.map((row) => row.extname);

    report.verdict = "function deployed, SUPABASE_DB_URL works, DDL possible";
  } catch (error) {
    report.error = String(error);
    report.verdict = "function deployed but the database work failed";
  } finally {
    try {
      await client.end();
    } catch {
      // already closed
    }
  }

  return json(report);
});
