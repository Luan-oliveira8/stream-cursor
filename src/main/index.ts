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

function registerHotkeyWithRetry(hotkey: string, callback: () => void, maxAttempts = 10): void {
  let attempt = 0
  const tryRegister = (): void => {
    attempt++
    const success = globalShortcut.register(hotkey, callback)
    if (success) {
      log.info(`Global shortcut ${hotkey} registered (attempt ${attempt})`)
      return
    }
    if (attempt < maxAttempts) {
      log.warn(`Failed to register shortcut ${hotkey}, retrying in 2s (attempt ${attempt}/${maxAttempts})`)
      setTimeout(tryRegister, 2000)
    } else {
      log.error(`Failed to register shortcut ${hotkey} after ${maxAttempts} attempts`)
    }
  }
  tryRegister()
}

function cleanup(): void {
  stopTracking()
  showCursor()
  cleanupX11()
  destroyOverlayWindow()
}

app.whenReady().then(() => {
  if (!gotTheLock) return

  const startHidden = process.argv.includes('--hidden')
  log.info(`StreamCursor starting...${startHidden ? ' (hidden)' : ''}`)

  registerIpcHandlers()
  createTray()

  const config = getConfig()
  const hotkey = config.get('toggleHotkey') as string || 'Control+Shift+K'
  registerHotkeyWithRetry(hotkey, toggleOverlay)

  if (!startHidden) {
    createSettingsWindow()
  }
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
