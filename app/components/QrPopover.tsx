"use client";

/**
 * Per-row QR popover.
 * - Renders the QR code only in a client effect / on click (NEVER in a useState lazy initializer,
 *   NEVER reads window/document during render — SSR/hydration safe).
 * - Dismisses on Esc, on pointerdown outside, and when a different row's popover opens.
 * - Fix 4: when triggerRect is provided, uses position:fixed computed from the trigger's
 *   viewport coordinates. Clamped so it never overlaps side panels or falls below the fold.
 *   position:fixed is relative to the viewport even inside a position:relative container
 *   (as long as no ancestor has transform/filter/perspective — the sticky table does not).
 * - Fix 2: Download PNG uses Blob + object URL (safe on mobile Safari).
 * - cardFlow mode: renders inline in the card's normal flow (mobile — no fixed/absolute positioning).
 * - READ-ONLY: never mutates grid state, never fires any network request.
 */

import { useEffect, useRef, useCallback, useState } from "react";

/** Popover width — used for clamping. */
const POPOVER_W = 256; // px (matches w-64)
/** Estimated popover height for initial clamping (refined after measuring). */
const POPOVER_H_ESTIMATE = 380;

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

export function QrPopover({ url, rowIndex, onClose, cardFlow = false, triggerRect }: QrPopoverProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrSvgString, setQrSvgString] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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
  useEffect(() => {
    if (cardFlow) return;
    function onPointer(e: PointerEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("pointerdown", onPointer, true);
    return () => document.removeEventListener("pointerdown", onPointer, true);
  }, [onClose, cardFlow]);

  /**
   * Fix 2: PNG download using Blob + object URL.
   * iOS Safari ignores <a download> on data-URI anchors; Blob object URL works reliably.
   * Falls back to opening in a new tab if Blob is unavailable.
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
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
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
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch {
      const dataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrSvgString)}`;
      window.open(dataUri, "_blank", "noopener");
    }
  }, [qrSvgString, rowIndex]);

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

      {/* Encoded URL — mono, selectable, wrapping */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Encodes</span>
        <p className="break-all rounded bg-gray-50 px-2 py-1.5 font-mono text-[10px] text-gray-700 select-all">
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
    // Fix 4: position:fixed computed from trigger's viewport coordinates.
    // position:fixed escapes the containing block and is relative to the viewport,
    // so this works correctly even inside a position:relative sticky <td>.
    // Prefer opening to the LEFT to avoid overlapping the right-side config panels.
    const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
    const vh = typeof window !== "undefined" ? window.innerHeight : 900;
    const popH = POPOVER_H_ESTIMATE;

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

    return (
      <div
        ref={popoverRef}
        role="dialog"
        aria-label={`QR code popover for row ${rowIndex}`}
        style={{ position: "fixed", top, left, zIndex: 9999, width: POPOVER_W }}
        className="rounded-lg border border-gray-200 bg-white p-4 shadow-xl"
      >
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
      className="absolute right-0 top-full z-50 mt-1 w-64 rounded-lg border border-gray-200 bg-white p-4 shadow-xl"
    >
      {content}
    </div>
  );
}
