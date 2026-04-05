import { ZMK_KEY_MAP, CHAR_TO_KEY } from '../data/key-labels.js';
import { QWERTY_LAYOUT } from '../data/default-layout.js';
import { isRightHandKey } from '../data/key-finger-map.js';
import './keyboard.css';

export class Keyboard {
  #bus;
  #container;
  #layout;
  #keyEls = new Map();  // code -> DOM element
  #layerCharMap = {};   // char -> { activator, targetCode, shift? }
  #errorCounts = new Map();  // code -> error count

  constructor(bus, container) {
    this.#bus = bus;
    this.#container = container;
    this.#layout = QWERTY_LAYOUT;
    this.#render();
    this.#bus.on('highlight:key', (data) => this.#highlight(data));
    this.#bus.on('layout:changed', ({ layout, layerCharMap }) => this.#setLayout(layout, layerCharMap));
    this.#bus.on('typing:error', ({ expected }) => this.#trackError(expected));
    this.#bus.on('typing:complete', () => this.#showErrorHeatmap());
    this.#bus.on('text:loaded', () => this.#clearErrorHeatmap());
  }

  #setLayout(layout, layerCharMap) {
    this.#layout = layout || QWERTY_LAYOUT;
    this.#layerCharMap = layerCharMap || {};
    this.#errorCounts.clear();
    this.#render();
  }

  #render() {
    this.#container.innerHTML = '';
    this.#keyEls.clear();

    const kb = document.createElement('div');
    kb.className = 'kb';

    for (const row of this.#layout.rows) {
      const rowEl = document.createElement('div');
      rowEl.className = 'kb-row';

      for (const key of row) {
        const keyEl = document.createElement('div');
        keyEl.className = 'kb-key';
        keyEl.dataset.code = key.code;
        keyEl.style.setProperty('--w', key.w);

        if (key.isGap) {
          keyEl.classList.add('kb-gap');
        } else if (key.isEncoder) {
          keyEl.classList.add('kb-encoder');
          const ccwLabel = ZMK_KEY_MAP[key.encoderCCW]?.label || key.encoderCCW;
          const cwLabel = ZMK_KEY_MAP[key.encoderCW]?.label || key.encoderCW;
          const pressLabel = ZMK_KEY_MAP[key.encoderPress]?.label || key.encoderPress;
          keyEl.innerHTML = `<span class="enc-rot">\u21BA ${esc(ccwLabel)}</span><span class="enc-press">${esc(pressLabel)}</span><span class="enc-rot">\u21BB ${esc(cwLabel)}</span>`;
        } else if (key.isLayer || key.isUnknown || key.isTrans || key.isNone) {
          keyEl.classList.add(key.isLayer ? 'kb-layer' : 'kb-unknown');
          keyEl.textContent = key.code;
        } else {
          const info = ZMK_KEY_MAP[key.code];
          if (info) {
            if (info.shiftLabel) {
              keyEl.innerHTML = `<span class="kb-shift-label">${esc(info.shiftLabel)}</span><span class="kb-main-label">${esc(info.label)}</span>`;
            } else {
              keyEl.textContent = info.label;
            }
          } else {
            keyEl.textContent = key.code;
          }
        }

        this.#keyEls.set(key.code, keyEl);
        rowEl.appendChild(keyEl);
      }

      kb.appendChild(rowEl);
    }

    this.#container.appendChild(kb);
  }

  #highlight({ char }) {
    this.#clearHighlight();

    const mapping = CHAR_TO_KEY[char];
    if (!mapping) return;

    const keyEl = this.#keyEls.get(mapping.code);
    if (keyEl) {
      keyEl.classList.add('kb-highlight');
      if (mapping.shift) {
        if (isRightHandKey(mapping.code)) {
          this.#keyEls.get('LSHIFT')?.classList.add('kb-highlight');
        } else {
          this.#keyEls.get('RSHIFT')?.classList.add('kb-highlight');
        }
      }
      return;
    }

    // Character requires layer switch — highlight activator + target position
    const layerMapping = this.#layerCharMap[char];
    if (layerMapping) {
      this.#keyEls.get(layerMapping.activator)?.classList.add('kb-highlight');
      this.#keyEls.get(layerMapping.targetCode)?.classList.add('kb-highlight');
      if (layerMapping.shift) {
        if (isRightHandKey(layerMapping.targetCode)) {
          this.#keyEls.get('LSHIFT')?.classList.add('kb-highlight');
        } else {
          this.#keyEls.get('RSHIFT')?.classList.add('kb-highlight');
        }
      }
    }
  }

  #clearHighlight() {
    for (const el of this.#keyEls.values()) {
      el.classList.remove('kb-highlight');
    }
  }

  #trackError(expected) {
    const mapping = CHAR_TO_KEY[expected];
    if (mapping) {
      this.#errorCounts.set(mapping.code, (this.#errorCounts.get(mapping.code) || 0) + 1);
      return;
    }
    const layerMapping = this.#layerCharMap[expected];
    if (layerMapping) {
      this.#errorCounts.set(layerMapping.targetCode, (this.#errorCounts.get(layerMapping.targetCode) || 0) + 1);
    }
  }

  #showErrorHeatmap() {
    this.#clearHighlight();
    if (this.#errorCounts.size === 0) return;

    const max = Math.max(...this.#errorCounts.values());
    for (const [code, count] of this.#errorCounts) {
      const el = this.#keyEls.get(code);
      if (!el) continue;
      const level = max === 1 ? 'high'
        : count > max * 2 / 3 ? 'high'
        : count > max / 3 ? 'mid'
        : 'low';
      el.classList.add(`kb-error-${level}`);
    }
  }

  #clearErrorHeatmap() {
    this.#errorCounts.clear();
    for (const el of this.#keyEls.values()) {
      el.classList.remove('kb-error-low', 'kb-error-mid', 'kb-error-high');
    }
  }
}

function esc(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
