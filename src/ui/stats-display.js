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
          <span class="stat-label">Time</span>
          <span class="stat-value" data-stat="elapsed">0s</span>
        </div>
        <div class="stat">
          <span class="stat-label">Remaining</span>
          <span class="stat-value" data-stat="remaining">-</span>
        </div>
      </div>
      <div class="stats-result" data-stat="result" hidden></div>
    `;

    this.#els = {
      bar: this.#container.querySelector('.stats-bar'),
      elapsed: this.#container.querySelector('[data-stat="elapsed"]'),
      remaining: this.#container.querySelector('[data-stat="remaining"]'),
      result: this.#container.querySelector('[data-stat="result"]'),
    };
  }

  #update({ elapsed, remaining }) {
    if (typeof elapsed === 'number') {
      this.#els.elapsed.textContent = `${elapsed}s`;
    }
    if (typeof remaining === 'number') {
      this.#els.remaining.textContent = remaining;
    }
  }

  #showResult({ wpm, accuracy, errors, duration }) {
    this.#els.bar.hidden = true;
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
    this.#els.elapsed.textContent = '0s';
    this.#els.remaining.textContent = '-';
    this.#els.bar.hidden = false;
    this.#els.result.hidden = true;
  }
}
