import { Tray, Menu, nativeImage, app } from 'electron'
import { join } from 'path'
import { toggleOverlay, openSettings, toggleSettings } from './index'

let tray: Tray | null = null
let isActive = false

function rebuildMenu(): void {
  if (!tray) return

  const menu = Menu.buildFromTemplate([
    {
      label: isActive ? 'Desativar Overlay' : 'Ativar Overlay',
      click: () => toggleOverlay()
    },
    { type: 'separator' },
    {
      label: 'Configuracoes',
      click: () => openSettings()
    },
    { type: 'separator' },
    {
      label: 'Sair',
      click: () => {
        app.exit(0)
      }
    }
  ])

  tray.setContextMenu(menu)
}

export function createTray(): void {
  const iconPath = join(__dirname, '../../resources/tray-icon.png')

  let icon: Electron.NativeImage
  try {
    icon = nativeImage.createFromPath(iconPath)
    if (icon.isEmpty()) {
      icon = createFallbackIcon()
    }
  } catch {
    icon = createFallbackIcon()
  }

  tray = new Tray(icon.resize({ width: 22, height: 22 }))
  tray.setToolTip('StreamCursor')

  rebuildMenu()

  tray.on('click', () => {
    toggleSettings()
  })
}

function createFallbackIcon(): Electron.NativeImage {
  const size = 22
  const canvas = Buffer.alloc(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      const inCircle = Math.sqrt((x - 11) ** 2 + (y - 11) ** 2) < 9
      canvas[i] = inCircle ? 0 : 0
      canvas[i + 1] = inCircle ? 255 : 0
      canvas[i + 2] = inCircle ? 65 : 0
      canvas[i + 3] = inCircle ? 255 : 0
    }
  }
  return nativeImage.createFromBuffer(canvas, { width: size, height: size })
}

export function updateTrayState(active: boolean): void {
  isActive = active
  if (tray) {
    tray.setToolTip(active ? 'StreamCursor - Ativo' : 'StreamCursor - Inativo')
    rebuildMenu()
  }
}
