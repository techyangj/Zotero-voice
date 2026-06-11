import { closeSync, existsSync, mkdirSync, openSync, writeFileSync } from "node:fs";
import { delimiter, dirname, resolve } from "node:path";
import { spawn } from "node:child_process";
import { platform } from "node:os";

const root = resolve(import.meta.dirname, "..");
const kokoroRoot = resolve(root, ".tts/Kokoro-FastAPI");
const logPath = resolve(root, ".tts/kokoro.log");
const pidPath = resolve(root, ".tts/kokoro.pid");
const uv = process.env.UV_BIN || "uv";
const isWindows = platform() === "win32";
const defaultDeviceType = platform() === "darwin" ? "mps" : "cpu";
const deviceType = process.env.KOKORO_DEVICE || defaultDeviceType;

if (!existsSync(kokoroRoot)) {
  throw new Error(`Kokoro-FastAPI not found at ${kokoroRoot}`);
}

mkdirSync(dirname(logPath), { recursive: true });

const env = {
  ...process.env,
  PYTHONUTF8: "1",
  USE_GPU: deviceType === "cpu" ? "false" : "true",
  USE_ONNX: "false",
  PYTHONPATH: [kokoroRoot, resolve(kokoroRoot, "api")].join(delimiter),
  MODEL_DIR: "src/models",
  VOICES_DIR: "src/voices/v1_0",
  WEB_PLAYER_PATH: `${kokoroRoot}/web`,
  DEVICE_TYPE: deviceType,
  PYTORCH_ENABLE_MPS_FALLBACK: "1",
  UV_LINK_MODE: "copy"
};

if (isWindows && !env.PHONEMIZER_ESPEAK_LIBRARY) {
  env.PHONEMIZER_ESPEAK_LIBRARY = "C:\\Program Files\\eSpeak NG\\libespeak-ng.dll";
}

const logFd = openSync(logPath, "a");

const child = spawn(
  uv,
  ["run", "--no-sync", "uvicorn", "api.src.main:app", "--host", "127.0.0.1", "--port", "8880"],
  {
    cwd: kokoroRoot,
    detached: true,
    env,
    stdio: ["ignore", logFd, logFd]
  }
);

writeFileSync(pidPath, `${child.pid}\n`);
child.unref();
closeSync(logFd);

console.log(`Kokoro started with PID ${child.pid}`);
console.log(`Log: ${logPath}`);
