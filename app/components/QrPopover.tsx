"use client";

/**
 * Per-row QR popover.
 * - Renders the QR code only in a client effect / on click (NEVER in a useState lazy initializer,
 *   NEVER reads window/document during render — SSR/hydration safe).
 * - Dismisses on Esc, on pointerdown outside, and when a different row's popover opens.
 * - z-50 so it renders above sticky columns (z-20/z-30) and the sticky header.
 * - READ-ONLY: never mutates grid state, never fires any network request.
 */

import { useEffect, useRef, useCallback, useState } from "react";

interface QrPopoverProps {
  /** The full generated URL to encode. Must be non-empty. */
  url: string;
  /** 1-based row index for aria-label. */
  rowIndex: number;
  /** Called when the popover requests to close (Esc / click-out). */
  onClose: () => void;
  /** Whether to render in card-flow (mobile) vs desktop popover mode. */
  cardFlow?: boolean;
}

export function QrPopover({ url, rowIndex, onClose, cardFlow = false }: QrPopoverProps) {
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

  // Dismiss on Esc
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Dismiss on pointerdown outside (desktop mode only — cardFlow uses tap-out separately)
  useEffect(() => {
    if (cardFlow) return;
    function onPointer(e: PointerEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    // Use capture to fire before any click handlers inside the grid
    document.addEventListener("pointerdown", onPointer, true);
    return () => document.removeEventListener("pointerdown", onPointer, true);
  }, [onClose, cardFlow]);

  const downloadPng = useCallback(() => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `qr-row-${rowIndex}.png`;
    a.click();
  }, [qrDataUrl, rowIndex]);

  const downloadSvg = useCallback(() => {
    if (!qrSvgString) return;
    const blob = new Blob([qrSvgString], { type: "image/svg+xml" });
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = `qr-row-${rowIndex}.svg`;
    a.click();
    URL.revokeObjectURL(objectUrl);
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
    // Mobile card flow: renders inline below the card, full-width, pushing content down.
    // Never an overlay. z-10 so it reads above cell affordances but is in normal flow.
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

  // Desktop: absolute/portal positioning is done by the parent.
  // The parent wraps this in a positioned container above the sticky columns.
  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label={`QR code popover for row ${rowIndex}`}
      className="w-64 rounded-lg border border-gray-200 bg-white p-4 shadow-xl"
      // z-index is applied by the parent container
    >
      {content}
    </div>
  );
}
