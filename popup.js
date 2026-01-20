document.addEventListener('DOMContentLoaded', () => {
  const DEFAULT_SETTINGS = {
    size: 60, color: '#fde047', opacity: 0.4, rayIntensity: 5, ghostingIntensity: 0,
    showModifierKeys: true, showLastKey: true,
    leftColor: '#22c55e', leftOpacity: 0.5, leftRippleOpacity: 0.8, leftRippleThickness: 3, leftRippleExpansion: 1.1,
    rightColor: '#ef4444', rightOpacity: 0.5, rightRippleOpacity: 0.8, rightRippleThickness: 3, rightRippleExpansion: 1.2,
    middleColor: '#a855f7', middleOpacity: 0.5, middleRippleOpacity: 0.9, middleRippleThickness: 2, middleRippleExpansion: 1.05,
    enableLeftClick: true, enableRightClick: true, enableMiddleClick: true,
  };

  let currentSettings = { ...DEFAULT_SETTINGS };

  function updateUI(settings) {
    Object.keys(settings).forEach(key => {
      const el = document.getElementById(key);
      if (!el) return;
      
      if (el.type === 'checkbox') {
        el.checked = settings[key];
      } else {
        el.value = settings[key];
      }
      
      // Update value labels
      const valLabel = document.getElementById('val' + key.charAt(0).toUpperCase() + key.slice(1));
      if (valLabel) {
        if (key === 'opacity' || key === 'ghostingIntensity') {
          valLabel.innerText = Math.round(settings[key] * 100) + '%';
        } else if (key === 'size') {
          valLabel.innerText = settings[key] + 'px';
        } else {
          valLabel.innerText = settings[key];
        }
      }
    });
  }

  function save() {
    const isEnabled = document.getElementById('isEnabled').checked;
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ 
        mClick_settings_v8: currentSettings,
        isEnabled: isEnabled
      });
    } else {
      // Fallback for local previewing
      localStorage.setItem('mClick_preview_settings', JSON.stringify(currentSettings));
    }
  }

  // Initialize
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.get(['mClick_settings_v8', 'isEnabled'], (res) => {
      if (res.mClick_settings_v8) {
        currentSettings = { ...DEFAULT_SETTINGS, ...res.mClick_settings_v8 };
      }
      const isEnabled = res.isEnabled !== undefined ? res.isEnabled : true;
      document.getElementById('isEnabled').checked = isEnabled;
      document.getElementById('statusText').innerText = isEnabled ? 'Active' : 'Paused';
      updateUI(currentSettings);
    });
  } else {
    // Local preview logic
    const saved = localStorage.getItem('mClick_preview_settings');
    if (saved) currentSettings = JSON.parse(saved);
    updateUI(currentSettings);
  }

  // Global Event Listener for all inputs
  document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', (e) => {
      const id = e.target.id;
      
      if (id === 'isEnabled') {
        document.getElementById('statusText').innerText = e.target.checked ? 'Active' : 'Paused';
        save();
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
      updateUI(currentSettings); // Refresh labels
      save();
    });
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    currentSettings = { ...DEFAULT_SETTINGS };
    updateUI(currentSettings);
    save();
  });
});