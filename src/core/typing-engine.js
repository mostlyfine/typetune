export class TypingEngine {
  #bus;
  #text = '';
  #position = 0;
  #errors = [];
  #startTime = null;
  #inputCount = 0;
  #correctCount = 0;
  #mode = 'free';       // 'free' | 'time' | 'chars'
  #timeLimit = 60;      // seconds (for time mode)
  #charLimit = 100;     // chars (for chars mode)
  #timer = null;
  #statsTimer = null;
  #active = false;
  #skipPositions = new Set();

  constructor(bus) {
    this.#bus = bus;
    this.#bus.on('text:loaded', ({ text }) => this.setText(text));
  }

  setText(text) {
    this.stop();
    this.#text = text;
    this.#position = 0;
    this.#errors = [];
    this.#startTime = null;
    this.#inputCount = 0;
    this.#correctCount = 0;
    this.#active = false;
    this.#computeSkipPositions();
    this.#advancePastSkips();
    this.#emitHighlight();
  }

  setMode(mode, value) {
    this.#mode = mode;
    if (mode === 'time') this.#timeLimit = value || 60;
    if (mode === 'chars') this.#charLimit = value || 100;
  }

  start() {
    document.addEventListener('keydown', this.#handleKeydown);
    this.#active = false;
  }

  stop() {
    document.removeEventListener('keydown', this.#handleKeydown);
    clearInterval(this.#timer);
    clearInterval(this.#statsTimer);
    this.#timer = null;
    this.#statsTimer = null;
    this.#active = false;
  }

  get text() { return this.#text; }
  get position() { return this.#position; }
  get errors() { return this.#errors; }
  get skipPositions() { return this.#skipPositions; }

  #computeSkipPositions() {
    this.#skipPositions = new Set();
    let lineStart = true;
    for (let i = 0; i < this.#text.length; i++) {
      const ch = this.#text[i];
      if (ch === '\n') {
        lineStart = true;
      } else if (lineStart && (ch === ' ' || ch === '\t')) {
        this.#skipPositions.add(i);
      } else {
        lineStart = false;
      }
    }
  }

  #advancePastSkips() {
    while (this.#position < this.#text.length && this.#skipPositions.has(this.#position)) {
      this.#position++;
    }
  }

  #retreatPastSkips() {
    while (this.#position > 0 && this.#skipPositions.has(this.#position)) {
      this.#position--;
    }
  }

  #handleKeydown = (e) => {
    if (e.isComposing) return;

    // Ignore events from form elements
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;

    // Ignore modifier-only keys
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) return;

    // Ignore shortcuts
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    e.preventDefault();

    if (!this.#text) return;

    // Space/Enter to start without consuming as input
    if (!this.#active && (e.key === ' ' || e.key === 'Enter')) {
      this.#active = true;
      this.#startTime = Date.now();
      this.#bus.emit('typing:start', {});
      this.#startStatsTimer();
      if (this.#mode === 'time') this.#startCountdown();
      return;
    }

    // Handle backspace
    if (e.key === 'Backspace') {
      if (this.#position > 0) {
        this.#position--;
        this.#retreatPastSkips();
        this.#errors = this.#errors.filter(err => err.position !== this.#position);
        this.#bus.emit('typing:input', {
          type: 'backspace',
          position: this.#position,
        });
        this.#emitProgress();
        this.#emitHighlight();
      }
      return;
    }

    // Start on first real input
    if (!this.#active) {
      this.#active = true;
      this.#startTime = Date.now();
      this.#bus.emit('typing:start', {});
      this.#startStatsTimer();
      if (this.#mode === 'time') this.#startCountdown();
    }

    if (this.#position >= this.#text.length) return;

    const expected = this.#text[this.#position];
    const actual = e.key === 'Enter' ? '\n' : e.key;
    const correct = actual === expected;
    const typedAt = this.#position;

    this.#inputCount++;
    if (correct) {
      this.#correctCount++;
    } else {
      this.#errors.push({ position: this.#position, expected, actual });
      this.#bus.emit('typing:error', { position: this.#position, expected, actual });
    }

    this.#position++;
    this.#advancePastSkips();

    this.#bus.emit('typing:input', {
      expected,
      actual,
      correct,
      typedAt,
      position: this.#position,
    });

    this.#emitProgress();
    this.#emitHighlight();

    // Check completion
    if (this.#mode === 'chars' && this.#correctCount >= this.#charLimit) {
      this.#complete();
    } else if (this.#mode === 'free' && this.#position >= this.#text.length) {
      this.#complete();
    }
  };

  #emitHighlight() {
    if (this.#position < this.#text.length) {
      this.#bus.emit('highlight:key', {
        char: this.#text[this.#position],
      });
    }
  }

  #calcStats() {
    let elapsedSec = this.#startTime ? (Date.now() - this.#startTime) / 1000 : 0;
    if (this.#mode === 'time' && elapsedSec > this.#timeLimit) {
      elapsedSec = this.#timeLimit;
    }
    const wpm = elapsedSec > 0 ? Math.round((this.#correctCount / 5) / (elapsedSec / 60)) : 0;
    const accuracy = this.#inputCount > 0
      ? Math.round((this.#correctCount / this.#inputCount) * 1000) / 10
      : 100;
    return { wpm, accuracy, elapsedSec };
  }

  #emitProgress() {
    const { wpm, accuracy } = this.#calcStats();

    this.#bus.emit('typing:progress', {
      position: this.#position,
      total: this.#text.length,
      wpm,
      accuracy,
      errors: this.#errors.length,
      correctCount: this.#correctCount,
      inputCount: this.#inputCount,
      remaining: this.#getRemaining(),
    });
  }

  #getRemaining() {
    if (this.#mode === 'time') {
      if (!this.#startTime) return this.#timeLimit;
      const elapsed = (Date.now() - this.#startTime) / 1000;
      return Math.max(0, Math.ceil(this.#timeLimit - elapsed));
    }
    if (this.#mode === 'chars') {
      return Math.max(0, this.#charLimit - this.#correctCount);
    }
    return this.#text.length - this.#position;
  }

  #startStatsTimer() {
    this.#statsTimer = setInterval(() => {
      if (this.#active) this.#emitProgress();
    }, 500);
  }

  #startCountdown() {
    this.#timer = setInterval(() => {
      const elapsed = (Date.now() - this.#startTime) / 1000;
      if (elapsed >= this.#timeLimit) {
        this.#complete();
      }
    }, 200);
  }

  #complete() {
    const { wpm, accuracy, elapsedSec } = this.#calcStats();
    this.stop();
    this.#bus.emit('typing:complete', {
      wpm,
      accuracy,
      errors: this.#errors.length,
      duration: Math.round(elapsedSec * 10) / 10,
      correctCount: this.#correctCount,
      inputCount: this.#inputCount,
    });
  }
}
