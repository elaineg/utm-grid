/**
 * POST /api/workspace
 *
 * Creates a new shared workspace.
 * Body: WorkspacePayload JSON { rows, settings, spec }
 * Returns: { id: string } — 201
 * Errors: 400 (malformed body) | 413 (too large)
 *
 * runtime = "nodejs" — libsql is NOT edge-compatible.
 */

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../lib/db";
import { generateWorkspaceId, MAX_PAYLOAD_BYTES, parseWorkspacePayload } from "../../../lib/workspace";

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 413: cap request body at MAX_PAYLOAD_BYTES (~1MB).
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

  const id = generateWorkspaceId();
  const now = Date.now();

  const db = await getDb();
  await db.execute({
    sql: "INSERT INTO workspaces (id, data, created_at, updated_at) VALUES (?, ?, ?, ?)",
    args: [id, raw, now, now],
  });

  return NextResponse.json({ id }, { status: 201 });
}
