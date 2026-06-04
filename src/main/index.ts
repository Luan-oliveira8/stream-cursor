import { app, globalShortcut } from 'electron'
import { createOverlayWindow, destroyOverlayWindow } from './overlay-window'
import { createSettingsWindow, toggleSettingsWindow } from './settings-window'
import { createTray, updateTrayState } from './tray'
import { registerIpcHandlers } from './ipc-handlers'
import { startTracking, stopTracking } from './cursor-tracker'
import { hideCursor, showCursor, cleanupX11 } from './cursor-hider'
import { getConfig } from './config'
import log from 'electron-log'

// ===== SINGLE INSTANCE LOCK =====
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  log.warn('Another instance is already running. Quitting.')
  app.quit()
}

app.on('second-instance', () => {
  createSettingsWindow()
})

// ===== APP STATE =====
let overlayActive = false

app.commandLine.appendSwitch('enable-transparent-visuals')

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
  log.info('Cleaning up...')
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

app.on('window-all-closed', () => {
  // Do not quit - app lives in system tray
})

process.on('uncaughtException', (err) => {
  log.error('Uncaught exception:', err)
  cleanup()
  app.quit()
})

process.on('unhandledRejection', (reason) => {
  log.error('Unhandled rejection:', reason)
})
