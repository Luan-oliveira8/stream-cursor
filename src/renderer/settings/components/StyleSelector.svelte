<script lang="ts">
  interface Props {
    value: string
    onChange: (value: string) => void
  }
  let { value, onChange }: Props = $props()

  const styles = [
    { id: 'neon', label: 'Neon', desc: 'Brilho verde neon com glow', color: '#00FF41' },
    { id: 'classic', label: 'Clássico', desc: 'Branco com borda preta', color: '#FFFFFF' },
    { id: 'minimal', label: 'Minimal', desc: 'Vermelho sutil com glow leve', color: '#FF4444' }
  ]
</script>

<div class="styles">
  {#each styles as style}
    <button
      class="style-card"
      class:selected={value === style.id}
      onclick={() => onChange(style.id)}
    >
      <div class="style-preview" style="background: {style.color}; box-shadow: 0 0 12px {style.color}40;"></div>
      <div class="style-info">
        <span class="style-name">{style.label}</span>
        <span class="style-desc">{style.desc}</span>
      </div>
    </button>
  {/each}
</div>

<style>
  .styles {
    display: flex;
    gap: 10px;
  }

  .style-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px 8px;
    border: 2px solid #2a2a4a;
    border-radius: 10px;
    background: #1a1a2e;
    cursor: pointer;
    transition: all 0.2s;
  }

  .style-card:hover {
    border-color: #444;
  }

  .style-card.selected {
    border-color: #00FF41;
    background: #1a2a1e;
  }

  .style-preview {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    transition: all 0.2s;
  }

  .style-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .style-name {
    font-size: 13px;
    font-weight: 600;
    color: #e0e0e0;
  }

  .style-desc {
    font-size: 10px;
    color: #888;
    text-align: center;
  }
</style>
