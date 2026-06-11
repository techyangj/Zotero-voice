import { closeSync, existsSync, mkdirSync, openSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawn } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const kokoroRoot = resolve(root, ".tts/Kokoro-FastAPI");
const logPath = resolve(root, ".tts/kokoro.log");
const pidPath = resolve(root, ".tts/kokoro.pid");
const uv = process.env.UV_BIN || "uv";
const deviceType = process.env.KOKORO_DEVICE || "mps";

if (!existsSync(kokoroRoot)) {
  throw new Error(`Kokoro-FastAPI not found at ${kokoroRoot}`);
}

mkdirSync(dirname(logPath), { recursive: true });

const env = {
  ...process.env,
  USE_GPU: deviceType === "cpu" ? "false" : "true",
  USE_ONNX: "false",
  PYTHONPATH: `${kokoroRoot}:${kokoroRoot}/api`,
  MODEL_DIR: "src/models",
  VOICES_DIR: "src/voices/v1_0",
  WEB_PLAYER_PATH: `${kokoroRoot}/web`,
  DEVICE_TYPE: deviceType,
  PYTORCH_ENABLE_MPS_FALLBACK: "1",
  UV_LINK_MODE: "copy"
};

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
