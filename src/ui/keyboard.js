import { ZMK_KEY_MAP, CHAR_TO_KEY } from '../data/key-labels.js';
import { QWERTY_LAYOUT } from '../data/default-layout.js';
import { isRightHandKey } from '../data/key-finger-map.js';
import './keyboard.css';

export class Keyboard {
  #bus;
  #container;
  #layout;
  #keyEls = new Map();  // code -> DOM element

  constructor(bus, container) {
    this.#bus = bus;
    this.#container = container;
    this.#layout = QWERTY_LAYOUT;
    this.#render();
    this.#bus.on('highlight:key', (data) => this.#highlight(data));
    this.#bus.on('layout:changed', ({ layout }) => this.#setLayout(layout));
  }

  #setLayout(layout) {
    this.#layout = layout || QWERTY_LAYOUT;
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
    if (keyEl) keyEl.classList.add('kb-highlight');

    if (mapping.shift) {
      // Highlight the opposite-side shift key
      if (isRightHandKey(mapping.code)) {
        this.#keyEls.get('LSHIFT')?.classList.add('kb-highlight');
      } else {
        this.#keyEls.get('RSHIFT')?.classList.add('kb-highlight');
      }
    }
  }

  #clearHighlight() {
    for (const el of this.#keyEls.values()) {
      el.classList.remove('kb-highlight');
    }
  }
}

function esc(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
