import './stats-display.css';

export class StatsDisplay {
  #bus;
  #container;
  #els = {};

  constructor(bus, container) {
    this.#bus = bus;
    this.#container = container;
    this.#build();
    this.#bus.on('typing:progress', (data) => this.#update(data));
    this.#bus.on('typing:complete', (data) => this.#showResult(data));
    this.#bus.on('text:loaded', () => this.#reset());
  }

  #build() {
    this.#container.innerHTML = `
      <div class="stats-bar">
        <div class="stat">
          <span class="stat-label">WPM</span>
          <span class="stat-value" data-stat="wpm">0</span>
        </div>
        <div class="stat">
          <span class="stat-label">Accuracy</span>
          <span class="stat-value" data-stat="accuracy">100%</span>
        </div>
        <div class="stat">
          <span class="stat-label">Errors</span>
          <span class="stat-value" data-stat="errors">0</span>
        </div>
        <div class="stat">
          <span class="stat-label">Remaining</span>
          <span class="stat-value" data-stat="remaining">-</span>
        </div>
      </div>
      <div class="stats-result" data-stat="result" hidden></div>
    `;

    this.#els = {
      wpm: this.#container.querySelector('[data-stat="wpm"]'),
      accuracy: this.#container.querySelector('[data-stat="accuracy"]'),
      errors: this.#container.querySelector('[data-stat="errors"]'),
      remaining: this.#container.querySelector('[data-stat="remaining"]'),
      result: this.#container.querySelector('[data-stat="result"]'),
    };
  }

  #update({ wpm, accuracy, errors, remaining }) {
    this.#els.wpm.textContent = wpm;
    this.#els.accuracy.textContent = `${accuracy}%`;
    this.#els.errors.textContent = errors;

    if (typeof remaining === 'number') {
      this.#els.remaining.textContent = remaining;
    }
  }

  #showResult({ wpm, accuracy, errors, duration }) {
    this.#els.result.hidden = false;
    this.#els.result.innerHTML = `
      <div class="result-title">Finish!</div>
      <div class="result-stats">
        <span><strong>${wpm}</strong> WPM</span>
        <span><strong>${accuracy}%</strong> Accuracy</span>
        <span><strong>${errors}</strong> Errors</span>
        <span><strong>${duration}s</strong> Duration</span>
      </div>
      <button class="result-retry">Retry</button>
    `;
    this.#els.result.querySelector('.result-retry').addEventListener('click', () => {
      this.#bus.emit('typing:retry');
    });
  }

  #reset() {
    this.#els.wpm.textContent = '0';
    this.#els.accuracy.textContent = '100%';
    this.#els.errors.textContent = '0';
    this.#els.remaining.textContent = '-';
    this.#els.result.hidden = true;
  }
}
