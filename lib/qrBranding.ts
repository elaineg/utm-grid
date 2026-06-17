/**
 * QR Branding utilities — pure functions, no browser APIs, no React.
 * Safe to import in any context including unit tests.
 *
 * Branding settings apply to ALL generated QRs in a grid (per-grid, not per-row).
 * They are saved to localStorage and ride inside saved campaigns / share link /
 * workspace payload alongside the existing spec.
 */

/** Supported output sizes (px). SVG ignores this — it is vector. */
export type QrSize = 512 | 1024 | 2048;

/** Supported output formats. */
export type QrFormat = "png" | "svg";

/** Grid-wide QR branding settings. */
export interface QrBranding {
  /** Foreground (dark) color in #rrggbb hex. */
  fgColor: string;
  /** Background (light) color in #rrggbb hex. */
  bgColor: string;
  /** Output size in px (PNG only — SVG is vector). */
  size: QrSize;
  /** Output format. */
  format: QrFormat;
  /**
   * Base64-encoded logo image (PNG or SVG).
   * When present, error-correction is bumped to H and logo is composited at center.
   * Stored as a data URL string (e.g. "data:image/png;base64,...").
   * Empty string = no logo.
   */
  logoDataUrl: string;
}

export const DEFAULT_QR_BRANDING: QrBranding = {
  fgColor: "#111827",
  bgColor: "#ffffff",
  size: 1024,
  format: "png",
  logoDataUrl: "",
};

// ── Contrast / scannability guard ──────────────────────────────────────────────

/**
 * Convert a #rrggbb hex color to its relative luminance (WCAG 2.1 formula).
 * Returns a value in [0, 1] where 1 = white, 0 = black.
 */
function hexToLuminance(hex: string): number {
  // Strip leading #
  const h = hex.replace(/^#/, "");
  if (h.length !== 6) return 0;
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const linearize = (c: number) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/**
 * Compute WCAG contrast ratio between two #rrggbb hex colors.
 * Returns a value in [1, 21], where 21 is maximum contrast (black on white).
 *
 * QR codes need at least ~3:1 contrast to scan reliably on consumer devices
 * (ISO 18004 recommends minimum 4:1 for reliable decoding in poor conditions).
 * We use 3:1 as the threshold so users aren't blocked on merely-imperfect pairs
 * while still blocking genuinely-unscannable low-contrast choices.
 */
export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = hexToLuminance(hex1);
  const l2 = hexToLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Minimum contrast ratio for reliable QR scanning. */
export const MIN_QR_CONTRAST = 3.0;

/**
 * Returns true when the fg/bg contrast is sufficient for reliable QR scanning.
 * When false, downloads should be disabled and a warning shown.
 */
export function isContrastSufficient(branding: QrBranding): boolean {
  return contrastRatio(branding.fgColor, branding.bgColor) >= MIN_QR_CONTRAST;
}

/**
 * Returns a human-readable contrast ratio string for display (e.g. "2.4:1").
 */
export function formatContrastRatio(branding: QrBranding): string {
  const ratio = contrastRatio(branding.fgColor, branding.bgColor);
  return `${ratio.toFixed(1)}:1`;
}

// ── Logo coverage cap ──────────────────────────────────────────────────────────

/**
 * Maximum logo coverage as a fraction of QR module area (0–1).
 * Error-correction level H corrects up to 30% damage.
 * We cap at 22% to leave safety margin.
 */
export const MAX_LOGO_COVERAGE = 0.22;

/**
 * Compute the maximum logo pixel size so it covers at most MAX_LOGO_COVERAGE
 * of the QR image area.
 *
 * @param qrSizePx - The QR image size in pixels.
 * @returns The maximum logo side length in pixels (square bounding box).
 */
export function maxLogoSizePx(qrSizePx: number): number {
  // logo_area / qr_area ≤ MAX_LOGO_COVERAGE
  // Assuming square logo: logo_side² / qrSizePx² ≤ MAX_LOGO_COVERAGE
  return Math.floor(qrSizePx * Math.sqrt(MAX_LOGO_COVERAGE));
}
