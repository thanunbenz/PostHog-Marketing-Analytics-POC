import { UTM_KEYS, type UtmParams } from "./events";

// First-touch attribution (PRD §3 step 4, recommended model in §10).
// Read UTMs from the URL on first landing, store them, and keep crediting the
// FIRST source even if the user signs up / pays days later.

const STORAGE_KEY = "deeprun_first_touch_utm";

export function readUtmFromUrl(search: string): UtmParams {
  const params = new URLSearchParams(search);
  const utm: UtmParams = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) utm[key] = value;
  }
  return utm;
}

// Returns the persisted first-touch attribution, capturing it on the first
// landing that carries UTMs. Once set, it is never overwritten.
export function captureFirstTouch(search: string): UtmParams {
  if (typeof window === "undefined") return {};
  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing) return JSON.parse(existing) as UtmParams;

  const fromUrl = readUtmFromUrl(search);
  if (Object.keys(fromUrl).length > 0) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fromUrl));
    return fromUrl;
  }
  return {};
}

export function getFirstTouch(): UtmParams {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as UtmParams) : {};
}

export function clearFirstTouch(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
