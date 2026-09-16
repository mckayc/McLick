(function() {
  const SETTINGS_KEY = 'mClick_settings_v9';
  const LEGACY_SETTINGS_KEY = 'mClick_settings_v8';
  const ENABLED_KEY = 'isEnabled';

  // Reads settings from sync storage (so they follow the user across signed-in
  // browsers) and falls back to the local cache when sync has nothing yet
  // (offline, not signed in, or a fresh profile that only has the old v8 key).
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

  let settings = null;
  // Stay hidden until the saved state has been loaded.
  let isEnabled = false;
  let mouseX = 0, mouseY = 0;
  let ghostX = 0, ghostY = 0;
  let activeButton = 'none';
  let isScrolling = false;
  let scrollTimeout = null;
  let scrollDirection = null;
  let lastKey = '';
  let lastKeyTimeout = null;
  let activeModifiers = [];
  let lastActivityTime = Date.now();
  let rafId = null;

  // Laser pointer (hold "L"): a short comet trail of recent cursor positions.
  const LASER_TRAIL_MS = 350;
  const LASER_POOL_SIZE = 26;
  let laserActive = false;
  let laserPoints = []; // [{x, y, t}], newest last

  // Magnifier (hold "Z"): a circular lens showing a scaled clone of the live page.
  const MAGNIFIER_REFRESH_MS = 500;
  let magnifierActive = false;
  let magnifierClone = null;
  let magnifierRefreshInterval = null;

  function isEditableTarget(t) {
    if (!t) return false;
    const tag = t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    return !!t.isContentEditable;
  }

  const container = document.createElement('div');
  container.id = 'mclick-root-container';
  Object.assign(container.style, {
    position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
    pointerEvents: 'none', zIndex: '2147483647', display: 'block', overflow: 'hidden'
  });

  const shadow = container.attachShadow({ mode: 'open' });
  const root = document.createElement('div');
  shadow.appendChild(root);

  const style = document.createElement('style');
  style.textContent = `
    .highlighter {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      transform-origin: center;
      will-change: transform, left, top;
      transition: opacity 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .ripple {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      border-style: solid;
      transform: translate(-50%, -50%);
      animation: ripple-scale 0.7s cubic-bezier(0.19, 1, 0.22, 1) forwards;
    }
    .ripple-double::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100%;
      height: 100%;
      transform: translate(-50%, -50%) scale(0.85);
      border: inherit;
      border-radius: inherit;
      opacity: 0.6;
    }
    .ripple-middle {
      position: absolute;
      pointer-events: none;
      transform: translate(-50%, -50%);
      animation: ripple-middle 0.5s ease-out forwards;
    }
    .modifier-hud {
      position: absolute;
      display: flex;
      gap: 4px;
      transform: translateX(-50%);
      font-family: -apple-system, system-ui, sans-serif;
      pointer-events: none;
      opacity: 1;
      transition: opacity 0.3s ease;
    }
    .modifier-pill {
      background: #000;
      color: #fff;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      border: 1px solid rgba(255,255,255,0.2);
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    }
    .spotlight {
      position: absolute;
      top: 0;
      left: 0;
      border-radius: 50%;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.25s ease;
    }
    .scroll-indicator {
      position: absolute;
      pointer-events: none;
      font-size: 16px;
      font-weight: 900;
      color: #fff;
      text-shadow: 0 1px 4px rgba(0,0,0,0.7);
      opacity: 0;
      transition: opacity 0.15s ease;
      transform: translate(-50%, -50%);
    }
    .laser-dot {
      position: absolute;
      top: 0;
      left: 0;
      border-radius: 50%;
      pointer-events: none;
      opacity: 0;
      transform: translate(-50%, -50%);
      will-change: left, top, opacity, width, height;
    }
    @keyframes ripple-scale { 0% { transform: translate(-50%, -50%) scale(0.2); opacity: 1; } 100% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; } }
    @keyframes ripple-middle { 0% { transform: translate(-50%, -50%) scaleY(0) scaleX(1.5); opacity: 1; } 100% { transform: translate(-50%, -50%) scaleY(1.5) scaleX(0.2); opacity: 0; } }
  `;
  shadow.appendChild(style);
  document.documentElement.appendChild(container);

  // Spotlight sits behind the highlighter so the aperture still reads on top of the dimmed page.
  const spotlight = document.createElement('div');
  spotlight.className = 'spotlight';
  root.appendChild(spotlight);

  const highlighter = document.createElement('div');
  highlighter.className = 'highlighter';
  root.appendChild(highlighter);

  const scrollIndicator = document.createElement('div');
  scrollIndicator.className = 'scroll-indicator';
  root.appendChild(scrollIndicator);

  const hud = document.createElement('div');
  hud.className = 'modifier-hud';
  root.appendChild(hud);

  // Fixed pool of dot elements reused for the laser trail — avoids creating/
  // destroying DOM nodes on every animation frame while the trail is active.
  const laserDots = [];
  for (let i = 0; i < LASER_POOL_SIZE; i++) {
    const dot = document.createElement('div');
    dot.className = 'laser-dot';
    root.appendChild(dot);
    laserDots.push(dot);
  }

  // The magnifier lens has to live in the page's light DOM (not our shadow
  // root) so the page's own stylesheets/fonts apply to the cloned content
  // inside it and it actually looks like the real page, zoomed in.
  const magnifierLens = document.createElement('div');
  magnifierLens.id = 'mclick-magnifier-lens';
  Object.assign(magnifierLens.style, {
    position: 'fixed', display: 'none', borderRadius: '50%', overflow: 'hidden',
    pointerEvents: 'none', zIndex: '2147483647',
    boxShadow: '0 0 0 3px rgba(255,255,255,0.9), 0 10px 30px rgba(0,0,0,0.4)',
    background: '#fff'
  });
  document.documentElement.appendChild(magnifierLens);

  function applySettings(res) {
    const defaults = {
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
      magnifierEnabled: true, magnifierZoom: 2.5, magnifierSize: 180
    };
    settings = res[SETTINGS_KEY] ? { ...defaults, ...res[SETTINGS_KEY] } : defaults;

    const wasEnabled = isEnabled;
    isEnabled = res[ENABLED_KEY] !== undefined ? res[ENABLED_KEY] : true;
    container.style.display = isEnabled ? 'block' : 'none';

    if (settings.ghostingIntensity <= 0) {
      ghostX = mouseX;
      ghostY = mouseY;
    }

    // Only keep the render loop and the input listeners doing real work while
    // the highlighter is actually on screen — avoids spending a RAF slot (and,
    // for keydown, capturing keystrokes) on every page when the user has it off.
    if (isEnabled && !wasEnabled) {
      lastActivityTime = Date.now();
      startLoop();
    } else if (!isEnabled && wasEnabled) {
      stopLoop();
      deactivateLaser();
      deactivateMagnifier();
    }
  }

  function updateSettings() {
    mclickStorageGet(applySettings);
  }

  function createRipple(x, y, type) {
    if (!isEnabled || !settings) return;

    const isLeft = type === 'left' && settings.enableLeftClick;
    const isRight = type === 'right' && settings.enableRightClick;
    const isMiddle = type === 'middle' && settings.enableMiddleClick;

    if (!isLeft && !isRight && !isMiddle) return;

    const r = document.createElement('div');
    const color = isLeft ? settings.leftColor : isRight ? settings.rightColor : settings.middleColor;
    const thickness = isLeft ? settings.leftRippleThickness : isRight ? settings.rightRippleThickness : settings.middleRippleThickness;
    const expansion = isLeft ? settings.leftRippleExpansion : isRight ? settings.rightRippleExpansion : settings.middleRippleExpansion;
    const size = settings.size * expansion;

    if (isMiddle) {
      r.className = 'ripple-middle';
      Object.assign(r.style, {
        left: x+'px', top: y+'px', width: thickness+'px', height: (60 * expansion) + 'px',
        backgroundColor: color, opacity: 0.8, boxShadow: `0 0 10px ${color}`
      });
    } else {
      r.className = 'ripple';
      if (isRight) r.classList.add('ripple-double');
      Object.assign(r.style, {
        left: x+'px', top: y+'px', width: size+'px', height: size+'px',
        borderColor: color, borderWidth: thickness+'px', opacity: 0.8
      });
    }

    root.appendChild(r);
    setTimeout(() => r.remove(), 800);
  }

  // Built with createElement/textContent (not innerHTML) so event-sourced
  // key names are never parsed as markup.
  function renderHud() {
    while (hud.firstChild) hud.removeChild(hud.firstChild);
    if (settings.showModifierKeys) {
      for (const m of activeModifiers) {
        const pill = document.createElement('span');
        pill.className = 'modifier-pill';
        pill.textContent = m;
        hud.appendChild(pill);
      }
    }
    if (settings.showLastKey && lastKey) {
      const pill = document.createElement('span');
      pill.className = 'modifier-pill';
      pill.style.background = '#4f46e5';
      pill.style.borderColor = '#6366f1';
      pill.textContent = lastKey;
      hud.appendChild(pill);
    }
  }

  // --- Laser pointer (hold L) ---
  function activateLaser() {
    if (laserActive) return;
    laserActive = true;
  }
  function deactivateLaser() {
    laserActive = false;
    // Points already in the trail keep aging/fading naturally in tick(); we
    // just stop adding new ones.
  }
  function renderLaser(now) {
    if (laserActive && settings.laserEnabled) {
      laserPoints.push({ x: mouseX, y: mouseY, t: now });
    }
    laserPoints = laserPoints.filter(p => now - p.t < LASER_TRAIL_MS);

    const visible = laserPoints.slice(-LASER_POOL_SIZE);
    for (let i = 0; i < LASER_POOL_SIZE; i++) {
      const dot = laserDots[i];
      const p = visible[i];
      if (!p) { dot.style.opacity = 0; continue; }
      const age = (now - p.t) / LASER_TRAIL_MS; // 0 = fresh, 1 = expired
      const fade = 1 - age;
      const size = settings.laserSize * (0.5 + fade * 0.5);
      dot.style.left = p.x + 'px';
      dot.style.top = p.y + 'px';
      dot.style.width = size + 'px';
      dot.style.height = size + 'px';
      dot.style.backgroundColor = settings.laserColor;
      dot.style.boxShadow = `0 0 ${size}px ${settings.laserColor}`;
      dot.style.opacity = fade * 0.9;
    }
  }

  // --- Magnifier (hold Z) ---
  // Clones the live page into a light-DOM lens and scales it around the cursor
  // via translate(center) scale(zoom) translate(-cursor) — this keeps the point
  // under the cursor visually fixed while everything around it zooms in.
  // Known trade-off: cloneNode() doesn't capture <canvas> pixels or live
  // <video>/<iframe> playback, so those show blank/static inside the lens.
  function sanitizeMagnifierClone(clone) {
    clone.querySelectorAll('#mclick-root-container, #mclick-magnifier-lens, script').forEach(el => el.remove());
    clone.querySelectorAll('iframe, frame').forEach(el => el.remove());
    clone.querySelectorAll('video, audio').forEach(el => {
      el.removeAttribute('autoplay');
      el.muted = true;
      try { el.pause(); } catch (e) {}
      el.querySelectorAll('source').forEach(s => s.remove());
      el.removeAttribute('src');
    });
    return clone;
  }
  function refreshMagnifierClone() {
    if (magnifierClone) magnifierClone.remove();
    magnifierClone = sanitizeMagnifierClone(document.body.cloneNode(true));
    // Without an explicit width/height, an absolutely-positioned clone sizes
    // itself to its new containing block — the tiny lens — and the whole page
    // reflows/squishes down to ~180px BEFORE the zoom transform ever runs,
    // which renders as a blank/white lens. Force it back to the real page's
    // rendered dimensions so it lays out identically to the original.
    const pageWidth = Math.max(document.documentElement.scrollWidth, window.innerWidth);
    const pageHeight = Math.max(document.documentElement.scrollHeight, window.innerHeight);
    Object.assign(magnifierClone.style, {
      position: 'absolute', top: '0', left: '0', margin: '0',
      width: pageWidth + 'px', minHeight: pageHeight + 'px',
      transformOrigin: '0 0'
    });
    magnifierLens.innerHTML = '';
    magnifierLens.appendChild(magnifierClone);
    // Re-apply the current zoom transform immediately so the periodic refresh
    // doesn't flash one unscaled frame before the next tick() runs.
    if (magnifierActive && settings) renderMagnifier();
  }
  function activateMagnifier() {
    if (magnifierActive) return;
    magnifierActive = true;
    refreshMagnifierClone();
    magnifierLens.style.display = 'block';
    clearInterval(magnifierRefreshInterval);
    magnifierRefreshInterval = setInterval(refreshMagnifierClone, MAGNIFIER_REFRESH_MS);
  }
  function deactivateMagnifier() {
    if (!magnifierActive) return;
    magnifierActive = false;
    magnifierLens.style.display = 'none';
    clearInterval(magnifierRefreshInterval);
    magnifierRefreshInterval = null;
    if (magnifierClone) { magnifierClone.remove(); magnifierClone = null; }
  }
  function renderMagnifier() {
    const size = settings.magnifierSize;
    const radius = size / 2;
    magnifierLens.style.width = size + 'px';
    magnifierLens.style.height = size + 'px';
    magnifierLens.style.left = (mouseX - radius) + 'px';
    magnifierLens.style.top = (mouseY - radius) + 'px';

    if (!magnifierClone) return;
    const docX = window.scrollX + mouseX;
    const docY = window.scrollY + mouseY;
    const zoom = settings.magnifierZoom;
    magnifierClone.style.transform =
      `translate(${radius}px, ${radius}px) scale(${zoom}) translate(${-docX}px, ${-docY}px)`;
  }

  function tick() {
    rafId = requestAnimationFrame(tick);
    if (!isEnabled || !settings) return;

    if (settings.ghostingIntensity <= 0) {
      ghostX = mouseX;
      ghostY = mouseY;
    } else {
      const factor = 0.4 - (settings.ghostingIntensity * 0.35);
      ghostX += (mouseX - ghostX) * factor;
      ghostY += (mouseY - ghostY) * factor;
    }

    const isIdle = settings.autoHideEnabled && (Date.now() - lastActivityTime) > settings.autoHideDelay * 1000;

    const activeColor = activeButton === 'left' ? settings.leftColor : activeButton === 'right' ? settings.rightColor : activeButton === 'middle' ? settings.middleColor : settings.color;

    const rayBlur = settings.rayIntensity * 0.8;
    const raySpread = settings.rayIntensity * 0.5;

    // Calculate scale based on interactions
    let scale = 1.0;
    if (activeButton !== 'none') scale = 0.9;
    else if (isScrolling) scale = 1.25;

    Object.assign(highlighter.style, {
      left: (ghostX - settings.size / 2) + 'px',
      top: (ghostY - settings.size / 2) + 'px',
      width: settings.size + 'px',
      height: settings.size + 'px',
      backgroundColor: activeColor,
      opacity: isIdle ? 0 : settings.opacity,
      boxShadow: settings.rayIntensity > 0 ? `0 0 ${rayBlur}px ${raySpread}px ${activeColor}` : 'none',
      transform: `scale(${scale})`
    });

    renderHud();
    hud.style.left = mouseX + 'px';
    hud.style.top = (mouseY + settings.size/2 + 12) + 'px';
    hud.style.opacity = isIdle ? 0 : 1;

    if (settings.spotlightMode) {
      Object.assign(spotlight.style, {
        left: ghostX + 'px',
        top: ghostY + 'px',
        width: (settings.spotlightRadius * 2) + 'px',
        height: (settings.spotlightRadius * 2) + 'px',
        transform: 'translate(-50%, -50%)',
        boxShadow: `0 0 0 9999px rgba(0,0,0,${settings.spotlightOpacity})`,
        opacity: isIdle ? 0 : 1
      });
    } else {
      spotlight.style.opacity = 0;
    }

    if (settings.showScrollIndicator && isScrolling && scrollDirection) {
      const isDown = scrollDirection === 'down';
      // Up arrow sits above the aperture (pointing the way you're scrolling),
      // down arrow sits below it — so the arrow is always on the side it's pointing toward.
      scrollIndicator.textContent = isDown ? '▼' : '▲';
      scrollIndicator.style.left = mouseX + 'px';
      scrollIndicator.style.top = isDown
        ? (mouseY + settings.size/2 + 16) + 'px'
        : (mouseY - settings.size/2 - 16) + 'px';
      scrollIndicator.style.opacity = isIdle ? 0 : 1;
    } else {
      scrollIndicator.style.opacity = 0;
    }

    renderLaser(Date.now());
    if (magnifierActive) renderMagnifier();
  }

  function startLoop() {
    if (rafId === null) rafId = requestAnimationFrame(tick);
  }
  function stopLoop() {
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
  }

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    if (isEnabled) lastActivityTime = Date.now();
  }, { passive: true });

  window.addEventListener('mousedown', e => {
    if (!isEnabled) return;
    lastActivityTime = Date.now();
    activeButton = e.button === 0 ? 'left' : e.button === 1 ? 'middle' : e.button === 2 ? 'right' : 'none';
    createRipple(e.clientX, e.clientY, activeButton);
  }, { passive: true });

  window.addEventListener('mouseup', () => { activeButton = 'none'; });

  window.addEventListener('wheel', e => {
    if (!isEnabled) return;
    lastActivityTime = Date.now();
    isScrolling = true;
    scrollDirection = e.deltaY > 0 ? 'down' : 'up';
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => { isScrolling = false; scrollDirection = null; }, 200);
  }, { passive: true });

  // Skipped entirely while disabled, so no keystrokes are read on pages
  // where the user hasn't turned the highlighter on.
  window.addEventListener('keydown', e => {
    if (!isEnabled) return;
    lastActivityTime = Date.now();
    const mods = [];
    if (e.ctrlKey) mods.push('Ctrl');
    if (e.shiftKey) mods.push('Shift');
    if (e.altKey) mods.push('Alt');
    activeModifiers = mods;

    if (settings && settings.showLastKey && !['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
      lastKey = e.key.length === 1 ? e.key.toUpperCase() : e.key;
      clearTimeout(lastKeyTimeout);
      lastKeyTimeout = setTimeout(() => lastKey = '', 1500);
    }

    // Hold-to-activate hotkeys for the laser pointer (L) and magnifier (Z).
    // Ignored while typing in a field, and require no modifier held, so they
    // never fire during normal typing or shortcuts like Ctrl+Z (undo).
    if (!e.ctrlKey && !e.metaKey && !e.altKey && !isEditableTarget(e.target) && settings) {
      const key = e.key.toLowerCase();
      if (key === 'l' && settings.laserEnabled) activateLaser();
      if (key === 'z' && settings.magnifierEnabled) activateMagnifier();
    }
  });
  window.addEventListener('keyup', (e) => {
    if (!isEnabled) return;
    const mods = [];
    if (e.ctrlKey) mods.push('Ctrl');
    if (e.shiftKey) mods.push('Shift');
    if (e.altKey) mods.push('Alt');
    activeModifiers = mods;

    const key = e.key.toLowerCase();
    if (key === 'l') deactivateLaser();
    if (key === 'z') deactivateMagnifier();
  });

  // Safety net: if the tab loses focus (alt-tab, devtools, etc.) while a
  // hotkey is "held", the keyup may never arrive. Force both modes off.
  window.addEventListener('blur', () => {
    deactivateLaser();
    deactivateMagnifier();
  });

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'TOGGLE_VISIBILITY') {
      isEnabled = msg.enabled;
      container.style.display = isEnabled ? 'block' : 'none';
      if (isEnabled) {
        lastActivityTime = Date.now();
        startLoop();
      } else {
        stopLoop();
        deactivateLaser();
        deactivateMagnifier();
      }
    }
  });

  chrome.storage.onChanged.addListener(updateSettings);
  updateSettings();
})();
