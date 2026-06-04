<script lang="ts">
  interface ThemeInfo {
    id: string
    name: string
    type: 'cursor' | 'mascot'
    previewSvg?: string
  }

  interface Props {
    themes: ThemeInfo[]
    value: string
    onChange: (value: string) => void
  }
  let { themes, value, onChange }: Props = $props()

  let previewUrls: Map<string, string> = $state(new Map())

  $effect(() => {
    const urls = new Map<string, string>()
    for (const theme of themes) {
      if (theme.previewSvg) {
        const encoded = btoa(unescape(encodeURIComponent(theme.previewSvg)))
        urls.set(theme.id, `data:image/svg+xml;base64,${encoded}`)
      }
    }
    previewUrls = urls
  })

  const cursorThemes = $derived(themes.filter(t => t.type === 'cursor'))
  const mascotThemes = $derived(themes.filter(t => t.type === 'mascot'))
</script>

<div class="theme-selector">
  <div class="theme-grid">
    {#each cursorThemes as theme}
      <button
        class="theme-card"
        class:selected={value === theme.id}
        onclick={() => onChange(theme.id)}
        title={theme.name}
      >
        <div class="preview">
          {#if previewUrls.get(theme.id)}
            <img src={previewUrls.get(theme.id)} alt={theme.name} />
          {/if}
        </div>
        <span class="name">{theme.name}</span>
      </button>
    {/each}
  </div>

  {#if mascotThemes.length > 0}
    <h3>Mascots</h3>
    <div class="theme-grid">
      {#each mascotThemes as theme}
        <button
          class="theme-card mascot"
          class:selected={value === theme.id}
          onclick={() => onChange(theme.id)}
          title={theme.name}
        >
          <div class="preview">
            {#if previewUrls.get(theme.id)}
              <img src={previewUrls.get(theme.id)} alt={theme.name} />
            {/if}
          </div>
          <span class="name">{theme.name}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .theme-selector {
    max-height: 340px;
    overflow-y: auto;
    padding-right: 4px;
  }

  .theme-selector::-webkit-scrollbar { width: 5px; }
  .theme-selector::-webkit-scrollbar-track { background: transparent; }
  .theme-selector::-webkit-scrollbar-thumb { background: #2a2a4a; border-radius: 3px; }

  h3 {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #666;
    margin: 14px 0 8px;
  }

  .theme-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .theme-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 10px 4px 8px;
    border: 2px solid #2a2a4a;
    border-radius: 10px;
    background: #1a1a2e;
    cursor: pointer;
    transition: all 0.15s;
  }

  .theme-card:hover {
    border-color: #444;
    background: #1e1e3a;
  }

  .theme-card.selected {
    border-color: #00FF41;
    background: #1a2a1e;
  }

  .preview {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .preview img {
    width: 36px;
    height: 36px;
    object-fit: contain;
  }

  .name {
    font-size: 9px;
    color: #aaa;
    text-align: center;
    line-height: 1.2;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .theme-card.selected .name {
    color: #00FF41;
  }

  .theme-card.mascot .preview img {
    width: 42px;
    height: 42px;
  }
</style>
