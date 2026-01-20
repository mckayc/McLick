(function() {
  let settings = null;
  let isEnabled = true;
  let mouseX = 0, mouseY = 0;
  let ghostX = 0, ghostY = 0;
  let activeButton = 'none';
  let isScrolling = false;
  let scrollTimeout = null;
  let lastKey = '';
  let lastKeyTimeout = null;
  let activeModifiers = [];

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
    @keyframes ripple-scale { 0% { transform: translate(-50%, -50%) scale(0.2); opacity: 1; } 100% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; } }
    @keyframes ripple-middle { 0% { transform: translate(-50%, -50%) scaleY(0) scaleX(1.5); opacity: 1; } 100% { transform: translate(-50%, -50%) scaleY(1.5) scaleX(0.2); opacity: 0; } }
  `;
  shadow.appendChild(style);
  document.documentElement.appendChild(container);

  const highlighter = document.createElement('div');
  highlighter.className = 'highlighter';
  root.appendChild(highlighter);

  const hud = document.createElement('div');
  hud.className = 'modifier-hud';
  root.appendChild(hud);

  function updateSettings() {
    chrome.storage.local.get(['mClick_settings_v8', 'isEnabled'], (res) => {
      const defaults = {
        size: 60, color: '#fde047', opacity: 0.4, rayIntensity: 5, ghostingIntensity: 0,
        showModifierKeys: true, showLastKey: true,
        leftColor: '#22c55e', leftRippleThickness: 3, leftRippleExpansion: 1.1,
        rightColor: '#ef4444', rightRippleThickness: 3, rightRippleExpansion: 1.2,
        middleColor: '#a855f7', middleRippleThickness: 2, middleRippleExpansion: 1.05,
        enableLeftClick: true, enableRightClick: true, enableMiddleClick: true
      };
      settings = res.mClick_settings_v8 ? { ...defaults, ...res.mClick_settings_v8 } : defaults;
      isEnabled = res.isEnabled !== undefined ? res.isEnabled : true;
      container.style.display = isEnabled ? 'block' : 'none';
      if (settings.ghostingIntensity <= 0) {
        ghostX = mouseX;
        ghostY = mouseY;
      }
    });
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

  function loop() {
    if (isEnabled && settings) {
      if (settings.ghostingIntensity <= 0) {
        ghostX = mouseX;
        ghostY = mouseY;
      } else {
        const factor = 0.4 - (settings.ghostingIntensity * 0.35);
        ghostX += (mouseX - ghostX) * factor;
        ghostY += (mouseY - ghostY) * factor;
      }

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
        opacity: settings.opacity,
        boxShadow: settings.rayIntensity > 0 ? `0 0 ${rayBlur}px ${raySpread}px ${activeColor}` : 'none',
        transform: `scale(${scale})`
      });

      let hudHTML = '';
      if (settings.showModifierKeys) {
        hudHTML += activeModifiers.map(m => `<span class="modifier-pill">${m}</span>`).join('');
      }
      if (settings.showLastKey && lastKey) {
        hudHTML += `<span class="modifier-pill" style="background:#4f46e5; border-color: #6366f1;">${lastKey}</span>`;
      }
      
      hud.innerHTML = hudHTML;
      hud.style.left = mouseX + 'px';
      hud.style.top = (mouseY + settings.size/2 + 12) + 'px';
    }
    requestAnimationFrame(loop);
  }

  window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; }, { passive: true });
  window.addEventListener('mousedown', e => {
    activeButton = e.button === 0 ? 'left' : e.button === 1 ? 'middle' : e.button === 2 ? 'right' : 'none';
    createRipple(e.clientX, e.clientY, activeButton);
  }, { passive: true });
  window.addEventListener('mouseup', () => activeButton = 'none');
  
  window.addEventListener('wheel', () => {
    isScrolling = true;
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => isScrolling = false, 200);
  }, { passive: true });

  window.addEventListener('keydown', e => {
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
  });
  window.addEventListener('keyup', (e) => {
    const mods = [];
    if (e.ctrlKey) mods.push('Ctrl');
    if (e.shiftKey) mods.push('Shift');
    if (e.altKey) mods.push('Alt');
    activeModifiers = mods;
  });

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'TOGGLE_VISIBILITY') {
      isEnabled = msg.enabled;
      container.style.display = isEnabled ? 'block' : 'none';
    }
  });

  chrome.storage.onChanged.addListener(updateSettings);
  updateSettings();
  loop();
})();