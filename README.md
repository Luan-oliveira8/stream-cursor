# StreamCursor

Cursor overlay para Linux que resolve o problema do cursor nao aparecer ao compartilhar tela no Discord, OBS, Google Meet, Zoom e Teams.

## Como funciona

O app cria uma janela transparente fullscreen always-on-top que desenha um cursor SVG customizado na posicao real do mouse. Como e uma janela normal do sistema, ferramentas de screen share capturam ela junto com o resto da tela.

## Requisitos

- Node.js 18+
- Linux com X11 (Ubuntu 20.04+, Mint, Fedora, Arch)
- Bibliotecas: `libx11-dev`, `libxfixes-dev`

```bash
# Ubuntu/Mint/Debian
sudo apt install libx11-dev libxfixes-dev

# Fedora
sudo dnf install libX11-devel libXfixes-devel

# Arch
sudo pacman -S libx11 libxfixes
```

## Instalacao

```bash
git clone <repo-url>
cd stream-cursor
npm install
npx node-gyp configure build
```

## Uso

```bash
# Desenvolvimento (com hot-reload)
npm run dev

# Build para producao
npm run build

# Executar build
npx electron out/main/index.js
```

## Atalhos

| Atalho | Acao |
|---|---|
| `Ctrl+Shift+C` | Liga/desliga overlay |
| Tray > Configuracoes | Abre painel de settings |
| Tray > Sair | Fecha o app |

## Configuracoes

Acesse pelo icone na bandeja do sistema (system tray):

- **Estilo**: Neon (verde brilhante), Classico (branco), Minimal (vermelho)
- **Cores**: Cor primaria e contorno personalizaveis
- **Glow**: Efeito neon com raio ajustavel
- **Tamanho**: 0.5x ate 3x (32px a 96px)
- **Hotkey**: Atalho customizavel
- **Autostart**: Iniciar com o sistema

## Build dos instaladores

```bash
# Todos os formatos Linux
npm run dist:linux

# Windows
npm run dist:win
```

Gera: `.AppImage`, `.deb`, `.rpm`, `.exe`

## Restaurar cursor

Se o app fechar inesperadamente com o cursor escondido:

```bash
bash scripts/restore-cursor.sh
```

## Arquitetura

```
src/
  main/          - Electron main process (tray, overlay, tracking)
  native/        - Addon C/N-API (XQueryPointer, XFixes)
  preload/       - Context bridge (IPC seguro)
  renderer/
    overlay/     - Canvas que desenha o cursor (transparente)
    settings/    - UI de configuracoes (Svelte 5)
```

## Stack

- Electron 33 + electron-vite
- TypeScript
- Svelte 5 (settings UI)
- Native N-API addon em C (X11/XFixes)
- Canvas 2D (rendering 60fps+)
- electron-store (persistencia)
