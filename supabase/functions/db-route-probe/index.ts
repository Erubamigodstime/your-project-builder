// Probe: can an edge function apply schema to Lovable Cloud?
//
// The backend migration plan's §7 proposes running migrations from a one-shot
// admin edge function holding `SUPABASE_DB_URL`, because there is no dashboard
// and migrations pushed into the synced repo are never applied. That route is
// the whole of Phase 1 and it has never been tested. This answers it:
//
//   1. Is `SUPABASE_DB_URL` really in the function environment?
//   2. Can code open a direct Postgres connection with it?
//   3. Can that connection author DDL?
//   4. Can it run `CREATE INDEX CONCURRENTLY` — which the seven out-of-band SQL
//      files need, and which cannot run inside a transaction?
//
// It creates two tables named `_route_probe*` and drops them again. Nothing
// else is touched.
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const json = (body: unknown) =>
  new Response(JSON.stringify(body, null, 2), {
    headers: { "content-type": "application/json" },
  });

Deno.serve(async () => {
  const url = Deno.env.get("SUPABASE_DB_URL");
  const report: Record<string, unknown> = {
    probe: "db-route-probe",
    deployed_from: "git push to the synced branch",
    env_SUPABASE_DB_URL: Boolean(url),
    env_SUPABASE_SERVICE_ROLE_KEY: Boolean(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")),
    env_SUPABASE_URL: Boolean(Deno.env.get("SUPABASE_URL")),
  };

  if (!url) return json({ ...report, verdict: "no SUPABASE_DB_URL in this environment" });

  const client = new Client(url);
  try {
    await client.connect();
    report.connected = true;

    const version = await client.queryObject<{ version: string }>("select version()");
    report.server_version = version.rows[0]?.version;

    const current = await client.queryObject<{ user: string; db: string }>(
      "select current_user as user, current_database() as db",
    );
    report.connected_as = current.rows[0];

    // (3) plain DDL
    await client.queryArray("create table if not exists _route_probe (id int primary key)");
    const made = await client.queryObject<{ n: number }>(
      "select count(*)::int as n from pg_class where relname = '_route_probe'",
    );
    report.ddl_create_table = made.rows[0]?.n === 1;
    await client.queryArray("drop table if exists _route_probe");

    // (4) CONCURRENTLY, which the seven files require and a transaction forbids
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

    // Extensions start bare on a Cloud project; pg_trgm is required by the
    // duplicate-hint indexes, so whether a function can install one matters.
    const ext = await client.queryObject<{ extname: string }>(
      "select extname from pg_extension order by extname",
    );
    report.extensions = ext.rows.map((row) => row.extname);

    report.verdict = "SUPABASE_DB_URL works and this function can author DDL";
  } catch (error) {
    report.error = String(error);
    report.verdict = "failed — see error";
  } finally {
    try {
      await client.end();
    } catch {
      // already closed
    }
  }

  return json(report);
});
