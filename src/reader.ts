import { READER_EVENT_TYPE } from "./constants";
import { getPrefs } from "./prefs";
import { extractSelectedText } from "./selection";
import { cleanSelectedText } from "./text-cleaner";
import { playSpeech, requestSpeech, stopActiveAudio } from "./tts";

let handler: ((event: ReaderInjectEvent) => void) | null = null;

export function registerReaderButton(pluginID: string): void {
  if (!Zotero.Reader?.registerEventListener) {
    throw new Error("Zotero Reader API is unavailable.");
  }

  unregisterReaderButton();

  handler = (event) => {
    renderPronounceButton(event);
  };

  Zotero.Reader.registerEventListener(READER_EVENT_TYPE, handler, pluginID);
}

export function unregisterReaderButton(): void {
  if (handler && Zotero.Reader?.unregisterEventListener) {
    Zotero.Reader.unregisterEventListener(READER_EVENT_TYPE, handler);
  }

  handler = null;
  stopActiveAudio();
}

function renderPronounceButton(event: ReaderInjectEvent): void {
  const prefs = getPrefs();

  if (prefs.debug) {
    Zotero.debug?.(`[Zotero Pronounce] ${READER_EVENT_TYPE} params: ${safeJson(event.params)}`);
  }

  const button = event.doc.createElement("button");
  button.type = "button";
  button.className = "zotero-pronounce-button";
  button.textContent = "发音";
  button.title = "Pronounce selected text";
  button.style.marginLeft = "6px";
  button.style.minWidth = "42px";
  button.style.cursor = "pointer";

  button.addEventListener("click", () => {
    void pronounceSelection(event, button);
  });

  event.append(button);

  if (prefs.autoplay) {
    void pronounceSelection(event, button);
  }
}

async function pronounceSelection(event: ReaderInjectEvent, button: HTMLButtonElement): Promise<void> {
  const prefs = getPrefs();
  const rawText = extractSelectedText(event);
  const cleanedText = cleanSelectedText(rawText, prefs.maxTextLength);

  if (!cleanedText) {
    showError(event.doc, "没有找到选中文本。");
    return;
  }

  setButtonState(button, "发音中", true);

  try {
    const audioData = await requestSpeech(cleanedText, prefs);
    const playbackResult = await playSpeech(audioData, event.doc);
    if (playbackResult === "manual") {
      setButtonState(button, "手动播放", false);
      showNotice(event.doc, "自动播放被 Zotero 阻止了，请点击右下角的音频控件。");
      event.doc.defaultView?.setTimeout(() => setButtonState(button, "发音", false), 1600);
      return;
    }

    setButtonState(button, "已播放", false);
    event.doc.defaultView?.setTimeout(() => setButtonState(button, "发音", false), 900);
  }
  catch (error) {
    Zotero.logError?.(error);
    setButtonState(button, "失败", false);
    showError(event.doc, humanizeError(error));
    event.doc.defaultView?.setTimeout(() => setButtonState(button, "发音", false), 1200);
  }
}

function setButtonState(button: HTMLButtonElement, label: string, disabled: boolean): void {
  button.textContent = label;
  button.disabled = disabled;
  button.style.opacity = disabled ? "0.65" : "1";
}

function showError(doc: Document, message: string): void {
  try {
    doc.defaultView?.alert(`Zotero Pronounce\n\n${message}`);
  }
  catch {
    Zotero.debug?.(`[Zotero Pronounce] ${message}`);
  }
}

function showNotice(doc: Document, message: string): void {
  try {
    doc.defaultView?.alert(`Zotero Pronounce\n\n${message}`);
  }
  catch {
    Zotero.debug?.(`[Zotero Pronounce] ${message}`);
  }
}

function humanizeError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (error && typeof error === "object") {
    const name = "name" in error && typeof error.name === "string" ? error.name : "";
    const message = "message" in error && typeof error.message === "string" ? error.message : "";
    const combined = [name, message].filter(Boolean).join(": ");
    if (combined) {
      return combined;
    }
  }

  return "发音失败，请检查本地 TTS 服务。";
}

function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value);
  }
  catch {
    return String(value);
  }
}
