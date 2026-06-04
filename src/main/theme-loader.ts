import { app } from 'electron'
import path from 'path'
import fs from 'fs'
import log from 'electron-log'

const isDev = !app.isPackaged

interface ShapeDef {
  name: string
  hotspot: [number, number]
  xcursor: string[]
}

interface StyleDef {
  id: string
  name: string
}

interface MascotDef {
  id: string
  name: string
}

interface CursorsManifest {
  viewBox: number
  exportSize: number
  styles: StyleDef[]
  shapes: ShapeDef[]
}

interface MascotManifest {
  mascots: MascotDef[]
}

export interface ThemeInfo {
  id: string
  name: string
  type: 'cursor' | 'mascot'
  previewSvg?: string
}

export interface LoadedTheme {
  id: string
  name: string
  shapes: Record<string, { svg: string; hotspotX: number; hotspotY: number; width: number; height: number }>
  xcursorMap: Record<string, string>
}

function getResourcePath(): string {
  if (isDev) {
    return path.join(__dirname, '../../resources')
  }
  return path.join(process.resourcesPath || '', 'resources')
}

let cursorsManifest: CursorsManifest | null = null
let mascotManifest: MascotManifest | null = null

function loadManifests(): void {
  const resPath = getResourcePath()
  try {
    const cm = fs.readFileSync(path.join(resPath, 'cursors/manifest.json'), 'utf-8')
    cursorsManifest = JSON.parse(cm)
  } catch (e) {
    log.error('Failed to load cursors manifest:', e)
  }
  try {
    const mm = fs.readFileSync(path.join(resPath, 'cursors-mascote/manifest.json'), 'utf-8')
    mascotManifest = JSON.parse(mm)
  } catch (e) {
    log.error('Failed to load mascot manifest:', e)
  }
}

export function getAvailableThemes(): ThemeInfo[] {
  if (!cursorsManifest) loadManifests()

  const themes: ThemeInfo[] = []

  if (cursorsManifest) {
    for (const style of cursorsManifest.styles) {
      const resPath = getResourcePath()
      let previewSvg = ''
      try {
        previewSvg = fs.readFileSync(path.join(resPath, 'cursors', style.id, 'pointer.svg'), 'utf-8')
      } catch {}
      themes.push({ id: style.id, name: style.name, type: 'cursor', previewSvg })
    }
  }

  if (mascotManifest) {
    for (const mascot of mascotManifest.mascots) {
      const resPath = getResourcePath()
      let previewSvg = ''
      try {
        previewSvg = fs.readFileSync(path.join(resPath, 'cursors-mascote', mascot.id, 'pointer.svg'), 'utf-8')
      } catch {}
      themes.push({ id: `mascot-${mascot.id}`, name: mascot.name, type: 'mascot', previewSvg })
    }
  }

  return themes
}

export function loadTheme(themeId: string): LoadedTheme | null {
  if (!cursorsManifest) loadManifests()
  if (!cursorsManifest) return null

  const resPath = getResourcePath()
  let themeDir: string
  let themeName: string

  const isMascot = themeId.startsWith('mascot-')
  if (isMascot) {
    const mascotId = themeId.replace('mascot-', '')
    themeDir = path.join(resPath, 'cursors-mascote', mascotId)
    const mascot = mascotManifest?.mascots.find(m => m.id === mascotId)
    themeName = mascot?.name || mascotId
  } else {
    themeDir = path.join(resPath, 'cursors', themeId)
    const style = cursorsManifest.styles.find(s => s.id === themeId)
    themeName = style?.name || themeId
  }

  if (!fs.existsSync(themeDir)) {
    log.error(`Theme directory not found: ${themeDir}`)
    return null
  }

  const shapes: LoadedTheme['shapes'] = {}
  const xcursorMap: Record<string, string> = {}

  for (const shape of cursorsManifest.shapes) {
    const svgPath = path.join(themeDir, `${shape.name}.svg`)
    try {
      const svg = fs.readFileSync(svgPath, 'utf-8')
      shapes[shape.name] = {
        svg,
        hotspotX: shape.hotspot[0],
        hotspotY: shape.hotspot[1],
        width: cursorsManifest.viewBox,
        height: cursorsManifest.viewBox
      }

      for (const xname of shape.xcursor) {
        xcursorMap[xname] = shape.name
      }
    } catch {
      // SVG not found for this shape in this theme, skip
    }
  }

  log.info(`Theme loaded: ${themeName} (${Object.keys(shapes).length} shapes)`)

  return { id: themeId, name: themeName, shapes, xcursorMap }
}
