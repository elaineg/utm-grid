"use client";

/**
 * Per-row QR popover.
 * - Renders the QR code only in a client effect / on click (NEVER in a useState lazy initializer,
 *   NEVER reads window/document during render — SSR/hydration safe).
 * - Dismisses on Esc, on pointerdown outside, and when a different row's popover opens.
 * - Fix 4 (Round 1): when triggerRect is provided, uses position:fixed computed from the trigger's
 *   viewport coordinates. Clamped so it never overlaps side panels or falls below the fold.
 *   position:fixed is relative to the viewport even inside a position:relative container
 *   (as long as no ancestor has transform/filter/perspective — the sticky table does not).
 * - Fix 2 (Round 1): Download PNG uses Blob + object URL (safe on mobile Safari).
 * - cardFlow mode: renders inline in the card's normal flow (mobile — no fixed/absolute positioning).
 * - Round 2 Fix 1: iOS-safe download — off-screen anchor + delayed revoke (5s) so the
 *   object URL is still live when iOS resolves the download gesture.
 * - Round 2 Fix 2: caret tether + full-URL display (wrapping + title tooltip + copy affordance).
 * - READ-ONLY: never mutates grid state, never fires any network request.
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { writeClipboard } from "../../lib/share";

/** Popover width — used for clamping. */
const POPOVER_W = 288; // px (matches w-72)
/** Estimated popover height for initial clamping (refined after measuring). */
const POPOVER_H_ESTIMATE = 420;

interface QrPopoverProps {
  /** The full generated URL to encode. Must be non-empty. */
  url: string;
  /** 1-based row index for aria-label. */
  rowIndex: number;
  /** Called when the popover requests to close (Esc / click-out). */
  onClose: () => void;
  /** Whether to render in card-flow (mobile inline) vs desktop popover mode. */
  cardFlow?: boolean;
  /**
   * Fix 4: DOMRect of the trigger button, used to compute a fixed position.
   * When provided, uses position:fixed relative to the viewport, clamped so it never
   * overlaps the right-side config panels or falls below the fold.
   */
  triggerRect?: DOMRect | null;
}

/**
 * Round 2 Fix 1: Reliable cross-platform blob download.
 * Uses a.click() (trusted — works for Playwright + Chrome + Firefox + Android Chrome).
 * For iOS Safari: element is positioned off-screen (not display:none) so .click() fires.
 * Revoke is delayed 5000ms so iOS has time to start the download before URL is invalidated.
 */
function triggerBlobDownload(objectUrl: string, filename: string): void {
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  // Off-screen but NOT display:none — required for iOS Safari to trigger the download.
  a.style.position = "fixed";
  a.style.top = "-9999px";
  a.style.left = "-9999px";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Delay revocation — iOS Safari needs more time to start the download gesture.
  setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
}

