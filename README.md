# StreamCursor

Custom cursor overlay for Linux that fixes the invisible cursor problem when screen sharing on Discord, OBS, Google Meet, Zoom and Teams. Renders a neon SVG cursor on a transparent fullscreen window that gets captured by any screen sharing tool.

## How it works

The app creates a transparent, fullscreen, always-on-top window and draws a custom SVG cursor at the real mouse position in real time. Since it's a regular system window, screen sharing tools capture it along with the rest of the screen. The native system cursor is hidden while the overlay is active.

## Requirements

- Node.js 18+
- Linux with X11 (Ubuntu 20.04+, Mint, Fedora, Arch)
- Libraries: `libx11-dev`, `libxfixes-dev`

```bash
# Ubuntu/Mint/Debian
sudo apt install libx11-dev libxfixes-dev

# Fedora
sudo dnf install libX11-devel libXfixes-devel

# Arch
sudo pacman -S libx11 libxfixes
```

## Installation

```bash
git clone https://github.com/Luan-oliveira8/stream-cursor.git
cd stream-cursor
npm install
npx node-gyp configure build
```

## Usage

```bash
# Development (with hot-reload)
npm run dev

# Production build
npm run build

# Run production build
npx electron out/main/index.js
```

## Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+Shift+C` | Toggle overlay on/off |
| Tray icon click | Open/close settings |
| Tray > right-click | Menu with options |

## Settings

Access via the system tray icon:

- **Style**: Neon (green glow), Classic (white), Minimal (red)
- **Colors**: Customizable primary and stroke colors
- **Glow**: Neon glow effect with adjustable radius
- **Size**: 0.5x to 3x (32px to 96px)
- **Hotkey**: Customizable keyboard shortcut
- **Autostart**: Launch on system startup

## Building installers

```bash
# All Linux formats
npm run dist:linux

# Windows
npm run dist:win
```

Generates: `.AppImage`, `.deb`, `.rpm`, `.exe`

## Restore cursor

If the app closes unexpectedly while the cursor is hidden:

```bash
bash scripts/restore-cursor.sh
```

## Architecture

```
src/
  main/          - Electron main process (tray, overlay, tracking)
  native/        - C N-API addon (XQueryPointer, XFixes, XRaiseWindow)
  preload/       - Context bridge (secure IPC)
  renderer/
    overlay/     - Canvas cursor rendering (transparent window)
    settings/    - Settings UI (Svelte 5)
```

## Stack

- Electron 33 + electron-vite
- TypeScript
- Svelte 5 (settings UI)
- Native N-API addon in C (X11/XFixes)
- Canvas 2D (60fps+ rendering)
- electron-store (config persistence)

## License

MIT
