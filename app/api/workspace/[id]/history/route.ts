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
