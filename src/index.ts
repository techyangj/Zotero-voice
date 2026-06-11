import { PLUGIN_ID } from "./constants";
import { registerReaderButton, unregisterReaderButton } from "./reader";

let activePluginID = PLUGIN_ID;

export function startup(data: ZoteroBootstrapData): void {
  activePluginID = data.id || PLUGIN_ID;

  try {
    registerReaderButton(activePluginID);
    Zotero.debug?.(`[Zotero Pronounce] Started ${data.version}`);
  }
  catch (error) {
    Zotero.logError?.(error);
  }
}

export function shutdown(): void {
  unregisterReaderButton();
  Zotero.debug?.("[Zotero Pronounce] Stopped");
}
