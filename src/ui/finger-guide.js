import { getFingerForChar, getFingersForLayerMapping } from '../data/key-finger-map.js';
import './finger-guide.css';

const FINGER_IDS = [
  'l-pinky', 'l-ring', 'l-middle', 'l-index', 'l-thumb',
  'r-thumb', 'r-index', 'r-middle', 'r-ring', 'r-pinky',
];

export class FingerGuide {
  #bus;
  #container;
  #fingerEls = new Map();
  #layerCharMap = {};

  constructor(bus, container) {
    this.#bus = bus;
    this.#container = container;
    this.#render();
    this.#bus.on('highlight:key', ({ char }) => this.#highlight(char));
    this.#bus.on('layout:changed', ({ layerCharMap }) => {
      this.#layerCharMap = layerCharMap || {};
    });
  }

  #render() {
    this.#container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'fg-wrapper';

    wrapper.innerHTML = `
      <svg viewBox="0 0 500 180" class="fg-svg" xmlns="http://www.w3.org/2000/svg">
        <!-- Left hand -->
        <g class="fg-hand fg-hand-left" transform="translate(50, 10)">
          <!-- Palm -->
          <ellipse cx="85" cy="130" rx="75" ry="45" class="fg-palm"/>

          <!-- Fingers: pinky, ring, middle, index, thumb -->
          <g id="finger-l-pinky" class="fg-finger" data-finger="l-pinky">
            <rect x="5" y="50" width="22" height="65" rx="11"/>
            <ellipse cx="16" cy="45" rx="11" ry="14"/>
          </g>
          <g id="finger-l-ring" class="fg-finger" data-finger="l-ring">
            <rect x="35" y="30" width="22" height="75" rx="11"/>
            <ellipse cx="46" cy="25" rx="11" ry="14"/>
          </g>
          <g id="finger-l-middle" class="fg-finger" data-finger="l-middle">
            <rect x="65" y="20" width="22" height="80" rx="11"/>
            <ellipse cx="76" cy="15" rx="11" ry="14"/>
          </g>
          <g id="finger-l-index" class="fg-finger" data-finger="l-index">
            <rect x="95" y="35" width="22" height="70" rx="11"/>
            <ellipse cx="106" cy="30" rx="11" ry="14"/>
          </g>
          <g id="finger-l-thumb" class="fg-finger" data-finger="l-thumb">
            <rect x="120" y="100" width="22" height="50" rx="11" transform="rotate(25, 131, 125)"/>
            <ellipse cx="138" cy="96" rx="11" ry="13" transform="rotate(25, 138, 96)"/>
          </g>
        </g>

        <!-- Right hand -->
        <g class="fg-hand fg-hand-right" transform="translate(270, 10)">
          <!-- Palm -->
          <ellipse cx="95" cy="130" rx="75" ry="45" class="fg-palm"/>

          <!-- Fingers: thumb, index, middle, ring, pinky -->
          <g id="finger-r-thumb" class="fg-finger" data-finger="r-thumb">
            <rect x="38" y="100" width="22" height="50" rx="11" transform="rotate(-25, 49, 125)"/>
            <ellipse cx="42" cy="96" rx="11" ry="13" transform="rotate(-25, 42, 96)"/>
          </g>
          <g id="finger-r-index" class="fg-finger" data-finger="r-index">
            <rect x="63" y="35" width="22" height="70" rx="11"/>
            <ellipse cx="74" cy="30" rx="11" ry="14"/>
          </g>
          <g id="finger-r-middle" class="fg-finger" data-finger="r-middle">
            <rect x="93" y="20" width="22" height="80" rx="11"/>
            <ellipse cx="104" cy="15" rx="11" ry="14"/>
          </g>
          <g id="finger-r-ring" class="fg-finger" data-finger="r-ring">
            <rect x="123" y="30" width="22" height="75" rx="11"/>
            <ellipse cx="134" cy="25" rx="11" ry="14"/>
          </g>
          <g id="finger-r-pinky" class="fg-finger" data-finger="r-pinky">
            <rect x="153" y="50" width="22" height="65" rx="11"/>
            <ellipse cx="164" cy="45" rx="11" ry="14"/>
          </g>
        </g>
      </svg>
    `;

    this.#container.appendChild(wrapper);

    for (const id of FINGER_IDS) {
      const el = wrapper.querySelector(`[data-finger="${id}"]`);
      if (el) this.#fingerEls.set(id, el);
    }
  }

  #highlight(char) {
    this.#clearHighlight();

    const layerMapping = this.#layerCharMap[char];
    if (layerMapping) {
      for (const f of getFingersForLayerMapping(layerMapping)) {
        this.#fingerEls.get(f)?.classList.add('fg-active');
      }
      return;
    }

    const fingers = getFingerForChar(char);
    if (!fingers) return;
    for (const f of fingers) {
      this.#fingerEls.get(f)?.classList.add('fg-active');
    }
  }

  #clearHighlight() {
    for (const el of this.#fingerEls.values()) {
      el.classList.remove('fg-active');
    }
  }
}
