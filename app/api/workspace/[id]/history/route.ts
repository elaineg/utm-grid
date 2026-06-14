/**
 * GET /api/workspace/[id]/history
 *
 * Returns the version history for a workspace, newest-first, capped at ~25.
 * Response: [{ id, editor, created_at, data }]
 * Errors: 404 for unknown/invalid id.
 *
 * runtime = "nodejs" — libsql is NOT edge-compatible.
 */

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../../../lib/db";
import { isValidWorkspaceId } from "../../../../../lib/workspace";
import { VERSION_CAP } from "../../../../../lib/workspaceHistory";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * PATCH /api/workspace/[id]/history
 *
 * Body: { editor: string }
 * Back-fills the most-recent workspace_versions row's editor field so a name
 * entered after the creation snapshot propagates (P1-1 Round 3 fix).
 * Only updates the single most-recent row; ignores if workspace does not exist.
 */
export async function PATCH(
  req: NextRequest,
  ctx: RouteContext
): Promise<NextResponse> {
  const { id } = await ctx.params;
  if (!isValidWorkspaceId(id)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  let editor: string | null = null;
  try {
    const body = (await req.json()) as { editor?: unknown };
    if (typeof body.editor === "string" && body.editor.trim()) {
      editor = body.editor.trim().slice(0, 80);
    }
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (!editor) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const db = await getDb();
  // Find the most recent version for this workspace and update its editor.
  await db.execute({
    sql: `UPDATE workspace_versions
          SET editor = ?
          WHERE id = (
            SELECT id FROM workspace_versions
            WHERE workspace_id = ?
            ORDER BY id DESC
            LIMIT 1
          )`,
    args: [editor, id],
  });
  return NextResponse.json({ ok: true });
}

export async function GET(
  _req: NextRequest,
  ctx: RouteContext
): Promise<NextResponse> {
  const { id } = await ctx.params;

  if (!isValidWorkspaceId(id)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const db = await getDb();

  // Verify workspace exists
  const ws = await db.execute({
    sql: "SELECT id FROM workspaces WHERE id = ?",
    args: [id],
  });
  if (ws.rows.length === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Fetch newest-first, capped at VERSION_CAP
  const result = await db.execute({
    sql: `SELECT id, editor, created_at, data
          FROM workspace_versions
          WHERE workspace_id = ?
          ORDER BY id DESC
          LIMIT ?`,
    args: [id, VERSION_CAP],
  });

  const versions = result.rows.map((row) => ({
    id: row.id as number,
    editor: (row.editor as string | null) ?? null,
    created_at: row.created_at as number,
    data: row.data as string,
  }));

  return NextResponse.json(versions);
}
