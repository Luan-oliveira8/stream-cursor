<script lang="ts">
  interface Props {
    value: string
    onChange: (value: string) => void
  }
  let { value, onChange }: Props = $props()

  let listening = $state(false)
  let displayValue = $state(value)

  $effect(() => {
    displayValue = value
  })

  function startListening() {
    listening = true
    displayValue = 'Pressione uma combinação...'
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (!listening) return
    e.preventDefault()

    const parts: string[] = []
    if (e.ctrlKey) parts.push('CommandOrControl')
    if (e.shiftKey) parts.push('Shift')
    if (e.altKey) parts.push('Alt')

    const key = e.key
    if (!['Control', 'Shift', 'Alt', 'Meta'].includes(key)) {
      parts.push(key.length === 1 ? key.toUpperCase() : key)

      if (parts.length >= 2) {
        const hotkey = parts.join('+')
        displayValue = hotkey
        onChange(hotkey)
        listening = false
      }
    }
  }

  function cancel() {
    listening = false
    displayValue = value
  }
</script>

<div class="hotkey-input">
  <div class="hotkey-display" class:listening>
    <span class="keys">{displayValue}</span>
    {#if listening}
      <button class="cancel-btn" onclick={cancel}>Cancelar</button>
    {:else}
      <button class="change-btn" onclick={startListening}>Alterar</button>
    {/if}
  </div>
  {#if listening}
    <input
      type="text"
      class="hidden-input"
      autofocus
      onkeydown={handleKeyDown}
      onblur={cancel}
    />
  {/if}
  <p class="hint">Clique em "Alterar" e pressione a nova combinação de teclas</p>
</div>

<style>
  .hotkey-input {
    position: relative;
  }

  .hotkey-display {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border: 1px solid #2a2a4a;
    border-radius: 8px;
    background: #1a1a2e;
  }

  .hotkey-display.listening {
    border-color: #00FF41;
    background: #1a2a1e;
  }

  .keys {
    font-family: monospace;
    font-size: 14px;
    color: #e0e0e0;
  }

  .change-btn, .cancel-btn {
    padding: 4px 12px;
    border: 1px solid #444;
    border-radius: 4px;
    background: transparent;
    color: #aaa;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .change-btn:hover {
    border-color: #00FF41;
    color: #00FF41;
  }

  .cancel-btn {
    border-color: #FF4444;
    color: #FF4444;
  }

  .hidden-input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .hint {
    font-size: 11px;
    color: #666;
    margin-top: 6px;
  }
</style>
