/* global APP_SHUTDOWN, Services, Zotero */

var ZoteroPronounce;
var ZoteroPronouncePreferencePane;

function install() {}

function uninstall() {}

function startup(data) {
  Services.scriptloader.loadSubScript(data.rootURI + "build/index.js");

  ZoteroPronounce.startup(data);

  if (Zotero.PreferencePanes?.register) {
    ZoteroPronouncePreferencePane = Zotero.PreferencePanes.register({
      pluginID: data.id,
      src: data.rootURI + "chrome/content/preferences.xhtml",
      stylesheets: [data.rootURI + "chrome/content/preferences.css"]
    });
  }
}

function shutdown(data, reason) {
  if (reason === APP_SHUTDOWN) {
    return;
  }

  try {
    ZoteroPronounce?.shutdown();
  }
  finally {
    ZoteroPronouncePreferencePane?.unregister?.();
    ZoteroPronouncePreferencePane = null;
    ZoteroPronounce = undefined;
  }
}
