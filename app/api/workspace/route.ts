/**
 * POST /api/workspace
 *
 * Creates a new shared workspace and seeds version 1 in workspace_versions.
 * Body: { payload: <WorkspacePayload JSON string>, editor?: string }
 *   OR (backward-compat): raw WorkspacePayload JSON
 * Returns: { id: string } — 201
 * Errors: 400 (malformed body) | 413 (too large)
 *
 * runtime = "nodejs" — libsql is NOT edge-compatible.
 */

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../lib/db";
import { generateWorkspaceId, MAX_PAYLOAD_BYTES, parseWorkspacePayload } from "../../../lib/workspace";
import { normalizeEditor } from "../../../lib/workspaceHistory";

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
  const id = generateWorkspaceId();
  const now = Date.now();

  const db = await getDb();
  await db.execute({
    sql: "INSERT INTO workspaces (id, data, created_at, updated_at) VALUES (?, ?, ?, ?)",
    args: [id, payloadRaw, now, now],
  });

  // Seed version 1
  await db.execute({
    sql: "INSERT INTO workspace_versions (workspace_id, data, editor, created_at) VALUES (?, ?, ?, ?)",
    args: [id, payloadRaw, editor, now],
  });

  return NextResponse.json({ id }, { status: 201 });
}
