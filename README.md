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

## Troubleshooting Icons
If the icon does not change when toggled:
1. Ensure the `_off.png` files are named correctly in the root.
2. Ensure you have "Reloaded" the extension in `chrome://extensions` after adding new image files.
