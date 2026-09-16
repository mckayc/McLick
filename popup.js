document.addEventListener('DOMContentLoaded', () => {
  const SETTINGS_KEY = 'mClick_settings_v9';
  const LEGACY_SETTINGS_KEY = 'mClick_settings_v8';
  const ENABLED_KEY = 'isEnabled';
  const CUSTOM_PRESETS_KEY = 'mClick_customPresets_v1';
  const BUILTIN_OVERRIDES_KEY = 'mClick_builtinOverrides_v1';

  const DEFAULT_SETTINGS = {
    size: 60, color: '#fde047', opacity: 0.4, rayIntensity: 5, ghostingIntensity: 0,
    showModifierKeys: true, showLastKey: true,
    leftColor: '#22c55e', leftRippleThickness: 3, leftRippleExpansion: 1.1,
    rightColor: '#ef4444', rightRippleThickness: 3, rightRippleExpansion: 1.2,
    middleColor: '#a855f7', middleRippleThickness: 2, middleRippleExpansion: 1.05,
    enableLeftClick: true, enableRightClick: true, enableMiddleClick: true,
    spotlightMode: false, spotlightRadius: 150, spotlightOpacity: 0.6,
    autoHideEnabled: false, autoHideDelay: 3,
    showScrollIndicator: true,
    laserEnabled: true, laserColor: '#ef4444', laserSize: 9,
    magnifierEnabled: true, magnifierZoom: 2.5, magnifierSize: 180,
  };

  // Keep these in sync with the definitions in options.js.
  const BUILTIN_PRESETS = {
    default: { label: 'Default', settings: { ...DEFAULT_SETTINGS } },
    screencast: { label: 'Screencast', settings: { ...DEFAULT_SETTINGS, size: 80, opacity: 0.45, rayIntensity: 10, ghostingIntensity: 0.35 } },
    teaching: { label: 'Teaching', settings: { ...DEFAULT_SETTINGS, size: 50, opacity: 0.6, rayIntensity: 15, spotlightMode: true, spotlightRadius: 200, spotlightOpacity: 0.7 } },
    minimal: { label: 'Minimal', settings: { ...DEFAULT_SETTINGS, size: 36, opacity: 0.25, rayIntensity: 0, showModifierKeys: false, showLastKey: false, showScrollIndicator: false, autoHideEnabled: true, autoHideDelay: 2 } }
  };

  function mclickStorageGet(callback) {
    chrome.storage.sync.get([SETTINGS_KEY, ENABLED_KEY], (syncRes) => {
      if (!chrome.runtime.lastError && syncRes[SETTINGS_KEY] !== undefined) {
        callback(syncRes);
        return;
      }
      chrome.storage.local.get([SETTINGS_KEY, ENABLED_KEY, LEGACY_SETTINGS_KEY], (localRes) => {
        if (localRes[SETTINGS_KEY] === undefined && localRes[LEGACY_SETTINGS_KEY]) {
          localRes[SETTINGS_KEY] = localRes[LEGACY_SETTINGS_KEY];
        }
        callback(localRes);
      });
    });
  }

  function mclickStorageSet(obj) {
    chrome.storage.local.set(obj, () => {});
    chrome.storage.sync.set(obj, () => {
      if (chrome.runtime.lastError) {
        console.warn('mClick: sync storage unavailable, saved locally only.', chrome.runtime.lastError.message);
      }
    });
  }

  function mclickPresetsGet(callback) {
    chrome.storage.sync.get([CUSTOM_PRESETS_KEY], (syncRes) => {
      if (!chrome.runtime.lastError && syncRes[CUSTOM_PRESETS_KEY] !== undefined) {
        callback(syncRes[CUSTOM_PRESETS_KEY]);
        return;
      }
      chrome.storage.local.get([CUSTOM_PRESETS_KEY], (localRes) => {
        callback(localRes[CUSTOM_PRESETS_KEY] || []);
      });
    });
  }

  function mclickBuiltinOverridesGet(callback) {
    chrome.storage.sync.get([BUILTIN_OVERRIDES_KEY], (syncRes) => {
      if (!chrome.runtime.lastError && syncRes[BUILTIN_OVERRIDES_KEY] !== undefined) {
        callback(syncRes[BUILTIN_OVERRIDES_KEY]);
        return;
      }
      chrome.storage.local.get([BUILTIN_OVERRIDES_KEY], (localRes) => {
        callback(localRes[BUILTIN_OVERRIDES_KEY] || {});
      });
    });
  }

  let currentSettings = { ...DEFAULT_SETTINGS };
  let customPresets = [];
  let builtinOverrides = {};
  let statusFlashTimeout = null;

  function allPresetEntries() {
    const builtins = Object.entries(BUILTIN_PRESETS).map(([key, p]) => ({
      domKey: 'builtin:' + key, label: p.label,
      settings: builtinOverrides[key] ? { ...DEFAULT_SETTINGS, ...builtinOverrides[key] } : p.settings
    }));
    const customs = customPresets.map(p => ({
      domKey: 'custom:' + p.id, label: p.name, settings: p.settings
    }));
    return [...builtins, ...customs];
  }

  function matchesEntry(entry) {
    return Object.keys(entry.settings).every(k => entry.settings[k] === currentSettings[k]);
  }

  // Sticks with whichever preset was actually applied so two presets that
  // happen to hold identical settings don't both light up at once.
  let activePresetKey = null;

  function updateActivePresetHighlight() {
    const entries = allPresetEntries();
    let matched = entries.find(e => e.domKey === activePresetKey && matchesEntry(e)) || null;
    if (!matched) matched = entries.find(e => matchesEntry(e)) || null;
    activePresetKey = matched ? matched.domKey : null;

    document.querySelectorAll('.preset-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.key === activePresetKey);
    });
    if (statusFlashTimeout) return;
    const statusEl = document.getElementById('presetStatus');
    statusEl.classList.remove('applied');
    statusEl.textContent = matched ? '' : 'Custom configuration';
  }

  function flashPresetStatus(label) {
    const statusEl = document.getElementById('presetStatus');
    statusEl.classList.add('applied');
    statusEl.textContent = `✓ ${label} applied`;
    clearTimeout(statusFlashTimeout);
    statusFlashTimeout = setTimeout(() => {
      statusFlashTimeout = null;
      updateActivePresetHighlight();
    }, 1500);
  }

  const presetGrid = document.getElementById('presetGrid');

  function renderPresets() {
    presetGrid.innerHTML = '';
    allPresetEntries().forEach(entry => {
      const chip = document.createElement('button');
      chip.className = 'preset-chip';
      chip.dataset.key = entry.domKey;
      chip.textContent = entry.label;
      chip.addEventListener('click', () => {
        currentSettings = { ...DEFAULT_SETTINGS, ...entry.settings };
        mclickStorageSet({ [SETTINGS_KEY]: currentSettings });
        activePresetKey = entry.domKey;
        updateActivePresetHighlight();
        flashPresetStatus(entry.label);
        chip.classList.remove('just-applied');
        void chip.offsetWidth;
        chip.classList.add('just-applied');
        chip.addEventListener('animationend', () => chip.classList.remove('just-applied'), { once: true });
      });
      presetGrid.appendChild(chip);
    });
    updateActivePresetHighlight();
  }

  mclickStorageGet((res) => {
    if (res[SETTINGS_KEY]) currentSettings = { ...DEFAULT_SETTINGS, ...res[SETTINGS_KEY] };
    const isEnabled = res[ENABLED_KEY] !== undefined ? res[ENABLED_KEY] : true;
    document.getElementById('isEnabled').checked = isEnabled;
    document.getElementById('statusText').innerText = isEnabled ? 'Active' : 'Paused';
    updateActivePresetHighlight();
  });

  mclickPresetsGet((list) => {
    customPresets = list;
    renderPresets();
  });

  mclickBuiltinOverridesGet((overrides) => {
    builtinOverrides = overrides;
    renderPresets();
  });

  document.getElementById('isEnabled').addEventListener('input', (e) => {
    const isEnabled = e.target.checked;
    document.getElementById('statusText').innerText = isEnabled ? 'Active' : 'Paused';
    mclickStorageSet({ [ENABLED_KEY]: isEnabled });
  });

  document.getElementById('openOptions').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
});
