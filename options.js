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

  const BUILTIN_PRESETS = {
    default: { label: 'Default', hint: 'Balanced, all-purpose look', settings: { ...DEFAULT_SETTINGS } },
    screencast: {
      label: 'Screencast', hint: 'Bigger glow with a soft trail',
      settings: { ...DEFAULT_SETTINGS, size: 80, opacity: 0.45, rayIntensity: 10, ghostingIntensity: 0.35 }
    },
    teaching: {
      label: 'Teaching', hint: 'Spotlight pulls focus to the cursor',
      settings: { ...DEFAULT_SETTINGS, size: 50, opacity: 0.6, rayIntensity: 15, spotlightMode: true, spotlightRadius: 200, spotlightOpacity: 0.7 }
    },
    minimal: {
      label: 'Minimal', hint: 'Subtle, fades out when idle',
      settings: { ...DEFAULT_SETTINGS, size: 36, opacity: 0.25, rayIntensity: 0, showModifierKeys: false, showLastKey: false, showScrollIndicator: false, autoHideEnabled: true, autoHideDelay: 2 }
    }
  };

  // Reads from sync storage first (so settings follow a signed-in user across
  // browsers) and falls back to the local cache, migrating the legacy v8 key
  // if that's all a fresh local profile has.
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

  function mclickStorageSet(obj, callback) {
    chrome.storage.local.set(obj, () => {});
    chrome.storage.sync.set(obj, () => {
      if (chrome.runtime.lastError) {
        console.warn('mClick: sync storage unavailable, saved locally only.', chrome.runtime.lastError.message);
      }
      if (callback) callback();
    });
  }

  // Custom presets sync the same way as settings: sync-preferred read, dual write.
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

  function mclickPresetsSet(list) {
    chrome.storage.local.set({ [CUSTOM_PRESETS_KEY]: list });
    chrome.storage.sync.set({ [CUSTOM_PRESETS_KEY]: list }, () => {
      if (chrome.runtime.lastError) {
        console.warn('mClick: custom preset sync failed, saved locally only.', chrome.runtime.lastError.message);
      }
    });
  }

  // Built-in presets can be edited in place (any change made while one is
  // active is saved back into it); the edit is stored as a full-settings
  // override keyed by the built-in's id, layered on top of the factory
  // BUILTIN_PRESETS values so it can always be reset back to factory.
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

  function mclickBuiltinOverridesSet(overrides) {
    chrome.storage.local.set({ [BUILTIN_OVERRIDES_KEY]: overrides });
    chrome.storage.sync.set({ [BUILTIN_OVERRIDES_KEY]: overrides }, () => {
      if (chrome.runtime.lastError) {
        console.warn('mClick: built-in preset sync failed, saved locally only.', chrome.runtime.lastError.message);
      }
    });
  }

  let currentSettings = { ...DEFAULT_SETTINGS };
  let customPresets = []; // [{ id, name, settings }]
  let builtinOverrides = {}; // { [builtinKey]: fullSettingsSnapshot }
  let saveTimeout = null;
  let presetSaveTimeout = null;
  let statusFlashTimeout = null;

  function effectiveBuiltinSettings(key) {
    return builtinOverrides[key] ? { ...DEFAULT_SETTINGS, ...builtinOverrides[key] } : BUILTIN_PRESETS[key].settings;
  }

  // Unified view over built-in + custom presets, so matching/highlighting/applying
  // doesn't need to special-case which kind of preset it's looking at.
  function allPresetEntries() {
    const builtins = Object.entries(BUILTIN_PRESETS).map(([key, p]) => ({
      domKey: 'builtin:' + key, label: p.label, hint: p.hint, settings: effectiveBuiltinSettings(key),
      custom: false, builtinKey: key, edited: !!builtinOverrides[key]
    }));
    const customs = customPresets.map(p => ({
      domKey: 'custom:' + p.id, label: p.name, hint: 'Custom preset', settings: p.settings, custom: true, id: p.id
    }));
    return [...builtins, ...customs];
  }

  // Any change made while a preset is active gets saved back into that
  // preset, so "editing a default profile" just works instead of silently
  // falling off into an unsaved "Custom configuration" state.
  function persistActivePresetEdits(immediate) {
    if (!activePresetKey) return;
    if (activePresetKey.startsWith('builtin:')) {
      const key = activePresetKey.slice('builtin:'.length);
      builtinOverrides[key] = { ...currentSettings };
      clearTimeout(presetSaveTimeout);
      const write = () => mclickBuiltinOverridesSet(builtinOverrides);
      if (immediate) write(); else presetSaveTimeout = setTimeout(write, 150);
    } else if (activePresetKey.startsWith('custom:')) {
      const id = activePresetKey.slice('custom:'.length);
      const preset = customPresets.find(p => p.id === id);
      if (!preset) return;
      preset.settings = { ...currentSettings };
      clearTimeout(presetSaveTimeout);
      const write = () => mclickPresetsSet(customPresets);
      if (immediate) write(); else presetSaveTimeout = setTimeout(write, 150);
    }
  }

  function updateUI(settings) {
    Object.keys(settings).forEach(key => {
      const el = document.getElementById(key);
      if (!el) return;

      if (el.type === 'checkbox') {
        el.checked = settings[key];
      } else {
        el.value = settings[key];
      }

      const valLabel = document.getElementById('val' + key.charAt(0).toUpperCase() + key.slice(1));
      if (valLabel) {
        if (key === 'opacity' || key === 'ghostingIntensity' || key === 'spotlightOpacity') {
          valLabel.innerText = Math.round(settings[key] * 100) + '%';
        } else if (key === 'size' || key === 'spotlightRadius' || key === 'laserSize' || key === 'magnifierSize') {
          valLabel.innerText = settings[key] + 'px';
        } else if (key === 'autoHideDelay') {
          valLabel.innerText = settings[key] + 's';
        } else if (key === 'magnifierZoom') {
          valLabel.innerText = settings[key] + 'x';
        } else {
          valLabel.innerText = settings[key];
        }
      }
    });
    updateActivePresetHighlight();
  }

  function matchesEntry(entry) {
    return Object.keys(entry.settings).every(k => entry.settings[k] === currentSettings[k]);
  }

  // Tracks which single preset is considered "active", so two presets that
  // happen to hold identical settings never both light up at once — we stick
  // with whichever one was actually applied/saved until it stops matching.
  let activePresetKey = null;

  function updateActivePresetHighlight() {
    const entries = allPresetEntries();
    let matched = entries.find(e => e.domKey === activePresetKey && matchesEntry(e)) || null;
    if (!matched) {
      matched = entries.find(e => matchesEntry(e)) || null;
    }
    activePresetKey = matched ? matched.domKey : null;

    document.querySelectorAll('.preset-btn[data-key]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.key === activePresetKey);
    });

    // Don't stomp on a just-applied flash message with the idle status.
    if (statusFlashTimeout) return;

    const statusEl = document.getElementById('presetStatus');
    statusEl.classList.remove('applied');
    statusEl.textContent = matched
      ? `Currently using the "${matched.label}" preset${matched.edited ? ' (edited)' : ''}. Changes save into it automatically.`
      : 'Custom configuration — doesn\'t match any saved preset.';
  }

  function flashPresetStatus(label) {
    const statusEl = document.getElementById('presetStatus');
    statusEl.classList.add('applied');
    statusEl.textContent = `✓ Applied "${label}" preset.`;
    clearTimeout(statusFlashTimeout);
    statusFlashTimeout = setTimeout(() => {
      statusFlashTimeout = null;
      updateActivePresetHighlight();
    }, 1500);
  }

  function save(immediate) {
    const isEnabled = document.getElementById('isEnabled').checked;
    const write = () => mclickStorageSet({ [SETTINGS_KEY]: currentSettings, [ENABLED_KEY]: isEnabled });
    clearTimeout(saveTimeout);
    if (immediate) {
      write();
    } else {
      saveTimeout = setTimeout(write, 150);
    }
  }

  function applyPreset(entry, btn) {
    currentSettings = { ...DEFAULT_SETTINGS, ...entry.settings };
    activePresetKey = entry.domKey;
    updateUI(currentSettings);
    save(true);
    flashPresetStatus(entry.label);

    // Restart the pop animation even on repeated clicks of the same preset.
    if (btn) {
      btn.classList.remove('just-applied');
      void btn.offsetWidth; // force reflow so the animation replays
      btn.classList.add('just-applied');
      btn.addEventListener('animationend', () => btn.classList.remove('just-applied'), { once: true });
    }
  }

  function deletePreset(id, name) {
    if (!confirm(`Delete the "${name}" preset? This can't be undone.`)) return;
    customPresets = customPresets.filter(p => p.id !== id);
    mclickPresetsSet(customPresets);
    if (activePresetKey === 'custom:' + id) activePresetKey = null;
    renderPresets();
  }

  const presetRow = document.getElementById('presetRow');
  const managePresetsList = document.getElementById('managePresetsList');

  function renderPresets() {
    presetRow.innerHTML = '';
    allPresetEntries().forEach(entry => {
      const btn = document.createElement('button');
      btn.className = 'preset-btn';
      btn.dataset.key = entry.domKey;
      // Built with createElement/textContent (not innerHTML) since custom
      // preset names are user-entered text, not markup.
      btn.appendChild(document.createTextNode(entry.label));
      if (entry.edited) {
        const badge = document.createElement('span');
        badge.style.color = '#94a3b8';
        badge.style.fontWeight = '600';
        badge.textContent = ' (edited)';
        btn.appendChild(badge);
      }
      const hint = document.createElement('small');
      hint.textContent = entry.hint;
      btn.appendChild(hint);
      btn.addEventListener('click', () => applyPreset(entry, btn));
      presetRow.appendChild(btn);
    });

    const addBtn = document.createElement('button');
    addBtn.className = 'preset-btn add-preset';
    addBtn.type = 'button';
    addBtn.textContent = '+ New Preset';
    addBtn.addEventListener('click', () => {
      newPresetForm.hidden = false;
      newPresetNameInput.value = '';
      newPresetNameInput.focus();
    });
    presetRow.appendChild(addBtn);

    renderManagePresets();
    updateActivePresetHighlight();
  }

  // Dedicated create/rename/update/delete controls for custom presets (plus
  // any built-ins that have drifted from their factory settings), kept
  // separate from the one-click "apply" buttons above so renaming a preset
  // never accidentally creates a duplicate.
  function renderManagePresets() {
    managePresetsList.innerHTML = '';
    const editedBuiltins = Object.entries(BUILTIN_PRESETS).filter(([key]) => builtinOverrides[key]);

    if (customPresets.length === 0 && editedBuiltins.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'preset-manage-empty';
      empty.textContent = 'No custom or edited presets yet.';
      managePresetsList.appendChild(empty);
      return;
    }

    editedBuiltins.forEach(([key, builtin]) => {
      const row = document.createElement('div');
      row.className = 'preset-manage-row';

      const label = document.createElement('div');
      label.style.flex = '1';
      label.style.fontSize = '12px';
      label.style.fontWeight = '700';
      label.textContent = `${builtin.label} (built-in, edited)`;
      row.appendChild(label);

      const restoreBtn = document.createElement('button');
      restoreBtn.className = 'icon-btn';
      restoreBtn.type = 'button';
      restoreBtn.title = `Restore "${builtin.label}" to its factory settings`;
      restoreBtn.textContent = '↺';
      restoreBtn.addEventListener('click', () => {
        delete builtinOverrides[key];
        mclickBuiltinOverridesSet(builtinOverrides);
        if (activePresetKey === 'builtin:' + key) activePresetKey = null;
        renderPresets();
      });
      row.appendChild(restoreBtn);

      managePresetsList.appendChild(row);
    });

    customPresets.forEach(preset => {
      const row = document.createElement('div');
      row.className = 'preset-manage-row';

      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.value = preset.name;
      nameInput.maxLength = 40;
      nameInput.addEventListener('change', () => {
        const newName = nameInput.value.trim();
        if (!newName || newName === preset.name) { nameInput.value = preset.name; return; }
        preset.name = newName;
        mclickPresetsSet(customPresets);
        renderPresets();
      });
      nameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') nameInput.blur(); });

      const updateBtn = document.createElement('button');
      updateBtn.className = 'icon-btn';
      updateBtn.type = 'button';
      updateBtn.title = `Overwrite "${preset.name}" with your current settings`;
      updateBtn.textContent = '↻';
      updateBtn.addEventListener('click', () => {
        preset.settings = { ...currentSettings };
        mclickPresetsSet(customPresets);
        activePresetKey = 'custom:' + preset.id;
        renderPresets();
        flashPresetStatus(preset.name);
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'icon-btn danger';
      deleteBtn.type = 'button';
      deleteBtn.title = `Delete "${preset.name}"`;
      deleteBtn.textContent = '✕';
      deleteBtn.addEventListener('click', () => deletePreset(preset.id, preset.name));

      row.appendChild(nameInput);
      row.appendChild(updateBtn);
      row.appendChild(deleteBtn);
      managePresetsList.appendChild(row);
    });
  }

  // --- New preset form ---
  const newPresetForm = document.getElementById('newPresetForm');
  const newPresetNameInput = document.getElementById('newPresetName');

  document.getElementById('confirmSavePreset').addEventListener('click', () => {
    const name = newPresetNameInput.value.trim() || `My Preset ${customPresets.length + 1}`;
    const preset = { id: 'p' + Date.now() + Math.random().toString(36).slice(2, 7), name, settings: { ...currentSettings } };
    customPresets = [...customPresets, preset];
    mclickPresetsSet(customPresets);
    activePresetKey = 'custom:' + preset.id;
    newPresetForm.hidden = true;
    renderPresets();
    flashPresetStatus(name);
  });
  document.getElementById('cancelSavePreset').addEventListener('click', () => { newPresetForm.hidden = true; });
  newPresetNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('confirmSavePreset').click();
    if (e.key === 'Escape') newPresetForm.hidden = true;
  });

  // Initialize
  mclickStorageGet((res) => {
    if (res[SETTINGS_KEY]) {
      currentSettings = { ...DEFAULT_SETTINGS, ...res[SETTINGS_KEY] };
    }
    const isEnabled = res[ENABLED_KEY] !== undefined ? res[ENABLED_KEY] : true;
    document.getElementById('isEnabled').checked = isEnabled;
    document.getElementById('statusText').innerText = isEnabled ? 'Active' : 'Paused';
    updateUI(currentSettings);
  });

  mclickPresetsGet((list) => {
    customPresets = list;
    renderPresets();
  });

  mclickBuiltinOverridesGet((overrides) => {
    builtinOverrides = overrides;
    renderPresets();
  });

  const manifest = chrome.runtime.getManifest();
  document.getElementById('versionText').innerText = 'v' + manifest.version;

  // Global Event Listener for all inputs
  document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', (e) => {
      const id = e.target.id;

      if (id === 'isEnabled') {
        document.getElementById('statusText').innerText = e.target.checked ? 'Active' : 'Paused';
        save(true);
        return;
      }

      let val;
      if (e.target.type === 'checkbox') {
        val = e.target.checked;
      } else if (e.target.type === 'range') {
        val = parseFloat(e.target.value);
      } else {
        val = e.target.value;
      }

      currentSettings[id] = val;
      const immediate = e.target.type === 'checkbox' || e.target.type === 'color';
      // If a preset (built-in or custom) is currently active, save this edit
      // back into it *before* re-deriving the highlight, so the in-memory
      // preset data already matches and it stays highlighted as active.
      persistActivePresetEdits(immediate);
      updateUI(currentSettings); // Refresh labels + highlight
      // Debounce range/color drags; commit checkboxes immediately.
      save(immediate);
    });
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    // An explicit hard reset, not an "edit" — don't let it overwrite whatever
    // preset happened to be active.
    activePresetKey = null;
    currentSettings = { ...DEFAULT_SETTINGS };
    updateUI(currentSettings);
    save(true);
  });

  document.getElementById('restorePresetsBtn').addEventListener('click', () => {
    if (!confirm('Restore all built-in presets (Default, Screencast, Teaching, Minimal) to their factory settings? Your custom presets are not affected.')) return;
    builtinOverrides = {};
    mclickBuiltinOverridesSet(builtinOverrides);
    if (activePresetKey && activePresetKey.startsWith('builtin:')) activePresetKey = null;
    renderPresets();
    updateActivePresetHighlight();
  });

  document.getElementById('customizeShortcut').addEventListener('click', () => {
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  });

  // --- Export / Import ---
  const importStatus = document.getElementById('importStatus');
  function setImportStatus(msg, isError) {
    importStatus.textContent = msg;
    importStatus.className = isError ? 'error' : 'ok';
    if (msg) setTimeout(() => { importStatus.textContent = ''; importStatus.className = ''; }, 4000);
  }

  document.getElementById('exportBtn').addEventListener('click', () => {
    const payload = {
      mclickExport: true,
      version: manifest.version,
      exportedAt: new Date().toISOString(),
      settings: currentSettings,
      isEnabled: document.getElementById('isEnabled').checked,
      customPresets,
      builtinOverrides
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mclick-settings.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  const importFile = document.getElementById('importFile');
  document.getElementById('importBtn').addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', () => {
    const file = importFile.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const importedSettings = data.settings && typeof data.settings === 'object' ? data.settings : data;
        if (!importedSettings || typeof importedSettings !== 'object') throw new Error('No settings object found.');

        currentSettings = { ...DEFAULT_SETTINGS, ...importedSettings };
        if (typeof data.isEnabled === 'boolean') {
          document.getElementById('isEnabled').checked = data.isEnabled;
          document.getElementById('statusText').innerText = data.isEnabled ? 'Active' : 'Paused';
        }
        if (Array.isArray(data.customPresets)) {
          customPresets = data.customPresets.filter(p => p && p.id && p.name && p.settings);
          mclickPresetsSet(customPresets);
        }
        if (data.builtinOverrides && typeof data.builtinOverrides === 'object') {
          builtinOverrides = data.builtinOverrides;
          mclickBuiltinOverridesSet(builtinOverrides);
        }
        activePresetKey = null;
        updateUI(currentSettings);
        renderPresets();
        save(true);
        setImportStatus('Settings imported successfully.', false);
      } catch (err) {
        setImportStatus('Import failed: not a valid mClick settings file.', true);
      } finally {
        importFile.value = '';
      }
    };
    reader.readAsText(file);
  });

  chrome.storage.onChanged.addListener((changes) => {
    // Reflect changes made from another tab/popup/device without clobbering
    // in-progress edits in this tab.
    if (changes[CUSTOM_PRESETS_KEY]) {
      mclickPresetsGet((list) => { customPresets = list; renderPresets(); });
    }
    if (changes[BUILTIN_OVERRIDES_KEY]) {
      mclickBuiltinOverridesGet((overrides) => { builtinOverrides = overrides; renderPresets(); });
    }
    if (!changes[SETTINGS_KEY] && !changes[ENABLED_KEY]) return;
    mclickStorageGet((res) => {
      if (res[SETTINGS_KEY]) currentSettings = { ...DEFAULT_SETTINGS, ...res[SETTINGS_KEY] };
      const isEnabled = res[ENABLED_KEY] !== undefined ? res[ENABLED_KEY] : true;
      document.getElementById('isEnabled').checked = isEnabled;
      document.getElementById('statusText').innerText = isEnabled ? 'Active' : 'Paused';
      updateUI(currentSettings);
    });
  });
});
