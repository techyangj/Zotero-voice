import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const pidPath = resolve(root, ".tts/kokoro.pid");

if (!existsSync(pidPath)) {
  console.log("No Kokoro PID file found.");
  process.exit(0);
}

const pid = Number(readFileSync(pidPath, "utf8").trim());

if (!Number.isInteger(pid) || pid <= 0) {
  throw new Error(`Invalid PID in ${pidPath}`);
}

try {
  process.kill(pid, "SIGTERM");
  console.log(`Stopped Kokoro PID ${pid}`);
}
catch (error) {
  if (error && typeof error === "object" && "code" in error && error.code === "ESRCH") {
    console.log(`Kokoro PID ${pid} is not running.`);
  }
  else {
    throw error;
  }
}
finally {
  rmSync(pidPath, { force: true });
}
