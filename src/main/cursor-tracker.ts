import { sendToOverlay, getOverlayWindow } from './overlay-window'
import log from 'electron-log'
import path from 'path'

let pollTimer: ReturnType<typeof setInterval> | null = null
let x11Addon: any = null
let lastState = ''
let overlayRegistered = false
let xcursorMap: Record<string, string> = {}

function loadAddon(): boolean {
  if (x11Addon) return true

  try {
    const addonPath = path.join(__dirname, '../../build/Release/x11_addon.node')
    x11Addon = require(addonPath)
    x11Addon.init()
    log.info('X11 addon loaded successfully')
    return true
  } catch (e) {
    log.warn('Failed to load native X11 addon, trying alternative path...', e)
    try {
      const altPath = path.join(process.resourcesPath || '', 'native/x11_addon.node')
      x11Addon = require(altPath)
      x11Addon.init()
      log.info('X11 addon loaded from resources')
      return true
    } catch (e2) {
      log.error('Failed to load X11 addon from any path:', e2)
      return false
    }
  }
}

function registerOverlayWindow(): void {
  if (overlayRegistered) return
  try {
    const win = getOverlayWindow()
    if (win && !win.isDestroyed()) {
      const handle = win.getNativeWindowHandle()
      const xid = handle.readUInt32LE(0)
      x11Addon.setOverlayWindow(xid)
      overlayRegistered = true
    }
  } catch {}
}

const EXTRA_ALIASES: Record<string, string> = {
  'n-resize': 'ns-resize',
  's-resize': 'ns-resize',
  'top_side': 'ns-resize',
  'bottom_side': 'ns-resize',
  'e-resize': 'ew-resize',
  'w-resize': 'ew-resize',
  'left_side': 'ew-resize',
  'right_side': 'ew-resize',
  'nw-resize': 'nwse-resize',
  'se-resize': 'nwse-resize',
  'ne-resize': 'nesw-resize',
  'sw-resize': 'nesw-resize',
  'hand1': 'hand',
  'hand2': 'hand',
  'pointing_hand': 'hand',
  'left_ptr': 'pointer',
  'default': 'pointer',
  'arrow': 'pointer',
  'top_left_arrow': 'pointer',
  'xterm': 'text',
  'ibeam': 'text',
  'watch': 'wait',
  'left_ptr_watch': 'progress',
  'half-busy': 'progress',
  'fleur': 'move',
  'size_all': 'all-scroll',
  'cross': 'crosshair',
  'tcross': 'crosshair',
  'crossed_circle': 'not-allowed',
  'forbidden': 'not-allowed',
  'question_arrow': 'help',
  'whats_this': 'help',
  'openhand': 'grab',
  'closedhand': 'grabbing',
  'dnd-move': 'grabbing',
  'dnd-copy': 'copy',
  'dnd-link': 'alias',
  'size_ver': 'ns-resize',
  'size_hor': 'ew-resize',
  'size_fdiag': 'nwse-resize',
  'size_bdiag': 'nesw-resize',
  'v_double_arrow': 'ns-resize',
  'h_double_arrow': 'ew-resize',
  'split_h': 'col-resize',
  'split_v': 'row-resize',
  'plus': 'cell',
  'sb_v_double_arrow': 'ns-resize',
  'sb_h_double_arrow': 'ew-resize',
}

export function setXcursorMap(map: Record<string, string>): void {
  xcursorMap = { ...EXTRA_ALIASES, ...map }
}

export function startTracking(): void {
  if (pollTimer) return

  if (!loadAddon()) {
    log.error('Cannot start tracking: X11 addon not available')
    return
  }

  overlayRegistered = false
  let stateCounter = 0

  pollTimer = setInterval(() => {
    try {
      if (!overlayRegistered) registerOverlayWindow()

      const pos = x11Addon.queryPointer()
      sendToOverlay('cursor:move', { x: pos.x, y: pos.y })

      x11Addon.raiseOverlay()

      stateCounter++
      if (stateCounter >= 12) {
        stateCounter = 0
        const rawState = x11Addon.getCursorState()
        const mappedState = xcursorMap[rawState] || 'pointer'
        if (mappedState !== lastState) {
          lastState = mappedState
          sendToOverlay('cursor:state', { state: mappedState })
        }
      }
    } catch (e) {
      log.error('Tracking error:', e)
    }
  }, 8)
}

export function stopTracking(): void {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
  overlayRegistered = false
}

export function getX11Addon(): any {
  loadAddon()
  return x11Addon
}
