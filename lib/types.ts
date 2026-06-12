export const UTM_FIELDS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

export type UtmField = (typeof UTM_FIELDS)[number];

export const REQUIRED_UTM_FIELDS: readonly UtmField[] = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
];

export interface UtmRow {
  id: string;
  baseUrl: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string;
  utm_content: string;
}

export interface LintSettings {
  /** Require utm_source, utm_medium, utm_campaign to be non-empty. */
  requiredParams: boolean;
  /** UTM values must be lowercase. */
  lowercaseOnly: boolean;
  /** UTM values must not contain spaces. */
  noSpaces: boolean;
}

export const DEFAULT_LINT_SETTINGS: LintSettings = {
  requiredParams: true,
  lowercaseOnly: true,
  noSpaces: true,
};

export interface Preset {
  id: string;
  name: string;
  values: Partial<Record<UtmField, string>>;
}

export function emptyRow(id: string): UtmRow {
  return {
    id,
    baseUrl: "",
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_term: "",
    utm_content: "",
  };
}

export const FIELD_LABELS: Record<UtmField | "baseUrl", string> = {
  baseUrl: "Base URL",
  utm_source: "utm_source",
  utm_medium: "utm_medium",
  utm_campaign: "utm_campaign",
  utm_term: "utm_term",
  utm_content: "utm_content",
};
