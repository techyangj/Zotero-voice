export const PLUGIN_ID = "zoteropronounce@codex.dev";

export const READER_EVENT_TYPE = "renderTextSelectionPopup";

export const PREF_KEYS = {
  endpoint: "extensions.zotero-pronounce.endpoint",
  model: "extensions.zotero-pronounce.model",
  voice: "extensions.zotero-pronounce.voice",
  responseFormat: "extensions.zotero-pronounce.response_format",
  speed: "extensions.zotero-pronounce.speed",
  maxTextLength: "extensions.zotero-pronounce.max_text_length",
  autoplay: "extensions.zotero-pronounce.autoplay",
  debug: "extensions.zotero-pronounce.debug"
} as const;

export const DEFAULT_PREFS = {
  endpoint: "http://127.0.0.1:8880/v1/audio/speech",
  model: "kokoro",
  voice: "af_bella",
  responseFormat: "mp3",
  speed: 1.0,
  maxTextLength: 300,
  autoplay: false,
  debug: false
} as const;
