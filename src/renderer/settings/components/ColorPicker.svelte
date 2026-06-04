<script lang="ts">
  interface Props {
    label: string
    value: string
    onChange: (value: string) => void
  }
  let { label, value, onChange }: Props = $props()
</script>

<div class="color-picker">
  <label>{label}</label>
  <div class="input-row">
    <input
      type="color"
      {value}
      oninput={(e) => onChange(e.currentTarget.value)}
    />
    <input
      type="text"
      {value}
      maxlength="7"
      oninput={(e) => {
        const v = e.currentTarget.value
        if (/^#[0-9A-Fa-f]{6}$/.test(v)) onChange(v)
      }}
    />
  </div>
</div>

<style>
  .color-picker {
    flex: 1;
  }

  label {
    display: block;
    font-size: 12px;
    color: #888;
    margin-bottom: 6px;
  }

  .input-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  input[type="color"] {
    width: 36px;
    height: 36px;
    border: 2px solid #2a2a4a;
    border-radius: 8px;
    background: none;
    cursor: pointer;
    padding: 2px;
  }

  input[type="color"]::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  input[type="color"]::-webkit-color-swatch {
    border: none;
    border-radius: 5px;
  }

  input[type="text"] {
    width: 80px;
    padding: 6px 10px;
    border: 1px solid #2a2a4a;
    border-radius: 6px;
    background: #1a1a2e;
    color: #e0e0e0;
    font-family: monospace;
    font-size: 13px;
  }

  input[type="text"]:focus {
    outline: none;
    border-color: #00FF41;
  }
</style>
