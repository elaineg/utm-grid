/**
 * Unit tests for QR branding utilities.
 * Pure functions only — no browser, no React, no canvas.
 */
import { describe, expect, it } from "vitest";
import {
  contrastRatio,
  isContrastSufficient,
  formatContrastRatio,
  maxLogoSizePx,
  MAX_LOGO_COVERAGE,
  MIN_QR_CONTRAST,
  DEFAULT_QR_BRANDING,
} from "./qrBranding";

// ── contrastRatio ─────────────────────────────────────────────────────────────

describe("contrastRatio", () => {
  it("black on white = 21:1 (maximum contrast)", () => {
    const ratio = contrastRatio("#000000", "#ffffff");
    expect(ratio).toBeCloseTo(21, 0);
  });

  it("white on white = 1:1 (no contrast)", () => {
    const ratio = contrastRatio("#ffffff", "#ffffff");
    expect(ratio).toBeCloseTo(1, 1);
  });

  it("default branding (#111827 on #ffffff) has high contrast", () => {
    const ratio = contrastRatio(DEFAULT_QR_BRANDING.fgColor, DEFAULT_QR_BRANDING.bgColor);
    // #111827 is very dark — should be well above 3:1
    expect(ratio).toBeGreaterThan(10);
  });

  it("order of arguments doesn't matter (symmetric ratio)", () => {
    const r1 = contrastRatio("#111827", "#ffffff");
    const r2 = contrastRatio("#ffffff", "#111827");
    expect(r1).toBeCloseTo(r2, 5);
  });

  it("low-contrast pair (grey on white) returns ratio below MIN_QR_CONTRAST", () => {
    // #cccccc on #ffffff is well-known low contrast
    const ratio = contrastRatio("#cccccc", "#ffffff");
    expect(ratio).toBeLessThan(MIN_QR_CONTRAST);
  });

  it("handles 3-char hex gracefully (returns 0 luminance)", () => {
    // 3-char hex is not supported; should not crash
    expect(() => contrastRatio("#abc", "#ffffff")).not.toThrow();
  });
});

// ── isContrastSufficient ──────────────────────────────────────────────────────

describe("isContrastSufficient", () => {
  it("returns true for the default branding (high contrast)", () => {
    expect(isContrastSufficient(DEFAULT_QR_BRANDING)).toBe(true);
  });

  it("returns false for a low-contrast pair (#cccccc on #ffffff)", () => {
    const lowContrast = { ...DEFAULT_QR_BRANDING, fgColor: "#cccccc", bgColor: "#ffffff" };
    expect(isContrastSufficient(lowContrast)).toBe(false);
  });

  it("returns true for black on white", () => {
    const highContrast = { ...DEFAULT_QR_BRANDING, fgColor: "#000000", bgColor: "#ffffff" };
    expect(isContrastSufficient(highContrast)).toBe(true);
  });

  it("returns true for a dark blue on white (high contrast)", () => {
    const darkBlue = { ...DEFAULT_QR_BRANDING, fgColor: "#1d4ed8", bgColor: "#ffffff" };
    expect(isContrastSufficient(darkBlue)).toBe(true);
  });

  it("returns false when fg and bg are identical colors", () => {
    const sameColor = { ...DEFAULT_QR_BRANDING, fgColor: "#888888", bgColor: "#888888" };
    expect(isContrastSufficient(sameColor)).toBe(false);
  });
});

// ── formatContrastRatio ───────────────────────────────────────────────────────

describe("formatContrastRatio", () => {
  it("formats default branding as 'X.X:1'", () => {
    const result = formatContrastRatio(DEFAULT_QR_BRANDING);
    expect(result).toMatch(/^\d+\.\d+:1$/);
  });

  it("formats 21:1 (black on white) correctly", () => {
    const branding = { ...DEFAULT_QR_BRANDING, fgColor: "#000000", bgColor: "#ffffff" };
    const result = formatContrastRatio(branding);
    expect(result).toMatch(/21\.\d+:1/);
  });
});

// ── maxLogoSizePx ─────────────────────────────────────────────────────────────

describe("maxLogoSizePx", () => {
  it("for a 512px QR, logo side ≤ sqrt(MAX_LOGO_COVERAGE) × 512", () => {
    const maxSide = maxLogoSizePx(512);
    const expectedMax = Math.floor(512 * Math.sqrt(MAX_LOGO_COVERAGE));
    expect(maxSide).toBe(expectedMax);
  });

  it("for a 1024px QR, logo covers at most MAX_LOGO_COVERAGE of the area", () => {
    const side = maxLogoSizePx(1024);
    const coverage = (side * side) / (1024 * 1024);
    expect(coverage).toBeLessThanOrEqual(MAX_LOGO_COVERAGE);
  });

  it("for a 2048px QR, logo covers at most MAX_LOGO_COVERAGE of the area", () => {
    const side = maxLogoSizePx(2048);
    const coverage = (side * side) / (2048 * 2048);
    expect(coverage).toBeLessThanOrEqual(MAX_LOGO_COVERAGE);
  });

  it("returns a positive integer for any reasonable QR size", () => {
    expect(maxLogoSizePx(120)).toBeGreaterThan(0);
    expect(maxLogoSizePx(512)).toBeGreaterThan(0);
    expect(maxLogoSizePx(1024)).toBeGreaterThan(0);
    expect(maxLogoSizePx(2048)).toBeGreaterThan(0);
  });
});

// ── DEFAULT_QR_BRANDING ───────────────────────────────────────────────────────

describe("DEFAULT_QR_BRANDING", () => {
  it("has high contrast by default", () => {
    expect(isContrastSufficient(DEFAULT_QR_BRANDING)).toBe(true);
  });

  it("defaults to 1024px size", () => {
    expect(DEFAULT_QR_BRANDING.size).toBe(1024);
  });

  it("defaults to PNG format", () => {
    expect(DEFAULT_QR_BRANDING.format).toBe("png");
  });

  it("defaults to empty logo", () => {
    expect(DEFAULT_QR_BRANDING.logoDataUrl).toBe("");
  });
});
