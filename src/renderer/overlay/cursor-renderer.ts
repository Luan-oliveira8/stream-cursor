interface ShapeData {
  svg: string
  hotspotX: number
  hotspotY: number
  width: number
  height: number
}

export class CursorRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private currentPos = { x: -100, y: -100 }
  private lastDrawnPos = { x: -200, y: -200 }
  private currentState = 'pointer'
  private cursorImages: Map<string, HTMLImageElement> = new Map()
  private shapeDefs: Map<string, ShapeData> = new Map()
  private cursorSize = 1.0
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
  }

  async loadTheme(themeData: Record<string, ShapeData>): Promise<void> {
    this.cursorImages.clear()
    this.shapeDefs.clear()

    for (const [name, shape] of Object.entries(themeData)) {
      this.shapeDefs.set(name, shape)

      const img = new Image()
      await new Promise<void>((resolve) => {
        img.onload = () => {
          this.cursorImages.set(name, img)
          resolve()
        }
        img.onerror = () => resolve()
        img.src = shape.svg
      })
    }
  }

  updatePosition(x: number, y: number): void {
    this.currentPos.x = x
    this.currentPos.y = y
  }

  updateState(state: string): void {
    if (this.shapeDefs.has(state)) {
      this.currentState = state
    }
  }

  setCursorSize(size: number): void {
    this.cursorSize = size
  }

  start(): void {
    const render = (): void => {
      const def = this.shapeDefs.get(this.currentState)
      if (!def) {
        this.animationFrame = requestAnimationFrame(render)
        return
      }

      const isAnimated = this.currentState === 'wait' || this.currentState === 'progress'
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
        const scale = this.cursorSize
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
