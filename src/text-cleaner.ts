import { DEFAULT_PREFS } from "./constants";

const YEAR = String.raw`(?:18|19|20)\d{2}[a-z]?`;
const AUTHOR_YEAR_HINT = String.raw`(?:[,;]|et\s+al\.?|&|\band\b)`;
const NUMERIC_CITATION = String.raw`\d+\s*(?:(?:[-–,;])\s*\d+\s*)*`;
const CITATION_MAX_LENGTH = 240;

export function cleanSelectedText(input: string, maxTextLength: number = DEFAULT_PREFS.maxTextLength): string {
  if (!input) {
    return "";
  }

  let text = input;

  text = text.replace(/\u00ad/g, "");
  text = text.replace(/-\s*\r?\n\s*/g, "");
  text = text.replace(/\s*\r?\n\s*/g, " ");
  text = removeCitationMarkers(text);
  text = normalizeSpacing(text);

  if (maxTextLength > 0 && text.length > maxTextLength) {
    text = text.slice(0, maxTextLength).trim();
  }

  return text;
}

function removeCitationMarkers(input: string): string {
  let text = input;

  text = text.replace(new RegExp(String.raw`\s*\((?=[^()]{0,${CITATION_MAX_LENGTH}}\b${YEAR}\b)(?=[^()]{0,${CITATION_MAX_LENGTH}}${AUTHOR_YEAR_HINT})[^()]{1,${CITATION_MAX_LENGTH}}\)`, "gi"), "");
  text = text.replace(new RegExp(String.raw`\s*\[(?=[^\[\]]{0,${CITATION_MAX_LENGTH}}\b${YEAR}\b)(?=[^\[\]]{0,${CITATION_MAX_LENGTH}}${AUTHOR_YEAR_HINT})[^\[\]]{1,${CITATION_MAX_LENGTH}}\]`, "gi"), "");
  text = text.replace(new RegExp(String.raw`\s*\(\s*${YEAR}(?:\s*[;,]\s*${YEAR})*\s*\)`, "gi"), "");
  text = text.replace(new RegExp(String.raw`\s*\[\s*${NUMERIC_CITATION}\]`, "g"), "");
  text = text.replace(new RegExp(String.raw`\s*\(\s*${NUMERIC_CITATION}\)`, "g"), "");
  text = text.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, "");

  return text;
}

function normalizeSpacing(input: string): string {
  return input
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/,\s*([,.;:!?])/g, "$1")
    .replace(/\(\s+\)/g, "")
    .trim();
}
