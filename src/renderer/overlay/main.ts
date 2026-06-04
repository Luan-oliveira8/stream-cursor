import { CursorRenderer } from './cursor-renderer'

declare global {
  interface Window {
    streamCursor: {
      onCursorMove: (callback: (pos: { x: number; y: number }) => void) => void
      onCursorState: (callback: (data: { state: string }) => void) => void
      onSettingsUpdated: (callback: (settings: any) => void) => void
    }
  }
}

async function init(): Promise<void> {
  const canvas = document.getElementById('cursor-canvas') as HTMLCanvasElement
  if (!canvas) return

  const renderer = new CursorRenderer(canvas)
  await renderer.loadCursors()
  renderer.start()

  window.streamCursor.onCursorMove((pos) => {
    renderer.updatePosition(pos.x, pos.y)
  })

  window.streamCursor.onCursorState((data) => {
    renderer.updateState(data.state)
  })

  window.streamCursor.onSettingsUpdated((settings) => {
    renderer.updateSettings(settings)
  })
}

init()
