import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('streamCursor', {
  onCursorMove: (callback: (pos: { x: number; y: number }) => void) => {
    ipcRenderer.on('cursor:move', (_event, pos) => callback(pos))
  },
  onCursorState: (callback: (data: { state: string }) => void) => {
    ipcRenderer.on('cursor:state', (_event, data) => callback(data))
  },
  onSettingsUpdated: (callback: (settings: any) => void) => {
    ipcRenderer.on('settings:updated', (_event, settings) => callback(settings))
  },
  onThemeLoaded: (callback: (theme: any) => void) => {
    ipcRenderer.on('theme:loaded', (_event, theme) => callback(theme))
  }
})
