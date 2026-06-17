"use client";

/**
 * QR Branding panel — per-grid branding settings for all generated QRs.
 *
 * Layout: full-width stacked strip, three groups separated by hairlines:
 *  1. Output — size segmented control + PNG/SVG toggle
 *  2. Colors — fg/bg color pickers with live preview tile + scannability guard
 *  3. Logo   — optional center-logo upload + thumbnail + remove action
 *
 * SSR-safe: no window/document reads in render. Color pickers are <input type="color">
 * which are fully controlled (value driven by state).
 * Client-only: canvas QR preview rendered in useEffect.
 */

import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_QR_BRANDING,
  isContrastSufficient,
  formatContrastRatio,
  maxLogoSizePx,
  type QrBranding,
  type QrFormat,
  type QrSize,
} from "../../lib/qrBranding";

interface QrBrandingPanelProps {
  branding: QrBranding;
  onChange: (next: QrBranding) => void;
  onClose?: () => void;
}

const SIZES: QrSize[] = [512, 1024, 2048];

/** Placeholder URL for the live preview tile. */
const PREVIEW_URL = "https://acme.com/spring-sale?utm_source=newsletter&utm_medium=email&utm_campaign=spring_sale_2026";

export function QrBrandingPanel({ branding, onChange, onClose }: QrBrandingPanelProps) {
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const contrastOk = isContrastSufficient(branding);
  const contrastLabel = formatContrastRatio(branding);

  // Regenerate preview tile whenever branding changes (client-only, in effect)
  useEffect(() => {
    let cancelled = false;
    async function draw() {
      const canvas = previewCanvasRef.current;
      if (!canvas) return;
      try {
        setPreviewError(null);
        const QRCode = (await import("qrcode")).default;

        // Generate QR data URL with current branding colors
        const ecLevel = branding.logoDataUrl ? "H" : "M";
        const dataUrl = await QRCode.toDataURL(PREVIEW_URL, {
          width: 120,
          margin: 1,
          errorCorrectionLevel: ecLevel,
          color: { dark: branding.fgColor, light: branding.bgColor },
        });

        if (cancelled) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.width = 120;
        canvas.height = 120;

        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = dataUrl;
        });
        if (cancelled) return;
        ctx.drawImage(img, 0, 0, 120, 120);

        // Composite logo if present
        if (branding.logoDataUrl) {
          const maxSide = maxLogoSizePx(120);
          const logoImg = new Image();
          await new Promise<void>((resolve) => {
            logoImg.onload = () => resolve();
            logoImg.onerror = () => resolve(); // non-blocking
            logoImg.src = branding.logoDataUrl;
          });
          if (cancelled) return;

          const side = Math.min(maxSide, logoImg.naturalWidth, logoImg.naturalHeight, maxSide);
          const x = Math.round((120 - side) / 2);
          const y = Math.round((120 - side) / 2);

          // White backing for logo (quiet zone)
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(x - 3, y - 3, side + 6, side + 6);
          ctx.drawImage(logoImg, x, y, side, side);
        }
      } catch {
        if (!cancelled) setPreviewError("Preview unavailable.");
      }
    }
    void draw();
    return () => { cancelled = true; };
  }, [branding.fgColor, branding.bgColor, branding.logoDataUrl]);

  const handleFgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...branding, fgColor: e.target.value });
  };

  const handleBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...branding, bgColor: e.target.value });
  };

  const handleSizeChange = (size: QrSize) => {
    onChange({ ...branding, size });
  };

  const handleFormatChange = (format: QrFormat) => {
    onChange({ ...branding, format });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    // Only accept PNG or SVG
    const isAccepted = file.type === "image/png" || file.type === "image/svg+xml" ||
      file.name.endsWith(".png") || file.name.endsWith(".svg");
    if (!isAccepted) {
      // Show amber hint — retain current logo
      setLogoError("Use a PNG or SVG logo.");
      return;
    }
    setLogoError(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) onChange({ ...branding, logoDataUrl: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const [logoError, setLogoError] = useState<string | null>(null);

  const handleRemoveLogo = () => {
    onChange({ ...branding, logoDataUrl: "" });
    setLogoError(null);
  };

  const handleReset = () => {
    onChange(DEFAULT_QR_BRANDING);
    setLogoError(null);
  };

  const logoInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      data-testid="qr-branding-panel"
      className="rounded-lg border border-gray-200 bg-white w-full"
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200">
        <div>
          <span className="text-xs font-semibold tracking-wide text-gray-700">QR Branding</span>
          <span className="ml-2 text-[10px] text-gray-400">Applies to every QR in this grid</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="text-[10px] text-gray-400 hover:text-gray-600 underline"
          >
            Reset defaults
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close QR branding panel"
              className="rounded p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-100">

        {/* ── Group 1: Output — size + format ── */}
        <div className="px-4 py-3 flex flex-wrap items-center gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Size (PNG)</span>
            <div className="flex items-center gap-1">
              {SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSizeChange(s)}
                  disabled={branding.format === "svg"}
                  aria-label={`Size ${s}px`}
                  aria-pressed={branding.size === s}
                  className={`rounded border px-2.5 py-1 text-xs font-medium transition-colors ${
                    branding.size === s && branding.format !== "svg"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                  } disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Format</span>
            <div className="flex items-center gap-1">
              {(["png", "svg"] as QrFormat[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => handleFormatChange(f)}
                  aria-label={`Format ${f.toUpperCase()}`}
                  aria-pressed={branding.format === f}
                  className={`rounded border px-2.5 py-1 text-xs font-medium uppercase transition-colors ${
                    branding.format === f
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {branding.format === "svg" && (
            <p className="text-[10px] text-gray-400 self-end pb-0.5">SVG is vector — size picker ignored.</p>
          )}
        </div>

        {/* ── Group 2: Colors + live preview + contrast guard ── */}
        <div className="px-4 py-3">
          <div className="flex flex-wrap items-start gap-6">
            {/* Color pickers */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="qr-fg-color"
                    className="text-[10px] font-semibold uppercase tracking-wide text-gray-400"
                  >
                    Foreground (dark)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="qr-fg-color"
                      type="color"
                      value={branding.fgColor}
                      onChange={handleFgChange}
                      aria-label="QR foreground color"
                      className="h-8 w-12 cursor-pointer rounded border border-gray-300 p-0.5"
                    />
                    <span className="font-mono text-xs text-gray-600">{branding.fgColor}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="qr-bg-color"
                    className="text-[10px] font-semibold uppercase tracking-wide text-gray-400"
                  >
                    Background (light)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="qr-bg-color"
                      type="color"
                      value={branding.bgColor}
                      onChange={handleBgChange}
                      aria-label="QR background color"
                      className="h-8 w-12 cursor-pointer rounded border border-gray-300 p-0.5"
                    />
                    <span className="font-mono text-xs text-gray-600">{branding.bgColor}</span>
                  </div>
                </div>
              </div>

              {/* Contrast ratio display */}
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${contrastOk ? "text-green-700" : "text-amber-700"}`}>
                  Contrast: {contrastLabel}
                </span>
                {contrastOk && (
                  <span className="text-[10px] text-green-600">✓ scannable</span>
                )}
              </div>
            </div>

            {/* Live preview tile */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Live preview</span>
              <div
                className="relative rounded border border-gray-200"
                style={{ width: 120, height: 120, background: branding.bgColor }}
              >
                {previewError ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] text-gray-400">Preview unavailable</span>
                  </div>
                ) : (
                  <canvas
                    ref={previewCanvasRef}
                    width={120}
                    height={120}
                    aria-label="QR code branding preview"
                    className="rounded"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Scannability warning — amber, actionable, blocks downloads */}
          {!contrastOk && (
            <div
              role="alert"
              data-testid="contrast-warning"
              className="mt-3 flex items-start gap-2 rounded border border-amber-200 bg-amber-50 px-3 py-2"
            >
              <span className="mt-0.5 shrink-0 text-amber-500" aria-hidden="true">⚠</span>
              <p className="text-xs text-amber-800">
                <strong>Low contrast</strong> — pick a darker foreground or a lighter background so
                scanners can read it. ({contrastLabel})
              </p>
            </div>
          )}
        </div>

        {/* ── Group 3: Center logo ── */}
        <div className="px-4 py-3 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-700">Center logo</span>
              <span className="ml-1.5 text-[10px] text-gray-400">optional</span>
            </div>
            {branding.logoDataUrl && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="text-[10px] text-red-500 hover:text-red-700 underline"
              >
                Remove logo
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {branding.logoDataUrl && (
              <img
                src={branding.logoDataUrl}
                alt="Logo thumbnail"
                className="h-12 w-12 rounded border border-gray-200 object-contain p-1"
              />
            )}
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 min-h-[36px]"
            >
              {branding.logoDataUrl ? "Change logo" : "Upload logo (PNG / SVG)"}
            </button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/svg+xml,.png,.svg"
              aria-label="Logo upload"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </div>

          {logoError && (
            <p role="alert" className="text-xs text-amber-700">
              {logoError}
            </p>
          )}

          <p className="text-[10px] text-gray-400 leading-relaxed">
            We bump error-correction to level H and keep a clear margin so it still scans.
            Logo composited locally — never uploaded.
          </p>
        </div>

      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 px-4 py-2">
        <p className="text-[10px] text-gray-400">
          All client-side — your logo and links never leave your browser.
        </p>
      </div>
    </div>
  );
}
