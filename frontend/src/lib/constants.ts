import type { Duration, DateRange } from "../api/types";

export const LANGUAGES = [
  { value: "", label: "Any language" },
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "pt", label: "Portuguese" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
];

export const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  es: "Spanish",
  pt: "Portuguese",
  fr: "French",
  de: "German",
};

export const DURATIONS: { value: Duration | ""; label: string }[] = [
  { value: "", label: "Cualquiera" },
  { value: "short", label: "Corto (< 4 min)" },
  { value: "medium", label: "Medio (4–20 min)" },
  { value: "long", label: "Largo (> 20 min)" },
];

export const DATE_RANGES: { value: DateRange | ""; label: string }[] = [
  { value: "", label: "Any time" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "365d", label: "Last year" },
];
