Last updated: September 2026

Overview

mClick is a Chrome extension designed to visually enhance on-screen interactions for screen recordings, presentations, and demonstrations. It highlights the mouse cursor, provides visual indicators for mouse clicks, and can optionally display typed text on the screen to make actions easier to follow.

Your privacy is important. mClick does not collect, transmit, or sell personal data to any external server, and it never reads or stores the content of what you type — only the name of the last key pressed (e.g. "A", "Enter"), and only while the highlighter is turned on, purely to render the on-screen HUD.

Settings Sync

Your appearance settings (colors, sizes, spotlight/auto-hide preferences, custom presets, etc.) and the on/off state are saved with the `chrome.storage` API. If you are signed into Chrome, this data is synced through Google's own Chrome Sync infrastructure so your settings follow you to your other signed-in browsers — the same mechanism Chrome uses for bookmarks and other extension settings. A local copy is always kept on-device as a backup. No settings data is sent to mClick's developer or any third party.

Magnifier Lens

The optional magnifier (hold Z) works by copying the page's own HTML into a small on-screen lens and scaling it with CSS — entirely inside your browser, using only the standard DOM APIs available to any content script. It does not use screen-capture, camera, or microphone permissions, and nothing about the page is sent anywhere.