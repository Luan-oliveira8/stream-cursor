<script lang="ts">
  import CursorPreview from './components/CursorPreview.svelte'
  import ColorPicker from './components/ColorPicker.svelte'
  import SizeSlider from './components/SizeSlider.svelte'
  import StyleSelector from './components/StyleSelector.svelte'
  import HotkeyInput from './components/HotkeyInput.svelte'
  import AutostartToggle from './components/AutostartToggle.svelte'

  declare global {
    interface Window {
      streamCursorSettings: {
        getSettings: () => Promise<any>
        setSetting: (key: string, value: unknown) => Promise<boolean>
        toggleOverlay: () => Promise<boolean>
        getOverlayStatus: () => Promise<boolean>
        onSettingsUpdated: (callback: (settings: any) => void) => void
      }
    }
  }

  let settings = $state({
    cursorStyle: 'neon',
    primaryColor: '#00FF41',
    strokeColor: '#003300',
    glowEnabled: true,
    glowRadius: 4,
    cursorSize: 1.0,
    hideSystemCursor: true,
    toggleHotkey: 'CommandOrControl+Shift+C',
    autostart: false,
    startMinimized: true
  })

  let overlayActive = $state(true)
  let loaded = $state(false)

  async function loadSettings() {
    const s = await window.streamCursorSettings.getSettings()
    settings = { ...settings, ...s }
    overlayActive = await window.streamCursorSettings.getOverlayStatus()
    loaded = true
  }

  async function updateSetting(key: string, value: unknown) {
    (settings as any)[key] = value
    await window.streamCursorSettings.setSetting(key, value)
  }

  async function toggleOverlay() {
    overlayActive = await window.streamCursorSettings.toggleOverlay()
  }

  async function resetDefaults() {
    const defaults = {
      cursorStyle: 'neon',
      primaryColor: '#00FF41',
      strokeColor: '#003300',
      glowEnabled: true,
      glowRadius: 4,
      cursorSize: 1.0,
      hideSystemCursor: true,
      toggleHotkey: 'CommandOrControl+Shift+C',
      autostart: false,
      startMinimized: true
    }
    for (const [key, value] of Object.entries(defaults)) {
      await window.streamCursorSettings.setSetting(key, value)
    }
    settings = { ...defaults }
  }

  loadSettings()
</script>

{#if loaded}
<div class="container">
  <header>
    <div class="logo">
      <span class="icon">◎</span>
      <h1>StreamCursor</h1>
    </div>
    <button class="toggle-btn" class:active={overlayActive} onclick={toggleOverlay}>
      {overlayActive ? '● Ativo' : '○ Inativo'}
    </button>
  </header>

  <div class="content">
    <section>
      <h2>Estilo do Cursor</h2>
      <StyleSelector
        value={settings.cursorStyle}
        onChange={(v) => updateSetting('cursorStyle', v)}
      />
    </section>

    <section>
      <h2>Cores</h2>
      <div class="color-row">
        <ColorPicker
          label="Cor primária"
          value={settings.primaryColor}
          onChange={(v) => updateSetting('primaryColor', v)}
        />
        <ColorPicker
          label="Cor do contorno"
          value={settings.strokeColor}
          onChange={(v) => updateSetting('strokeColor', v)}
        />
      </div>
      <div class="glow-row">
        <label class="checkbox-label">
          <input type="checkbox" checked={settings.glowEnabled}
            onchange={(e) => updateSetting('glowEnabled', e.currentTarget.checked)} />
          Efeito Glow
        </label>
        {#if settings.glowEnabled}
          <div class="slider-inline">
            <span>Raio:</span>
            <input type="range" min="1" max="10" step="1"
              value={settings.glowRadius}
              oninput={(e) => updateSetting('glowRadius', parseInt(e.currentTarget.value))} />
            <span class="value">{settings.glowRadius}px</span>
          </div>
        {/if}
      </div>
    </section>

    <section>
      <h2>Tamanho</h2>
      <SizeSlider
        value={settings.cursorSize}
        onChange={(v) => updateSetting('cursorSize', v)}
      />
    </section>

    <section>
      <h2>Preview</h2>
      <CursorPreview {settings} />
    </section>

    <section>
      <h2>Atalho de Teclado</h2>
      <HotkeyInput
        value={settings.toggleHotkey}
        onChange={(v) => updateSetting('toggleHotkey', v)}
      />
    </section>

    <section>
      <h2>Sistema</h2>
      <AutostartToggle
        autostart={settings.autostart}
        startMinimized={settings.startMinimized}
        hideSystemCursor={settings.hideSystemCursor}
        onAutostartChange={(v) => updateSetting('autostart', v)}
        onMinimizedChange={(v) => updateSetting('startMinimized', v)}
        onHideCursorChange={(v) => updateSetting('hideSystemCursor', v)}
      />
    </section>

    <div class="actions">
      <button class="btn-secondary" onclick={resetDefaults}>Restaurar Padrão</button>
    </div>
  </div>
</div>
{:else}
<div class="loading">Carregando...</div>
{/if}

<style>
  .container {
    max-width: 580px;
    margin: 0 auto;
    padding: 20px;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #2a2a4a;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .icon {
    font-size: 28px;
    color: #00FF41;
  }

  h1 {
    font-size: 22px;
    font-weight: 600;
    color: #fff;
  }

  h2 {
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #888;
    margin-bottom: 12px;
  }

  section {
    margin-bottom: 24px;
    padding: 16px;
    background: #16213e;
    border-radius: 10px;
    border: 1px solid #2a2a4a;
  }

  .toggle-btn {
    padding: 8px 20px;
    border: 2px solid #00FF41;
    border-radius: 20px;
    background: transparent;
    color: #00FF41;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .toggle-btn.active {
    background: #00FF41;
    color: #1a1a2e;
  }

  .toggle-btn:hover {
    opacity: 0.85;
  }

  .color-row {
    display: flex;
    gap: 16px;
    margin-bottom: 12px;
  }

  .glow-row {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 14px;
  }

  .checkbox-label input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #00FF41;
  }

  .slider-inline {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #aaa;
  }

  .slider-inline input[type="range"] {
    width: 120px;
    accent-color: #00FF41;
  }

  .value {
    color: #00FF41;
    font-weight: 600;
    min-width: 35px;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    padding: 8px 0;
  }

  .btn-secondary {
    padding: 10px 24px;
    border: 1px solid #444;
    border-radius: 8px;
    background: transparent;
    color: #aaa;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-secondary:hover {
    border-color: #888;
    color: #fff;
  }

  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-size: 18px;
    color: #888;
  }

  .content {
    padding-bottom: 20px;
  }
</style>
