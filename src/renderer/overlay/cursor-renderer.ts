import { CURSOR_DEFS } from './cursor-svgs'

interface CursorSettings {
  primaryColor: string
  strokeColor: string
  glowEnabled: boolean
  glowRadius: number
  cursorSize: number
  cursorStyle: string
}

const DEFAULT_SETTINGS: CursorSettings = {
  primaryColor: '#00FF41',
  strokeColor: '#003300',
  glowEnabled: true,
  glowRadius: 4,
  cursorSize: 1.0,
  cursorStyle: 'neon'
}

const STYLE_PRESETS: Record<string, Partial<CursorSettings>> = {
  neon: { primaryColor: '#00FF41', strokeColor: '#003300', glowEnabled: true, glowRadius: 4 },
  classic: { primaryColor: '#FFFFFF', strokeColor: '#000000', glowEnabled: false, glowRadius: 0 },
  minimal: { primaryColor: '#FF4444', strokeColor: '#440000', glowEnabled: true, glowRadius: 2 }
}

export class CursorRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private currentPos = { x: -100, y: -100 }
  private lastDrawnPos = { x: -200, y: -200 }
  private currentState = 'arrow'
  private cursorImages: Map<string, HTMLImageElement> = new Map()
  private settings: CursorSettings = { ...DEFAULT_SETTINGS }
  private animationFrame = 0
  private rotationAngle = 0
  private prevRect = { x: 0, y: 0, w: 0, h: 0 }

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d', { alpha: true })!
    this.resize()
    window.addEventListener('resize', () => this.resize())
  }

  private resize(): void {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
    console.log(`[StreamCursor] Canvas resized: ${this.canvas.width}x${this.canvas.height}`)
  }

  async loadCursors(settings?: Partial<CursorSettings>): Promise<void> {
    if (settings) {
      Object.assign(this.settings, settings)
    }

    const s = this.settings
    const fill = s.primaryColor
    const stroke = s.strokeColor
    const gr = s.glowEnabled ? s.glowRadius : 0
    const gc = s.primaryColor

    this.cursorImages.clear()

    const entries = Object.entries(CURSOR_DEFS)
    let loaded = 0

    for (const [state, def] of entries) {
      try {
        const svgString = def.svg(fill, stroke, gr, gc)
        const encoded = btoa(unescape(encodeURIComponent(svgString)))
        const dataUrl = `data:image/svg+xml;base64,${encoded}`

        const img = new Image()
        await new Promise<void>((resolve) => {
          img.onload = () => {
            this.cursorImages.set(state, img)
            loaded++
            resolve()
          }
          img.onerror = (err) => {
            console.error(`[StreamCursor] Failed to load cursor SVG: ${state}`, err)
            resolve()
          }
          img.src = dataUrl
        })
      } catch (err) {
        console.error(`[StreamCursor] Error creating cursor: ${state}`, err)
      }
    }

    console.log(`[StreamCursor] Loaded ${loaded}/${entries.length} cursor images`)
  }

  updatePosition(x: number, y: number): void {
    this.currentPos.x = x
    this.currentPos.y = y
  }

  updateState(state: string): void {
    if (CURSOR_DEFS[state]) {
      this.currentState = state
    }
  }

  updateSettings(settings: Partial<CursorSettings>): void {
    const styleChanged = settings.cursorStyle && settings.cursorStyle !== this.settings.cursorStyle
    Object.assign(this.settings, settings)

    if (styleChanged && STYLE_PRESETS[this.settings.cursorStyle]) {
      Object.assign(this.settings, STYLE_PRESETS[this.settings.cursorStyle])
    }

    this.loadCursors()
  }

  start(): void {
    const render = (): void => {
      const def = CURSOR_DEFS[this.currentState]
      if (!def) {
        this.animationFrame = requestAnimationFrame(render)
        return
      }

      const isAnimated = def.animated
      const moved = this.currentPos.x !== this.lastDrawnPos.x ||
                    this.currentPos.y !== this.lastDrawnPos.y

      if (!moved && !isAnimated) {
        this.animationFrame = requestAnimationFrame(render)
        return
      }

      this.ctx.clearRect(
        this.prevRect.x - 10,
        this.prevRect.y - 10,
        this.prevRect.w + 20,
        this.prevRect.h + 20
      )

      const cursor = this.cursorImages.get(this.currentState)
      if (cursor) {
        const scale = this.settings.cursorSize
        const drawW = def.width * scale
        const drawH = def.height * scale
        const drawX = this.currentPos.x - def.hotspotX * scale
        const drawY = this.currentPos.y - def.hotspotY * scale

        if (isAnimated) {
          this.ctx.save()
          this.ctx.translate(this.currentPos.x, this.currentPos.y)
          this.ctx.rotate(this.rotationAngle)
          this.rotationAngle += 0.08
          this.ctx.drawImage(cursor, -drawW / 2, -drawH / 2, drawW, drawH)
          this.ctx.restore()

          this.prevRect = {
            x: this.currentPos.x - drawW,
            y: this.currentPos.y - drawH,
            w: drawW * 2,
            h: drawH * 2
          }
        } else {
          this.ctx.drawImage(cursor, drawX, drawY, drawW, drawH)
          this.prevRect = { x: drawX, y: drawY, w: drawW, h: drawH }
        }
      }

      this.lastDrawnPos.x = this.currentPos.x
      this.lastDrawnPos.y = this.currentPos.y
      this.animationFrame = requestAnimationFrame(render)
    }

    this.animationFrame = requestAnimationFrame(render)
  }

  stop(): void {
    cancelAnimationFrame(this.animationFrame)
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }
}