export function QrPopover({ url, rowIndex, onClose, cardFlow = false, triggerRect }: QrPopoverProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrSvgString, setQrSvgString] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [urlCopied, setUrlCopied] = useState(false);
  const urlCopyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Generate QR only in an effect (after mount, client-only) — never during render.
  useEffect(() => {
    let cancelled = false;
    async function generate() {
      try {
        const QRCode = (await import("qrcode")).default;
        const [dataUrl, svgStr] = await Promise.all([
          QRCode.toDataURL(url, { width: 160, margin: 1, color: { dark: "#111827", light: "#ffffff" } }),
          QRCode.toString(url, { type: "svg", margin: 1 }),
        ]);
        if (!cancelled) {
          setQrDataUrl(dataUrl);
          setQrSvgString(svgStr);
        }
      } catch {
        if (!cancelled) setError("Could not generate QR code.");
      }
    }
    void generate();
    return () => { cancelled = true; };
  }, [url]);

  // Dismiss on Esc.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Dismiss on pointerdown outside (desktop only — cardFlow uses native tap-out behavior).
  // Round 2 Fix 1: also ignore clicks inside ANY role=dialog QrPopover (the card-flow sibling
  // instance, if both are mounted at once). Without this, the desktop instance's capture-phase
  // pointerdown listener fires when the user taps a button in the card-flow popover, calling
  // setOpenQrRowId(null) BEFORE the button's onClick fires — unmounting the card popover
  // before the download handler runs. Checking closest('[role=dialog]') makes it treat any
  // open QrPopover as "inside" and prevents this cross-instance dismissal race.
  useEffect(() => {
    if (cardFlow) return;
    function onPointer(e: PointerEvent) {
      const target = e.target as Node;
      // If the click is inside any QrPopover dialog (desktop OR card-flow sibling), skip.
      if (popoverRef.current && popoverRef.current.contains(target)) return;
      if (target instanceof Element && target.closest('[role="dialog"]')) return;
      onClose();
    }
    document.addEventListener("pointerdown", onPointer, true);
    return () => document.removeEventListener("pointerdown", onPointer, true);
  }, [onClose, cardFlow]);

  /**
   * Round 2 Fix 1: PNG download using Blob + object URL, iOS-safe.
   * Uses triggerBlobDownload() which uses dispatchEvent(MouseEvent) + 5s revoke delay
   * for reliable iOS Safari behavior in both table and card view.
   * Falls back to opening in a new tab if Blob creation fails.
   */
  const downloadPng = useCallback(() => {
    if (!qrDataUrl) return;
    const filename = `qr-row-${rowIndex}.png`;
    try {
      const byteString = atob(qrDataUrl.split(",")[1] ?? "");
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: "image/png" });
      const objectUrl = URL.createObjectURL(blob);
      triggerBlobDownload(objectUrl, filename);
    } catch {
      // Fallback: open data-URI in a new tab (user can long-press Save on iOS).
      window.open(qrDataUrl, "_blank", "noopener");
    }
  }, [qrDataUrl, rowIndex]);

  const downloadSvg = useCallback(() => {
    if (!qrSvgString) return;
    const filename = `qr-row-${rowIndex}.svg`;
    try {
      const blob = new Blob([qrSvgString], { type: "image/svg+xml" });
      const objectUrl = URL.createObjectURL(blob);
      triggerBlobDownload(objectUrl, filename);
    } catch {
      const dataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrSvgString)}`;
      window.open(dataUri, "_blank", "noopener");
    }
  }, [qrSvgString, rowIndex]);

  /** Round 2 Fix 2: copy the encoded URL with green-fill in-place confirmation (ref-stable timer). */
  const copyEncodedUrl = useCallback(async () => {
    try {
      await writeClipboard(url);
    } catch {
      // writeClipboard already tries execCommand fallback
    }
    if (urlCopyTimer.current) clearTimeout(urlCopyTimer.current);
    setUrlCopied(true);
    urlCopyTimer.current = setTimeout(() => {
      setUrlCopied(false);
      urlCopyTimer.current = null;
    }, 1800);
  }, [url]);

  const content = (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-700">QR Code — Row {rowIndex}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close QR popover"
          className="rounded p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        >
          ✕
        </button>
      </div>

      {/* QR image */}
      <div className="flex justify-center">
        {error ? (
          <p role="alert" className="text-xs text-red-600">{error}</p>
        ) : qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt={`QR code for row ${rowIndex}`}
            width={160}
            height={160}
            className="rounded border border-gray-100"
          />
        ) : (
          <div className="h-40 w-40 rounded border border-gray-100 bg-gray-50 flex items-center justify-center">
            <span className="text-xs text-gray-400">Generating…</span>
          </div>
        )}
      </div>

      {/* Round 2 Fix 2: Encoded URL — wrapping (no hard-clip), title tooltip, Copy affordance */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Encodes</span>
          {/* Copy button — green-fill in-place on click, aria-live confirmation, ref-stable timer */}
          <button
            type="button"
            aria-label={`Copy encoded URL for row ${rowIndex}`}
            data-testid={`qr-copy-url-row-${rowIndex}`}
            onClick={() => void copyEncodedUrl()}
            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold transition-colors duration-150 ${
              urlCopied
                ? "bg-green-500 text-white"
                : "border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {urlCopied ? "Copied ✓" : "Copy"}
          </button>
        </div>
        {/* aria-live for screen-reader announcement of copy confirmation */}
        <span aria-live="polite" className="sr-only">
          {urlCopied ? "URL copied" : ""}
        </span>
        {/* URL text: wrapping + title tooltip carrying the full value.
            break-words ensures no hard mid-string clip; title always has the full URL. */}
        <p
          className="break-words rounded bg-gray-50 px-2 py-1.5 font-mono text-[10px] text-gray-700 select-all"
          title={url}
        >
          {url}
        </p>
      </div>

      {/* Download buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={downloadPng}
          disabled={!qrDataUrl}
          aria-label={`Download QR PNG for row ${rowIndex}`}
          className="flex-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
        >
          Download PNG
        </button>
        <button
          type="button"
          onClick={downloadSvg}
          disabled={!qrSvgString}
          aria-label={`Download QR SVG for row ${rowIndex}`}
          className="flex-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
        >
          Download SVG
        </button>
      </div>
    </div>
  );

  if (cardFlow) {
    // Mobile card flow: renders inline below the card, full-width, in normal document flow.
    // Never absolute/fixed — no scroll-jump, no overlay.
    // Round 2 Fix 1: same download handlers (triggerBlobDownload) as the desktop instance.
    return (
      <div
        ref={popoverRef}
        role="dialog"
        aria-label={`QR code popover for row ${rowIndex}`}
        className="w-full rounded-lg border border-gray-200 bg-white p-4 shadow-md"
      >
        {content}
      </div>
    );
  }

  if (triggerRect) {
    // Fix 4 (Round 1): position:fixed computed from trigger's viewport coordinates.
    // position:fixed escapes the containing block and is relative to the viewport,
    // so this works correctly even inside a position:relative sticky <td>.
    // Prefer opening to the LEFT to avoid overlapping the right-side config panels.
    const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
    const vh = typeof window !== "undefined" ? window.innerHeight : 900;
    const popH = POPOVER_H_ESTIMATE;

    // Round 2 Fix 2: position adjacent to the trigger (not 350px away).
    // Try left of trigger first; if it clips, go right; then clamp.
    let left = triggerRect.left - POPOVER_W - 4;
    let top = triggerRect.top;

    // If left edge would clip, open to the right.
    if (left < 8) left = triggerRect.right + 4;

    // Clamp horizontal.
    left = Math.max(8, Math.min(left, vw - POPOVER_W - 8));

    // Flip upward if it would go below the fold.
    if (top + popH > vh - 8) {
      top = Math.max(8, triggerRect.bottom - popH);
    }
    top = Math.max(8, top);

    // Round 2 Fix 2: caret side — pointing toward the trigger button.
    // If popover is to the LEFT of trigger: caret points RIGHT (toward trigger).
    // If popover is to the RIGHT of trigger: caret points LEFT (toward trigger).
    const isLeftOfTrigger = left + POPOVER_W < triggerRect.left;
    // Caret vertical position relative to the popover top (align to the trigger button center).
    const caretTop = Math.max(12, Math.min(triggerRect.top + triggerRect.height / 2 - top - 6, popH - 24));

    return (
      <div
        ref={popoverRef}
        role="dialog"
        aria-label={`QR code popover for row ${rowIndex}`}
        style={{ position: "fixed", top, left, zIndex: 9999, width: POPOVER_W }}
        className="rounded-lg border border-gray-200 bg-white p-4 shadow-xl"
      >
        {/* Round 2 Fix 2: caret tether — CSS triangle pointing at the trigger button */}
        {isLeftOfTrigger ? (
          // Caret on the RIGHT side of the popover (pointing right toward trigger)
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              right: "-8px",
              top: caretTop,
              width: 0,
              height: 0,
              borderTop: "8px solid transparent",
              borderBottom: "8px solid transparent",
              borderLeft: "8px solid #e5e7eb",
            }}
          >
            {/* Inner caret (bg-white fill) */}
            <span
              style={{
                position: "absolute",
                right: "1px",
                top: "-7px",
                width: 0,
                height: 0,
                borderTop: "7px solid transparent",
                borderBottom: "7px solid transparent",
                borderLeft: "7px solid white",
              }}
            />
          </span>
        ) : (
          // Caret on the LEFT side of the popover (pointing left toward trigger)
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "-8px",
              top: caretTop,
              width: 0,
              height: 0,
              borderTop: "8px solid transparent",
              borderBottom: "8px solid transparent",
              borderRight: "8px solid #e5e7eb",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: "1px",
                top: "-7px",
                width: 0,
                height: 0,
                borderTop: "7px solid transparent",
                borderBottom: "7px solid transparent",
                borderRight: "7px solid white",
              }}
            />
          </span>
        )}
        {content}
      </div>
    );
  }

  // Fallback: absolute within parent container (no triggerRect — renders below trigger).
  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label={`QR code popover for row ${rowIndex}`}
      className="absolute right-0 top-full z-50 mt-1 w-72 rounded-lg border border-gray-200 bg-white p-4 shadow-xl"
    >
      {content}
    </div>
  );
}
