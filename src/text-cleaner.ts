import { DEFAULT_PREFS } from "./constants";

export function cleanSelectedText(input: string, maxTextLength: number = DEFAULT_PREFS.maxTextLength): string {
  if (!input) {
    return "";
  }

  let text = input;

  text = text.replace(/\u00ad/g, "");
  text = text.replace(/-\s*\r?\n\s*/g, "");
  text = text.replace(/\s*\r?\n\s*/g, " ");
  text = text.replace(/\s+/g, " ").trim();

  if (maxTextLength > 0 && text.length > maxTextLength) {
    text = text.slice(0, maxTextLength).trim();
  }

  return text;
}
