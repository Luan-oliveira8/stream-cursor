import { app, globalShortcut } from 'electron'
import { createOverlayWindow, destroyOverlayWindow, sendToOverlay } from './overlay-window'
import { createSettingsWindow, toggleSettingsWindow } from './settings-window'
import { createTray, updateTrayState } from './tray'
import { registerIpcHandlers } from './ipc-handlers'
import { startTracking, stopTracking, setXcursorMap } from './cursor-tracker'
import { hideCursor, showCursor, cleanupX11 } from './cursor-hider'
import { getConfig } from './config'
import { loadTheme } from './theme-loader'
import log from 'electron-log'

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
}

app.on('second-instance', () => {
  createSettingsWindow()
})

let overlayActive = false

app.commandLine.appendSwitch('enable-transparent-visuals')

export function applyTheme(themeId: string): void {
  const theme = loadTheme(themeId)
  if (!theme) return

  setXcursorMap(theme.xcursorMap)

  const themeData: Record<string, { svg: string; hotspotX: number; hotspotY: number; width: number; height: number }> = {}
  for (const [name, shape] of Object.entries(theme.shapes)) {
    const encoded = Buffer.from(shape.svg).toString('base64')
    themeData[name] = {
      svg: `data:image/svg+xml;base64,${encoded}`,
      hotspotX: shape.hotspotX,
      hotspotY: shape.hotspotY,
      width: shape.width,
      height: shape.height
    }
  }

  sendToOverlay('theme:loaded', themeData)
}

export function toggleOverlay(): void {
  const config = getConfig()
  if (overlayActive) {
    stopTracking()
    if (config.get('hideSystemCursor')) {
      showCursor()
    }
    destroyOverlayWindow()
    overlayActive = false
  } else {
    createOverlayWindow()
    startTracking()

    const themeId = config.get('cursorTheme') as string || '05-neon-green'
    setTimeout(() => applyTheme(themeId), 500)

    if (config.get('hideSystemCursor')) {
      hideCursor()
    }
    overlayActive = true
  }
  updateTrayState(overlayActive)
}

export function openSettings(): void {
  createSettingsWindow()
}

export function toggleSettings(): void {
  toggleSettingsWindow()
}

export function isOverlayActive(): boolean {
  return overlayActive
}

function cleanup(): void {
  stopTracking()
  showCursor()
  cleanupX11()
  destroyOverlayWindow()
}

app.whenReady().then(() => {
  if (!gotTheLock) return

  log.info('StreamCursor starting...')

  registerIpcHandlers()
  createTray()

  const config = getConfig()
  const hotkey = config.get('toggleHotkey') as string || 'CommandOrControl+Shift+C'
  globalShortcut.register(hotkey, toggleOverlay)

  createSettingsWindow()
  toggleOverlay()

  log.info('StreamCursor ready')
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
  cleanup()
})

app.on('window-all-closed', () => {})

process.on('uncaughtException', (err) => {
  log.error('Uncaught exception:', err)
  cleanup()
  app.quit()
})

process.on('unhandledRejection', (reason) => {
  log.error('Unhandled rejection:', reason)
})
