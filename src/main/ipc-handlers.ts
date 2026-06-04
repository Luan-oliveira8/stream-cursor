import { ipcMain, globalShortcut } from 'electron'
import { getConfig, getAllSettings } from './config'
import { setAutostart } from './autostart'
import { sendToOverlay } from './overlay-window'
import { toggleOverlay, isOverlayActive } from './index'
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

    log.info(`Setting updated: ${key} = ${JSON.stringify(value)}`)
    return true
  })

  ipcMain.handle('overlay:toggle', () => {
    toggleOverlay()
    return isOverlayActive()
  })

  ipcMain.handle('overlay:status', () => {
    return isOverlayActive()
  })
}
