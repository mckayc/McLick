# mClick - Professional Cursor Studio

**mClick** is a high-performance cursor highlighter designed for content creators, educators, and software presenters.

---

## 📦 Production Bundle Checklist
When you are ready to upload to the Chrome Web Store, create a `.zip` file containing **ONLY** these files from your root directory. You can safely ignore or delete the `.tsx` and `.ts` files.

### Required Files:
1.  `manifest.json` (The heart of the extension)
2.  `index.html` (The settings popup UI)
3.  `popup.js` (Popup logic)
4.  `content.js` (The highlighter engine)
5.  `background.js` (Shortcut & State manager)
6.  `icon16.png`, `icon48.png`, `icon128.png` (Active icons)
7.  `icon16_off.png`, `icon48_off.png`, `icon128_off.png` (Inactive icons)

---

## Shortcuts
- **Ctrl + Shift + H**: Toggle the highlighter ON/OFF globally.
- **Mac Users**: `Cmd + Shift + H`.
- To choose a different shortcut, open the popup and select **Customize Shortcut**. Chrome manages extension shortcut assignments at `chrome://extensions/shortcuts`.

## Outside the Browser

Chrome content scripts can only draw over web pages. They cannot render a cursor overlay over desktop applications or capture a global operating-system shortcut. For that, the highlighter engine would need a companion desktop app built with Electron, Tauri, or a native platform API. The extension could then communicate with that app through native messaging or a local WebSocket.

## State Persistence

The ON/OFF state is stored in `chrome.storage.local`, so it survives browser restarts and extension updates. A new installation starts enabled; changing the toggle persists the new state.

## Troubleshooting Icons
If the icon does not change when toggled:
1. Ensure the `_off.png` files are named correctly in the root.
2. Ensure you have "Reloaded" the extension in `chrome://extensions` after adding new image files.
