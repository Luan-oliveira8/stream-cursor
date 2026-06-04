<script lang="ts">
  interface Props {
    autostart: boolean
    startMinimized: boolean
    hideSystemCursor: boolean
    onAutostartChange: (value: boolean) => void
    onMinimizedChange: (value: boolean) => void
    onHideCursorChange: (value: boolean) => void
  }
  let { autostart, startMinimized, hideSystemCursor, onAutostartChange, onMinimizedChange, onHideCursorChange }: Props = $props()
</script>

<div class="toggles">
  <label class="toggle-row">
    <input type="checkbox" checked={hideSystemCursor}
      onchange={(e) => onHideCursorChange(e.currentTarget.checked)} />
    <div class="toggle-info">
      <span class="toggle-label">Esconder cursor nativo</span>
      <span class="toggle-desc">Esconde o cursor do sistema enquanto o overlay está ativo</span>
    </div>
  </label>

  <label class="toggle-row">
    <input type="checkbox" checked={autostart}
      onchange={(e) => onAutostartChange(e.currentTarget.checked)} />
    <div class="toggle-info">
      <span class="toggle-label">Iniciar com o sistema</span>
      <span class="toggle-desc">Abre automaticamente ao ligar o computador</span>
    </div>
  </label>

  <label class="toggle-row">
    <input type="checkbox" checked={startMinimized}
      onchange={(e) => onMinimizedChange(e.currentTarget.checked)} />
    <div class="toggle-info">
      <span class="toggle-label">Iniciar minimizado</span>
      <span class="toggle-desc">Inicia direto na bandeja do sistema</span>
    </div>
  </label>
</div>

<style>
  .toggles {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .toggle-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    cursor: pointer;
    padding: 8px;
    border-radius: 6px;
    transition: background 0.2s;
  }

  .toggle-row:hover {
    background: #1a1a2e;
  }

  .toggle-row input[type="checkbox"] {
    width: 20px;
    height: 20px;
    accent-color: #00FF41;
    margin-top: 2px;
    flex-shrink: 0;
  }

  .toggle-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .toggle-label {
    font-size: 14px;
    color: #e0e0e0;
  }

  .toggle-desc {
    font-size: 11px;
    color: #666;
  }
</style>
