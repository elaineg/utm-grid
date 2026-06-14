/**
 * GET  /api/workspace/[id] → { data: string } | 404
 * PUT  /api/workspace/[id] → 200 | 400 | 404 | 413
 *
 * PUT body contract (extended for Workspace History):
 *   { payload: <WorkspacePayload JSON string>, editor?: string }
 *   OR (backward-compat) the raw WorkspacePayload JSON directly.
 *
 * The cleanest low-risk extension: accept EITHER:
 *   - A raw WorkspacePayload JSON object (existing clients)
 *   - { payload: string, editor?: string } (new history-aware clients)
 *
 * Detection: if the parsed object has a top-level "payload" key that is a
 * string, treat it as the new wrapped form. Otherwise treat the whole body as
 * the raw payload (backward-compat).
 *
 * runtime = "nodejs" — libsql is NOT edge-compatible.
 */

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { MAX_PAYLOAD_BYTES, parseWorkspacePayload, isValidWorkspaceId } from "../../../../lib/workspace";
import { isDuplicateVersion, idsToprune, normalizeEditor, VERSION_CAP } from "../../../../lib/workspaceHistory";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _req: NextRequest,
  ctx: RouteContext
): Promise<NextResponse> {
  const { id } = await ctx.params;

  if (!isValidWorkspaceId(id)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const db = await getDb();
  const result = await db.execute({
    sql: "SELECT data FROM workspaces WHERE id = ?",
    args: [id],
  });

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const data = result.rows[0].data as string;
  return NextResponse.json({ data });
}

export async function PUT(
  req: NextRequest,
  ctx: RouteContext
): Promise<NextResponse> {
  const { id } = await ctx.params;

  if (!isValidWorkspaceId(id)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // 413: cap body size
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_BYTES) {
    return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  }

  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  if (raw.length > MAX_PAYLOAD_BYTES) {
    return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  }

  // Detect new wrapped form { payload: string, editor?: string }
  // vs legacy raw WorkspacePayload.
  let payloadRaw: string = raw;
  let editorRaw: unknown = null;

  try {
    const top = JSON.parse(raw) as unknown;
    if (
      top !== null &&
      typeof top === "object" &&
      !Array.isArray(top) &&
      "payload" in (top as object) &&
      typeof (top as Record<string, unknown>).payload === "string"
    ) {
      // New wrapped form
      payloadRaw = (top as Record<string, unknown>).payload as string;
      editorRaw = (top as Record<string, unknown>).editor ?? null;
    }
    // else: raw form — payloadRaw stays as `raw`, editorRaw stays null
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const payload = parseWorkspacePayload(payloadRaw);
  if (!payload) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const editor = normalizeEditor(editorRaw);
  const now = Date.now();
  const db = await getDb();

  // Check workspace exists first
  const existing = await db.execute({
    sql: "SELECT id FROM workspaces WHERE id = ?",
    args: [id],
  });
  if (existing.rows.length === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Update current workspace state
  await db.execute({
    sql: "UPDATE workspaces SET data = ?, updated_at = ? WHERE id = ?",
    args: [payloadRaw, now, id],
  });

  // ── Version history ─────────────────────────────────────────────────────────
  // 1. Fetch the latest stored version's data to check for dedupe.
  const latestRow = await db.execute({
    sql: "SELECT data FROM workspace_versions WHERE workspace_id = ? ORDER BY id DESC LIMIT 1",
    args: [id],
  });
  const latestData = latestRow.rows.length > 0 ? (latestRow.rows[0].data as string) : null;

  // 2. Only insert if data differs from the latest version (avoid no-op spam).
  if (!isDuplicateVersion(payloadRaw, latestData)) {
    await db.execute({
      sql: "INSERT INTO workspace_versions (workspace_id, data, editor, created_at) VALUES (?, ?, ?, ?)",
      args: [id, payloadRaw, editor, now],
    });

    // 3. Prune oldest versions so we stay at VERSION_CAP.
    const allIds = await db.execute({
      sql: `SELECT id FROM workspace_versions WHERE workspace_id = ? ORDER BY id ASC`,
      args: [id],
    });
    const ids = allIds.rows.map((r) => r.id as number);
    const toPrune = idsToprune(ids);
    if (toPrune.length > 0) {
      // Batch delete using IN clause (libsql supports placeholders per item)
      const placeholders = toPrune.map(() => "?").join(", ");
      await db.execute({
        sql: `DELETE FROM workspace_versions WHERE id IN (${placeholders})`,
        args: toPrune,
      });
    }
  }

  return NextResponse.json({ ok: true, versionCap: VERSION_CAP });
}
