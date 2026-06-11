declare const Zotero: {
  Reader?: {
    registerEventListener(type: string, handler: (event: ReaderInjectEvent) => void, pluginID: string): void;
    unregisterEventListener(type: string, handler: (event: ReaderInjectEvent) => void): void;
  };
  Prefs?: {
    get(pref: string, global?: boolean): unknown;
  };
  debug?(message: string): void;
  logError?(error: unknown): void;
};

interface ReaderLike {
  _iframeWindow?: Window;
}

interface ReaderInjectEvent {
  reader?: ReaderLike;
  doc: Document;
  params?: unknown;
  append(node: Node): void;
}

interface ZoteroBootstrapData {
  id: string;
  version: string;
  rootURI: string;
}
