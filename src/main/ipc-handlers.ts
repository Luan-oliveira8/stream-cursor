import { ipcMain, globalShortcut } from 'electron'
import { getConfig, getAllSettings } from './config'
import { setAutostart } from './autostart'
import { sendToOverlay } from './overlay-window'
import { toggleOverlay, isOverlayActive, applyTheme } from './index'
import { getAvailableThemes } from './theme-loader'
import log from 'electron-log'

export function registerIpcHandlers(): void {
  ipcMain.handle('settings:get', () => {
    return getAllSettings()
  })

  ipcMain.handle('settings:set', (_event, key: string, value: unknown) => {
    const config = getConfig()
    config.set(key as any, value as any)

    sendToOverlay('settings:updated', getAllSettings())

    if (key === 'autostart') {
      setAutostart(value as boolean)
    }

    if (key === 'toggleHotkey') {
      globalShortcut.unregisterAll()
      globalShortcut.register(value as string, toggleOverlay)
    }

    if (key === 'cursorTheme') {
      applyTheme(value as string)
    }

    return true
  })

  ipcMain.handle('overlay:toggle', () => {
    toggleOverlay()
    return isOverlayActive()
  })

  ipcMain.handle('overlay:status', () => {
    return isOverlayActive()
  })

  ipcMain.handle('themes:list', () => {
    return getAvailableThemes()
  })
}
