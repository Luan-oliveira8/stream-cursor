import Store from 'electron-store'

interface StreamCursorConfig {
  cursorStyle: 'neon' | 'classic' | 'minimal'
  primaryColor: string
  strokeColor: string
  glowEnabled: boolean
  glowRadius: number
  cursorSize: number
  enabled: boolean
  hideSystemCursor: boolean
  toggleHotkey: string
  autostart: boolean
  startMinimized: boolean
  pollRate: number
}

const defaults: StreamCursorConfig = {
  cursorStyle: 'neon',
  primaryColor: '#00FF41',
  strokeColor: '#003300',
  glowEnabled: true,
  glowRadius: 4,
  cursorSize: 1.0,
  enabled: true,
  hideSystemCursor: true,
  toggleHotkey: 'CommandOrControl+Shift+C',
  autostart: false,
  startMinimized: true,
  pollRate: 120
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
    cursorStyle: config.get('cursorStyle'),
    primaryColor: config.get('primaryColor'),
    strokeColor: config.get('strokeColor'),
    glowEnabled: config.get('glowEnabled'),
    glowRadius: config.get('glowRadius'),
    cursorSize: config.get('cursorSize'),
    enabled: config.get('enabled'),
    hideSystemCursor: config.get('hideSystemCursor'),
    toggleHotkey: config.get('toggleHotkey'),
    autostart: config.get('autostart'),
    startMinimized: config.get('startMinimized'),
    pollRate: config.get('pollRate')
  }
}
