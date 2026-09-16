
const SETTINGS_KEY = 'mClick_settings_v9';
const ENABLED_KEY = 'isEnabled';

// Reads from sync storage first (so state follows a signed-in user across
// browsers) and falls back to the local cache if sync has nothing yet.
function mclickStorageGet(callback) {
  chrome.storage.sync.get([SETTINGS_KEY, ENABLED_KEY], (syncRes) => {
    if (!chrome.runtime.lastError && syncRes[ENABLED_KEY] !== undefined) {
      callback(syncRes);
      return;
    }
    chrome.storage.local.get([SETTINGS_KEY, ENABLED_KEY], (localRes) => {
      callback(localRes);
    });
  });
}

// Writes through to both areas: local always succeeds and acts as a fast,
// reliable cache; sync propagates the change to the user's other browsers
// when they're signed in (and simply no-ops/fails quietly otherwise).
function mclickStorageSet(obj, callback) {
  chrome.storage.local.set(obj, () => {});
  chrome.storage.sync.set(obj, () => {
    if (chrome.runtime.lastError) {
      console.warn('mClick: sync storage unavailable, saved locally only.', chrome.runtime.lastError.message);
    }
    if (callback) callback();
  });
}

// Helper to update the extension icon and badge based on status
function updateIcon(enabled) {
  const suffix = enabled ? "" : "_off";
  const badgeText = enabled ? "ON" : "OFF";
  const badgeColor = enabled ? "#4f46e5" : "#64748b";

  // Update Badge
  chrome.action.setBadgeText({ text: badgeText });
  chrome.action.setBadgeBackgroundColor({ color: badgeColor });

  // Update Icon
  chrome.action.setIcon({
    path: {
      "16": `icon16${suffix}.png`,
      "48": `icon48${suffix}.png`,
      "128": `icon128${suffix}.png`
    }
  }).catch(err => {
    // This will trigger if the icon files are missing from the root
    console.warn("Icon file swap failed. Ensure iconXX_off.png exist in root.", err);
  });
}

// Handle the global shortcut Ctrl+Shift+H
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-highlight') {
    toggleEnabledState();
  }
});

function toggleEnabledState() {
  mclickStorageGet(async (res) => {
    const currentState = res[ENABLED_KEY] !== undefined ? res[ENABLED_KEY] : true;
    const newState = !currentState;
    mclickStorageSet({ [ENABLED_KEY]: newState });
    updateIcon(newState);

    // Notify all tabs to toggle visibility immediately
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      try {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_VISIBILITY', enabled: newState });
        }
      } catch (e) {}
    }
  });
}

// Watch for storage changes to update the icon (handles popup/options toggles,
// and changes that arrive from sync after another device flips the switch)
chrome.storage.onChanged.addListener((changes) => {
  if (changes[ENABLED_KEY]) {
    updateIcon(changes[ENABLED_KEY].newValue);
  }
});

// Enable the extension only on a brand-new install. Updates must preserve the user's choice.
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    mclickStorageSet({ [ENABLED_KEY]: true });
  }

  mclickStorageGet((res) => {
    updateIcon(res[ENABLED_KEY] !== undefined ? res[ENABLED_KEY] : true);
  });
});

// Sync icon on startup based on last saved state
mclickStorageGet((res) => {
  updateIcon(res[ENABLED_KEY] !== undefined ? res[ENABLED_KEY] : true);
});
