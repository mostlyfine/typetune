import { LANGUAGES } from '../data/repo-list.js';
import { PRESETS, generatePracticeText } from '../data/practice-presets.js';
import { KeymapLoader } from '../core/keymap-loader.js';
import './settings-panel.css';

export class SettingsPanel {
  #bus;
  #container;
  #textProvider;
  #engine;
  #sound;
  #keymapLoader = new KeymapLoader();
  #collapsed = false;

  constructor(bus, container, textProvider, engine, sound) {
    this.#bus = bus;
    this.#container = container;
    this.#textProvider = textProvider;
    this.#engine = engine;
    this.#sound = sound;
    this.#build();
    this.#bus.on('typing:start', () => this.#collapse());
  }

  #build() {
    this.#container.innerHTML = `
      <div class="sp-header">
        <button id="sp-start" class="sp-start-btn">Start</button>
        <div class="sp-header-bottom">
          <button id="sp-toggle" class="sp-toggle-btn">Settings &#x25BE;</button>
          <div class="sp-header-actions">
            <button id="sp-sound" class="sp-sound-btn">Sound: ON</button>
            <button id="sp-theme" class="sp-theme-btn">Light</button>
          </div>
        </div>
      </div>
      <div class="sp-bar">
        <hr class="sp-divider">
        <div class="sp-row">
          <div class="sp-group">
            <label class="sp-label">Lang</label>
            <select id="sp-language" class="sp-select">
              ${LANGUAGES.map(l => `<option value="${l}">${l}</option>`).join('')}
            </select>
            <button id="sp-fetch" class="sp-btn">Fetch</button>
          </div>
          <div class="sp-group">
            <label class="sp-label">File</label>
            <input id="sp-file" type="file" class="sp-file-input">
          </div>
        </div>
        <hr class="sp-divider">
        <div class="sp-row">
          <div class="sp-group">
            <label class="sp-label">Mode</label>
            <select id="sp-mode" class="sp-select">
              <option value="free">Free</option>
              <option value="time">1min Test</option>
              <option value="time-custom">Time Test</option>
              <option value="chars">Char Count</option>
            </select>
            <input id="sp-mode-value" type="number" class="sp-input sp-input-narrow" placeholder="60" hidden>
            <span id="sp-mode-unit" class="sp-unit" hidden></span>
          </div>
          <div class="sp-group">
            <label class="sp-label">Practice</label>
            <select id="sp-preset" class="sp-select">
              <option value="">-- Code --</option>
              ${Object.entries(PRESETS).map(([k, v]) => `<option value="${k}">${v.name}</option>`).join('')}
            </select>
          </div>
        </div>
        <hr class="sp-divider">
        <div class="sp-row">
          <div class="sp-group">
            <label class="sp-label">Keymap</label>
            <input id="sp-keymap-file" type="file" class="sp-file-input" accept=".keymap,.dtsi,.json,.c,.h,.vil">
            <button id="sp-keymap-reset" class="sp-btn">Reset</button>
          </div>
        </div>
      </div>
    `;

    this.#bindEvents();
  }

  #toggleCollapse() {
    this.#collapsed = !this.#collapsed;
    this.#container.querySelector('.sp-bar').classList.toggle('sp-collapsed', this.#collapsed);
    this.#container.querySelector('#sp-toggle').innerHTML =
      this.#collapsed ? 'Settings &#x25B8;' : 'Settings &#x25BE;';
  }

  #collapse() {
    if (this.#collapsed) return;
    this.#toggleCollapse();
  }

  #bindEvents() {
    // Header buttons
    this.#container.querySelector('#sp-toggle').addEventListener('click', () => this.#toggleCollapse());

    const startBtn = this.#container.querySelector('#sp-start');
    const soundBtn = this.#container.querySelector('#sp-sound');
    const presetSelect = this.#container.querySelector('#sp-preset');

    startBtn.addEventListener('click', () => {
      const presetId = presetSelect.value;
      if (presetId) {
        const preset = PRESETS[presetId];
        const keys = preset.keys();
        const text = generatePracticeText(keys, 300);
        this.#textProvider.loadText(text, preset.name);
      } else {
        this.#bus.emit('text:loaded', {
          text: this.#engine.text,
          language: 'restart',
          source: 'restart',
        });
      }
      this.#applyMode();
      this.#engine.start();
    });

    soundBtn.addEventListener('click', () => {
      this.#sound.toggle();
      soundBtn.textContent = this.#sound.enabled ? 'Sound: ON' : 'Sound: OFF';
      soundBtn.classList.toggle('sp-sound-off', !this.#sound.enabled);
    });

    const themeBtn = this.#container.querySelector('#sp-theme');
    themeBtn.addEventListener('click', () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      document.documentElement.setAttribute('data-theme', isLight ? '' : 'light');
      themeBtn.textContent = isLight ? 'Light' : 'Dark';
    });

    // Text source
    const langSelect = this.#container.querySelector('#sp-language');
    const fetchBtn = this.#container.querySelector('#sp-fetch');
    const fileInput = this.#container.querySelector('#sp-file');
    const modeSelect = this.#container.querySelector('#sp-mode');
    const modeValue = this.#container.querySelector('#sp-mode-value');
    const modeUnit = this.#container.querySelector('#sp-mode-unit');

    // Fetch from language
    fetchBtn.addEventListener('click', async () => {
      fetchBtn.disabled = true;
      fetchBtn.textContent = '...';
      try {
        await this.#textProvider.loadFromLanguage(langSelect.value);
        this.#applyMode();
        this.#engine.start();
      } catch (e) {
        alert(`Failed to fetch: ${e.message}`);
      } finally {
        fetchBtn.disabled = false;
        fetchBtn.textContent = 'Fetch';
      }
    });

    // Load from file
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files[0];
      if (!file) return;
      await this.#textProvider.loadFromFile(file);
      this.#applyMode();
      this.#engine.start();
    });

    // Preset selection — generate text immediately
    presetSelect.addEventListener('change', () => {
      const presetId = presetSelect.value;
      if (!presetId) return;
      const preset = PRESETS[presetId];
      const keys = preset.keys();
      const text = generatePracticeText(keys, 300);
      this.#textProvider.loadText(text, preset.name);
      this.#applyMode();
      this.#engine.start();
    });

    // Mode selection
    modeSelect.addEventListener('change', () => {
      const mode = modeSelect.value;
      if (mode === 'time-custom') {
        modeValue.hidden = false;
        modeValue.placeholder = '60';
        modeUnit.hidden = false;
        modeUnit.textContent = 'sec';
      } else if (mode === 'chars') {
        modeValue.hidden = false;
        modeValue.placeholder = '200';
        modeUnit.hidden = false;
        modeUnit.textContent = 'chars';
      } else {
        modeValue.hidden = true;
        modeUnit.hidden = true;
      }
    });

    // Keymap file upload
    const keymapFileInput = this.#container.querySelector('#sp-keymap-file');
    const keymapResetBtn = this.#container.querySelector('#sp-keymap-reset');

    keymapFileInput.addEventListener('change', () => {
      const file = keymapFileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        this.#loadKeymap(reader.result, file.name);
      };
      reader.readAsText(file);
    });

    keymapResetBtn.addEventListener('click', () => {
      this.#bus.emit('layout:changed', { layout: null });
      keymapFileInput.value = '';
    });
  }

  #loadKeymap(text, filename = '') {
    try {
      const result = this.#keymapLoader.load(text, filename);
      this.#bus.emit('layout:changed', { layout: result.layout, layerCharMap: result.layerCharMap });
    } catch (e) {
      alert(`Failed to parse keymap: ${e.message}`);
    }
  }

  #applyMode() {
    const modeSelect = this.#container.querySelector('#sp-mode');
    const modeValue = this.#container.querySelector('#sp-mode-value');
    const mode = modeSelect.value;

    if (mode === 'time') {
      this.#engine.setMode('time', 60);
    } else if (mode === 'time-custom') {
      this.#engine.setMode('time', parseInt(modeValue.value) || 60);
    } else if (mode === 'chars') {
      this.#engine.setMode('chars', parseInt(modeValue.value) || 200);
    } else {
      this.#engine.setMode('free');
    }
  }
}
