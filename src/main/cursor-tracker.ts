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

export function setXcursorMap(map: Record<string, string>): void {
  xcursorMap = map
}

export function startTracking(): void {
  if (pollTimer) return

  if (!loadAddon()) {
    log.error('Cannot start tracking: X11 addon not available')
    return
  }

  overlayRegistered = false

  pollTimer = setInterval(() => {
    try {
      if (!overlayRegistered) registerOverlayWindow()

      const pos = x11Addon.queryPointer()
      sendToOverlay('cursor:move', { x: pos.x, y: pos.y })

      x11Addon.raiseOverlay()

      const rawState = x11Addon.getCursorState()
      const mappedState = xcursorMap[rawState] || 'pointer'
      if (mappedState !== lastState) {
        lastState = mappedState
        sendToOverlay('cursor:state', { state: mappedState })
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
