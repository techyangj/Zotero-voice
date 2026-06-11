export function extractSelectedText(event: ReaderInjectEvent): string {
  const params = event.params;
  const candidates = [
    readPath(params, ["annotation", "text"]),
    readPath(params, ["text"]),
    readPath(params, ["selectedText"]),
    readPath(params, ["selectionText"]),
    readPath(params, ["selection", "text"]),
    readSelectionObject(params),
    readWindowSelection(event.reader?._iframeWindow),
    readWindowSelection(event.doc.defaultView)
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate;
    }
  }

  return "";
}

function readPath(value: unknown, path: string[]): unknown {
  let current = value;

  for (const part of path) {
    if (!isRecord(current)) {
      return undefined;
    }

    current = current[part];
  }

  return current;
}

function readSelectionObject(value: unknown): string | undefined {
  const selection = readPath(value, ["selection"]);
  if (!selection || typeof selection !== "object") {
    return undefined;
  }

  try {
    const text = String(selection);
    return text === "[object Object]" ? undefined : text;
  }
  catch {
    return undefined;
  }
}

function readWindowSelection(win: Window | null | undefined): string | undefined {
  try {
    return win?.getSelection?.()?.toString();
  }
  catch {
    return undefined;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
