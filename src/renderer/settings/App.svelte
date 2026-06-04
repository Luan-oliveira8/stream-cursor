<script lang="ts">
  import StyleSelector from './components/StyleSelector.svelte'
  import SizeSlider from './components/SizeSlider.svelte'
  import HotkeyInput from './components/HotkeyInput.svelte'
  import AutostartToggle from './components/AutostartToggle.svelte'

  declare global {
    interface Window {
      streamCursorSettings: {
        getSettings: () => Promise<any>
        setSetting: (key: string, value: unknown) => Promise<boolean>
        toggleOverlay: () => Promise<boolean>
        getOverlayStatus: () => Promise<boolean>
        getThemes: () => Promise<any[]>
        onSettingsUpdated: (callback: (settings: any) => void) => void
      }
    }
  }

  let settings = $state({
    cursorTheme: '05-neon-green',
    cursorSize: 1.0,
    hideSystemCursor: true,
    toggleHotkey: 'CommandOrControl+Shift+C',
    autostart: false,
    startMinimized: true
  })

  let themes: any[] = $state([])
  let overlayActive = $state(true)
  let loaded = $state(false)

  async function load() {
    const s = await window.streamCursorSettings.getSettings()
    settings = { ...settings, ...s }
    overlayActive = await window.streamCursorSettings.getOverlayStatus()
    themes = await window.streamCursorSettings.getThemes()
    loaded = true
  }

  async function updateSetting(key: string, value: unknown) {
    (settings as any)[key] = value
    await window.streamCursorSettings.setSetting(key, value)
  }

  async function toggleOverlay() {
    overlayActive = await window.streamCursorSettings.toggleOverlay()
  }

  load()
</script>

{#if loaded}
<div class="container">
  <header>
    <div class="logo">
      <span class="icon">◎</span>
      <h1>StreamCursor</h1>
    </div>
    <button class="toggle-btn" class:active={overlayActive} onclick={toggleOverlay}>
      {overlayActive ? 'ON' : 'OFF'}
    </button>
  </header>

  <div class="content">
    <section>
      <h2>Cursor Theme</h2>
      <StyleSelector
        {themes}
        value={settings.cursorTheme}
        onChange={(v) => updateSetting('cursorTheme', v)}
      />
    </section>

    <section>
      <h2>Size</h2>
      <SizeSlider
        value={settings.cursorSize}
        onChange={(v) => updateSetting('cursorSize', v)}
      />
    </section>

    <section>
      <h2>Keyboard Shortcut</h2>
      <HotkeyInput
        value={settings.toggleHotkey}
        onChange={(v) => updateSetting('toggleHotkey', v)}
      />
    </section>

    <section>
      <h2>System</h2>
      <AutostartToggle
        autostart={settings.autostart}
        startMinimized={settings.startMinimized}
        hideSystemCursor={settings.hideSystemCursor}
        onAutostartChange={(v) => updateSetting('autostart', v)}
        onMinimizedChange={(v) => updateSetting('startMinimized', v)}
        onHideCursorChange={(v) => updateSetting('hideSystemCursor', v)}
      />
    </section>
  </div>
</div>
{:else}
<div class="loading">Loading...</div>
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

  .icon { font-size: 28px; color: #00FF41; }
  h1 { font-size: 22px; font-weight: 600; color: #fff; }

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

  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-size: 18px;
    color: #888;
  }

  .content { padding-bottom: 20px; }
</style>
