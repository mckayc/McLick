
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

async function toggleEnabledState() {
  const result = await chrome.storage.local.get(['isEnabled']);
  const currentState = result.isEnabled !== undefined ? result.isEnabled : true;
  const newState = !currentState;
  await chrome.storage.local.set({ isEnabled: newState });
  
  // Notify all tabs to toggle visibility immediately
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    try {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_VISIBILITY', enabled: newState });
      }
    } catch (e) {}
  }
}

// Watch for storage changes to update the icon (handles popup toggles)
chrome.storage.onChanged.addListener((changes) => {
  if (changes.isEnabled) {
    updateIcon(changes.isEnabled.newValue);
  }
});

// Set default state and icon on installation/startup
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ isEnabled: true });
  updateIcon(true);
});

// Sync icon on startup based on last saved state
chrome.storage.local.get(['isEnabled'], (res) => {
  updateIcon(res.isEnabled !== undefined ? res.isEnabled : true);
});
