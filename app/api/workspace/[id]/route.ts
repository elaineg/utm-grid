/**
 * GET  /api/workspace/[id] → { data: string } | 404
 * PUT  /api/workspace/[id] → 200 | 400 | 404 | 413
 *
 * runtime = "nodejs" — libsql is NOT edge-compatible.
 */

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { MAX_PAYLOAD_BYTES, parseWorkspacePayload, isValidWorkspaceId } from "../../../../lib/workspace";

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

  const payload = parseWorkspacePayload(raw);
  if (!payload) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

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

  await db.execute({
    sql: "UPDATE workspaces SET data = ?, updated_at = ? WHERE id = ?",
    args: [raw, now, id],
  });

  return NextResponse.json({ ok: true });
}
