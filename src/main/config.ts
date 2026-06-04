import Store from 'electron-store'

interface StreamCursorConfig {
  cursorTheme: string
  cursorSize: number
  hideSystemCursor: boolean
  toggleHotkey: string
  autostart: boolean
  startMinimized: boolean
}

const defaults: StreamCursorConfig = {
  cursorTheme: '05-neon-green',
  cursorSize: 1.0,
  hideSystemCursor: true,
  toggleHotkey: 'CommandOrControl+Shift+C',
  autostart: false,
  startMinimized: true
}

let store: Store<StreamCursorConfig> | null = null

export function getConfig(): Store<StreamCursorConfig> {
  if (!store) {
    store = new Store<StreamCursorConfig>({
      name: 'stream-cursor-config',
      defaults
    })
  }
  return store
}

export function getAllSettings(): StreamCursorConfig {
  const config = getConfig()
  return {
    cursorTheme: config.get('cursorTheme'),
    cursorSize: config.get('cursorSize'),
    hideSystemCursor: config.get('hideSystemCursor'),
    toggleHotkey: config.get('toggleHotkey'),
    autostart: config.get('autostart'),
    startMinimized: config.get('startMinimized')
  }
}
