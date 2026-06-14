/**
 * Lazily-instantiated libsql/Turso client.
 *
 * - Does NOT connect at import/module-evaluation time — safe for next build
 *   even without env vars present.
 * - On first use, runs CREATE TABLE IF NOT EXISTS to ensure the schema exists.
 * - Runtime: nodejs (libsql is NOT edge-compatible).
 *
 * Env vars required at deploy time:
 *   TURSO_DATABASE_URL  — e.g. libsql://<db>.turso.io
 *   TURSO_AUTH_TOKEN    — Turso auth token
 */

import { createClient, type Client } from "@libsql/client";

let _client: Client | null = null;
let _initialized = false;

function getClient(): Client {
  if (!_client) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    if (!url) {
      throw new Error(
        "TURSO_DATABASE_URL is not set. The deployer must provision this env var."
      );
    }
    _client = createClient({ url, authToken });
  }
  return _client;
}

/**
 * Returns a ready-to-use libsql client, creating the workspaces and
 * workspace_versions tables if they don't exist yet. Idempotent — safe to
 * call on every request.
 */
export async function getDb(): Promise<Client> {
  const client = getClient();
  if (!_initialized) {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS workspaces (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        created_at INTEGER,
        updated_at INTEGER
      )
    `);
    await client.execute(`
      CREATE TABLE IF NOT EXISTS workspace_versions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workspace_id TEXT NOT NULL,
        data TEXT NOT NULL,
        editor TEXT,
        created_at INTEGER NOT NULL
      )
    `);
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_workspace_versions_ws_id
        ON workspace_versions (workspace_id, id)
    `);
    _initialized = true;
  }
  return client;
}
