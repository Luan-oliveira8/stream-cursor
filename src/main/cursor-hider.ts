import { getX11Addon } from './cursor-tracker'
import log from 'electron-log'

export function hideCursor(): void {
  try {
    const addon = getX11Addon()
    if (addon && !addon.isCursorHidden()) {
      addon.hideCursor()
    }
  } catch (e) {
    log.error('Failed to hide cursor:', e)
  }
}

export function showCursor(): void {
  try {
    const addon = getX11Addon()
    if (addon && addon.isCursorHidden()) {
      addon.showCursor()
    }
  } catch (e) {
    log.error('Failed to show cursor:', e)
  }
}

export function cleanupX11(): void {
  try {
    const addon = getX11Addon()
    if (addon) {
      addon.showCursor()
      addon.cleanup()
    }
  } catch (e) {
    log.error('Failed to cleanup X11:', e)
  }
}
