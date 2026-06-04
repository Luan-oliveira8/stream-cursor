import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('streamCursorSettings', {
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSetting: (key: string, value: unknown) => ipcRenderer.invoke('settings:set', key, value),
  toggleOverlay: () => ipcRenderer.invoke('overlay:toggle'),
  getOverlayStatus: () => ipcRenderer.invoke('overlay:status'),
  getThemes: () => ipcRenderer.invoke('themes:list'),
  onSettingsUpdated: (callback: (settings: any) => void) => {
    ipcRenderer.on('settings:updated', (_event, settings) => callback(settings))
  }
})
