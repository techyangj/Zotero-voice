import type { ZoteroPronouncePrefs } from "./prefs";

let activeAudio: HTMLAudioElement | null = null;

export type PlaybackResult = "playing" | "manual";

export interface SpeechAudio {
  buffer: ArrayBuffer;
  mimeType: string;
}

export async function requestSpeech(text: string, prefs: ZoteroPronouncePrefs): Promise<SpeechAudio> {
  let response: Response;

  try {
    response = await fetch(prefs.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: prefs.model,
        input: text,
        voice: prefs.voice,
        response_format: prefs.responseFormat,
        speed: prefs.speed
      })
    });
  }
  catch (error) {
    Zotero.logError?.(error);
    throw new Error(`无法连接 TTS endpoint：${prefs.endpoint}`);
  }

  if (!response.ok) {
    throw new Error(`TTS 返回错误：${response.status} ${response.statusText || ""}`.trim());
  }

  return {
    buffer: await response.arrayBuffer(),
    mimeType: mimeTypeForFormat(prefs.responseFormat)
  };
}

export async function playSpeech(audioData: SpeechAudio, doc: Document): Promise<PlaybackResult> {
  stopActiveAudio();

  const audio = doc.createElement("audio");
  const src = `data:${audioData.mimeType};base64,${arrayBufferToBase64(audioData.buffer)}`;

  activeAudio = audio;

  audio.preload = "auto";
  audio.src = src;
  audio.style.display = "none";

  const cleanup = () => {
    if (activeAudio === audio) {
      stopActiveAudio();
    }
    else {
      audio.remove();
    }
  };

  audio.addEventListener("ended", cleanup, { once: true });
  audio.addEventListener("error", cleanup, { once: true });
  doc.body.appendChild(audio);

  try {
    await audio.play();
    return "playing";
  }
  catch (error) {
    Zotero.logError?.(error);
    showManualAudioControl(audio);
    return "manual";
  }
}

export function stopActiveAudio(): void {
  activeAudio?.pause();
  activeAudio?.remove();

  activeAudio = null;
}

function mimeTypeForFormat(format: string): string {
  switch (format.toLowerCase()) {
    case "wav":
      return "audio/wav";
    case "ogg":
      return "audio/ogg";
    case "flac":
      return "audio/flac";
    case "aac":
      return "audio/aac";
    case "opus":
      return "audio/opus";
    case "mp3":
    default:
      return "audio/mpeg";
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    let chunkString = "";

    for (let j = 0; j < chunk.length; j++) {
      chunkString += String.fromCharCode(chunk[j]);
    }

    binary += chunkString;
  }

  return btoa(binary);
}

function showManualAudioControl(audio: HTMLAudioElement): void {
  audio.controls = true;
  audio.style.background = "#fff";
  audio.style.border = "1px solid rgba(0, 0, 0, 0.18)";
  audio.style.borderRadius = "6px";
  audio.style.boxShadow = "0 6px 18px rgba(0, 0, 0, 0.18)";
  audio.style.display = "block";
  audio.style.height = "38px";
  audio.style.maxWidth = "min(320px, calc(100vw - 32px))";
  audio.style.position = "fixed";
  audio.style.right = "16px";
  audio.style.bottom = "16px";
  audio.style.width = "300px";
  audio.style.zIndex = "2147483647";
  audio.load();
}
