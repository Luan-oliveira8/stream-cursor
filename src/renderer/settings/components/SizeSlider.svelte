<script lang="ts">
  interface Props {
    value: number
    onChange: (value: number) => void
  }
  let { value, onChange }: Props = $props()

  const presets = [
    { label: '32px', value: 1.0 },
    { label: '48px', value: 1.5 },
    { label: '64px', value: 2.0 },
    { label: '96px', value: 3.0 }
  ]
</script>

<div class="size-control">
  <div class="slider-row">
    <input
      type="range"
      min="0.5"
      max="3.0"
      step="0.1"
      {value}
      oninput={(e) => onChange(parseFloat(e.currentTarget.value))}
    />
    <span class="size-value">{value.toFixed(1)}x</span>
  </div>
  <div class="presets">
    {#each presets as preset}
      <button
        class="preset-btn"
        class:active={Math.abs(value - preset.value) < 0.05}
        onclick={() => onChange(preset.value)}
      >
        {preset.label}
      </button>
    {/each}
  </div>
</div>

<style>
  .size-control {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .slider-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  input[type="range"] {
    flex: 1;
    height: 6px;
    accent-color: #00FF41;
  }

  .size-value {
    font-size: 16px;
    font-weight: 700;
    color: #00FF41;
    min-width: 45px;
    text-align: right;
  }

  .presets {
    display: flex;
    gap: 8px;
  }

  .preset-btn {
    padding: 6px 14px;
    border: 1px solid #2a2a4a;
    border-radius: 6px;
    background: transparent;
    color: #aaa;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .preset-btn:hover {
    border-color: #555;
    color: #fff;
  }

  .preset-btn.active {
    border-color: #00FF41;
    color: #00FF41;
    background: #00FF4110;
  }
</style>
