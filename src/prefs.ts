import { DEFAULT_PREFS, PREF_KEYS } from "./constants";

export interface ZoteroPronouncePrefs {
  endpoint: string;
  model: string;
  voice: string;
  responseFormat: string;
  speed: number;
  maxTextLength: number;
  autoplay: boolean;
  debug: boolean;
}

export function getPrefs(): ZoteroPronouncePrefs {
  return {
    endpoint: readStringPref(PREF_KEYS.endpoint, DEFAULT_PREFS.endpoint),
    model: readStringPref(PREF_KEYS.model, DEFAULT_PREFS.model),
    voice: readStringPref(PREF_KEYS.voice, DEFAULT_PREFS.voice),
    responseFormat: readStringPref(PREF_KEYS.responseFormat, DEFAULT_PREFS.responseFormat),
    speed: readNumberPref(PREF_KEYS.speed, DEFAULT_PREFS.speed, { min: 0.25, max: 4 }),
    maxTextLength: Math.floor(readNumberPref(PREF_KEYS.maxTextLength, DEFAULT_PREFS.maxTextLength, { min: 1, max: 5000 })),
    autoplay: readBooleanPref(PREF_KEYS.autoplay, DEFAULT_PREFS.autoplay),
    debug: readBooleanPref(PREF_KEYS.debug, DEFAULT_PREFS.debug)
  };
}

function readStringPref(key: string, fallback: string): string {
  const value = readPref(key);
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed || fallback;
}

function readNumberPref(key: string, fallback: number, range: { min: number; max: number }): number {
  const value = readPref(key);
  const numeric = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numeric)) {
    return fallback;
  }

  return Math.min(range.max, Math.max(range.min, numeric));
}

function readBooleanPref(key: string, fallback: boolean): boolean {
  const value = readPref(key);
  return typeof value === "boolean" ? value : fallback;
}

function readPref(key: string): unknown {
  try {
    return Zotero.Prefs?.get(key, true);
  }
  catch (error) {
    Zotero.logError?.(error);
    return undefined;
  }
}
