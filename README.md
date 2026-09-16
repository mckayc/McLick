# mClick - Professional Cursor Studio

**mClick** is a high-performance cursor highlighter designed for content creators, educators, and software presenters.

---

## 📦 Production Bundle Checklist
When you are ready to upload to the Chrome Web Store, create a `.zip` file containing **ONLY** these files from your root directory.

### Required Files:
1.  `manifest.json` (The heart of the extension)
2.  `index.html` (The quick-toggle popup)
3.  `popup.js` (Popup logic)
4.  `options.html` (The full settings page)
5.  `options.js` (Options page logic)
6.  `content.js` (The highlighter engine)
7.  `background.js` (Shortcut & state manager)
8.  `icon16.png`, `icon48.png`, `icon128.png` (Active icons)
9.  `icon16_off.png`, `icon48_off.png`, `icon128_off.png` (Inactive icons)

You can build that zip yourself, e.g. from a POSIX shell:

```sh
zip mclick.zip manifest.json index.html popup.js options.html options.js content.js background.js \
  icon16.png icon48.png icon128.png icon16_off.png icon48_off.png icon128_off.png
```

## Features
- **Cursor highlighter** with adjustable size, color, opacity, ray glow, and cinematic ghosting/lag.
- **Per-button ripple styling** (left/right/middle click) — independent color, thickness, and expansion.
- **Spotlight mode** — dims the rest of the page and keeps a bright circle around the cursor, great for directing attention during a demo.
- **Telemetry HUD** — shows active modifier keys and the last key pressed.
- **Scroll direction indicator** — a ▲ appears above the cursor while scrolling up, a ▼ below it while scrolling down.
- **Idle auto-hide** — fades the highlighter out after a configurable period of inactivity.
- **Laser pointer** — hold **L** to leave a short, fading comet trail behind the cursor (Google Slides-style), for calling out something live. Ignored while typing in a field.
- **Magnifier lens** — hold **Z** to show a zoomed-in circular lens around the cursor, for pointing out small UI details. It's a live CSS-scaled clone of the page, so ordinary HTML/CSS/text zooms perfectly; `<canvas>` content (charts, games), `<video>`, and embedded `<iframe>`s can't be captured this way and will look blank or unmagnified inside the lens.
- **Presets** — Default, Screencast, Teaching, and Minimal built-in profiles, plus **your own custom presets**: tune the settings the way you like and click "+ New Preset" on the settings page to save and name it. All presets are one click away in both the popup and the full settings page, highlighted when active.
- **Editable built-in presets** — while any preset (built-in or custom) is active, changes you make save into it automatically, so "Screencast" or "Default" can just become your own tuned version. Edited built-ins are marked "(edited)"; use **Restore Default Presets** on the settings page to put them back to factory, or restore just one from the "Manage Custom Presets" list.
- **Settings sync** — appearance settings, custom presets, and on/off state sync via `chrome.storage.sync` across any browser you're signed into, with a local backup copy.
- **Export / Import settings** — back up your tuned profile (including custom presets) to a `.json` file, or share it with teammates, from the settings page.

## Shortcuts
- **Ctrl + Shift + H**: Toggle the highlighter ON/OFF globally.
- **Mac Users**: `Cmd + Shift + H`.
- To choose a different shortcut, open the popup and select **Customize Shortcut**. Chrome manages extension shortcut assignments at `chrome://extensions/shortcuts`.
- That page lists **two** entries for mClick — don't mix them up:
  - **"Toggle mClick Highlighter"** is mClick's own command. This is the one that turns the highlighter on/off.
  - **"Activate the extension"** is a shortcut Chrome generates automatically for any extension with a toolbar popup. It only opens the popup window (same as clicking the toolbar icon) — it does **not** toggle the highlighter.
- **Hold L**: laser pointer comet trail. **Hold Z**: magnifier lens. These are in-page hold-to-activate keys (not Chrome commands), so they aren't customizable from `chrome://extensions/shortcuts` — toggle them off in **Settings → Laser Pointer / Magnifier Lens** if they ever conflict with a site's own keyboard shortcuts.

## Settings Page
The popup (toolbar icon) is a compact quick-toggle with one-click presets. Click **Open Full Settings**, or right-click the toolbar icon → **Options**, for the full settings page with every control, spotlight/auto-hide configuration, and import/export.

## Outside the Browser

Chrome content scripts can only draw over web pages. They cannot render a cursor overlay over desktop applications or capture a global operating-system shortcut. For that, the highlighter engine would need a companion desktop app built with Electron, Tauri, or a native platform API. The extension could then communicate with that app through native messaging or a local WebSocket.

## State Persistence

Settings and the ON/OFF state are stored in `chrome.storage.sync` (with a `chrome.storage.local` backup), so they survive browser restarts and extension updates, and follow a signed-in user to their other browsers. A new installation starts enabled; changing the toggle persists the new state everywhere it syncs.

## Troubleshooting Icons
If the icon does not change when toggled:
1. Ensure the `_off.png` files are named correctly in the root.
2. Ensure you have "Reloaded" the extension in `chrome://extensions` after adding new image files.
