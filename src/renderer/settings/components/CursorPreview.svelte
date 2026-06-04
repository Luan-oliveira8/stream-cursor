<script lang="ts">
  import { CURSOR_DEFS } from '../../overlay/cursor-svgs'

  interface Props {
    settings: {
      primaryColor: string
      strokeColor: string
      glowEnabled: boolean
      glowRadius: number
      cursorSize: number
    }
  }
  let { settings }: Props = $props()

  let canvas: HTMLCanvasElement
  let animFrame = 0
  let rotation = 0
  let currentDemo = $state(0)

  const demoStates = ['arrow', 'pointer', 'text', 'wait', 'move', 'not-allowed', 'crosshair', 'resize-ns', 'resize-ew']
  const cursorImages: Map<string, HTMLImageElement> = new Map()

  async function loadCursors() {
    const s = settings
    const fill = s.primaryColor
    const stroke = s.strokeColor
    const gr = s.glowEnabled ? s.glowRadius : 0

    cursorImages.clear()
    for (const [state, def] of Object.entries(CURSOR_DEFS)) {
      const svgString = def.svg(fill, stroke, gr, fill)
      const blob = new Blob([svgString], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const img = new Image()
      await new Promise<void>((resolve) => {
        img.onload = () => resolve()
        img.onerror = () => resolve()
        img.src = url
      })
      cursorImages.set(state, img)
      URL.revokeObjectURL(url)
    }
  }

  function render() {
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const w = canvas.width
    const h = canvas.height

    ctx.clearRect(0, 0, w, h)

    ctx.fillStyle = '#0a0a1a'
    ctx.fillRect(0, 0, w, h)

    ctx.strokeStyle = '#1a1a3a'
    for (let x = 0; x < w; x += 20) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h)
      ctx.stroke()
    }
    for (let y = 0; y < h; y += 20) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
    }

    const state = demoStates[currentDemo]
    const def = CURSOR_DEFS[state]
    const img = cursorImages.get(state)

    if (img && def) {
      const scale = settings.cursorSize
      const size = def.width * scale
      const cx = w / 2
      const cy = h / 2

      if (def.animated) {
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(rotation)
        rotation += 0.05
        ctx.drawImage(img, -size / 2, -size / 2, size, size)
        ctx.restore()
      } else {
        ctx.drawImage(img, cx - (def.hotspotX * scale), cy - (def.hotspotY * scale), size, size)
      }
    }

    ctx.fillStyle = '#555'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(state, w / 2, h - 8)

    animFrame = requestAnimationFrame(render)
  }

  $effect(() => {
    void settings.primaryColor
    void settings.strokeColor
    void settings.glowEnabled
    void settings.glowRadius
    void settings.cursorSize
    loadCursors().then(() => {
      cancelAnimationFrame(animFrame)
      render()
    })
  })

  function nextDemo() {
    currentDemo = (currentDemo + 1) % demoStates.length
  }

  function prevDemo() {
    currentDemo = (currentDemo - 1 + demoStates.length) % demoStates.length
  }
</script>

<div class="preview-container">
  <canvas bind:this={canvas} width="320" height="180" class="preview-canvas"></canvas>
  <div class="nav-buttons">
    <button onclick={prevDemo}>◀</button>
    <span class="state-label">{demoStates[currentDemo]}</span>
    <button onclick={nextDemo}>▶</button>
  </div>
</div>

<style>
  .preview-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .preview-canvas {
    border-radius: 8px;
    border: 1px solid #2a2a4a;
    width: 100%;
    max-width: 320px;
    height: auto;
  }

  .nav-buttons {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .nav-buttons button {
    width: 32px;
    height: 32px;
    border: 1px solid #2a2a4a;
    border-radius: 6px;
    background: transparent;
    color: #aaa;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nav-buttons button:hover {
    border-color: #00FF41;
    color: #00FF41;
  }

  .state-label {
    font-size: 12px;
    color: #888;
    min-width: 80px;
    text-align: center;
    font-family: monospace;
  }
</style>
