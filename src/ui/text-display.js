import './text-display.css';

export class TextDisplay {
  #bus;
  #container;
  #text = '';
  #position = 0;
  #errors = new Set();
  #skipPositions = new Set();
  #visibleLines = 9;
  #lines = [];         // cached line split
  #lineStarts = [];    // char index where each line starts
  #spanEls = [];       // flat array of span elements by char position
  #currentStartLine = -1;
  #pre = null;

  constructor(bus, container) {
    this.#bus = bus;
    this.#container = container;
    this.#bus.on('text:loaded', ({ text }) => this.#setText(text));
    this.#bus.on('typing:input', (data) => this.#onInput(data));
    this.#bus.on('skip:positions', ({ positions }) => {
      this.#skipPositions = positions;
      this.#buildDOM();
    });
  }

  setSkipPositions(positions) {
    this.#skipPositions = positions;
  }

  #setText(text) {
    this.#text = text;
    this.#position = 0;
    this.#errors = new Set();
    this.#computeSkipPositions();
    this.#cacheLines();
    this.#buildDOM();
  }

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
    // Advance initial position past leading skips
    while (this.#position < this.#text.length && this.#skipPositions.has(this.#position)) {
      this.#position++;
    }
  }

  #cacheLines() {
    this.#lines = this.#text.split('\n');
    this.#lineStarts = [];
    let pos = 0;
    for (const line of this.#lines) {
      this.#lineStarts.push(pos);
      pos += line.length + 1; // +1 for \n
    }
  }

  #getCurrentLine() {
    // Binary search in lineStarts
    let lo = 0, hi = this.#lineStarts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (this.#lineStarts[mid] <= this.#position) lo = mid;
      else hi = mid - 1;
    }
    return lo;
  }

  #onInput(data) {
    const prevPosition = this.#position;
    if (data.type === 'backspace') {
      // Clear errors between new and old position
      for (let p = data.position; p < prevPosition; p++) {
        this.#errors.delete(p);
      }
      this.#position = data.position;
    } else {
      this.#position = data.position;
      if (!data.correct) {
        this.#errors.add(data.typedAt);
      }
    }

    // Check if visible window needs to shift
    const currentLine = this.#getCurrentLine();
    const startLine = Math.max(0, currentLine - 1);
    if (startLine !== this.#currentStartLine) {
      this.#buildDOM();
    } else {
      this.#updateSpans(prevPosition);
    }
  }

  #buildDOM() {
    this.#container.innerHTML = '';
    this.#spanEls = [];

    if (!this.#text) {
      this.#container.innerHTML = '<div class="td-placeholder">Select a language or load a file to start</div>';
      return;
    }

    const currentLine = this.#getCurrentLine();
    const startLine = Math.max(0, currentLine - 1);
    const endLine = Math.min(this.#lines.length, startLine + this.#visibleLines);
    this.#currentStartLine = startLine;

    this.#pre = document.createElement('pre');
    this.#pre.className = 'td-code';

    for (let i = startLine; i < endLine; i++) {
      const lineStart = this.#lineStarts[i];
      const lineEl = document.createElement('div');
      lineEl.className = 'td-line';
      if (i === currentLine) lineEl.classList.add('td-line-active');

      for (let j = 0; j < this.#lines[i].length; j++) {
        const pos = lineStart + j;
        const span = document.createElement('span');
        span.textContent = this.#lines[i][j];
        span.className = this.#classForPos(pos);
        this.#spanEls[pos] = span;
        lineEl.appendChild(span);
      }

      // Newline marker
      const nlPos = lineStart + this.#lines[i].length;
      if (i < this.#lines.length - 1 && nlPos < this.#text.length) {
        const nlSpan = document.createElement('span');
        nlSpan.textContent = '\u21B5';
        nlSpan.className = 'td-newline ' + this.#classForPos(nlPos);
        this.#spanEls[nlPos] = nlSpan;
        lineEl.appendChild(nlSpan);
      }

      this.#pre.appendChild(lineEl);
    }

    this.#container.appendChild(this.#pre);
  }

  #updateSpans(prevPosition) {
    // Update only the affected positions
    const minPos = Math.min(prevPosition, this.#position);
    const maxPos = Math.max(prevPosition, this.#position);

    for (let pos = minPos; pos <= maxPos && pos < this.#text.length; pos++) {
      const span = this.#spanEls[pos];
      if (!span) continue;
      const base = this.#classForPos(pos);
      span.className = span.textContent === '\u21B5' ? 'td-newline ' + base : base;
    }

    // Update active line indicator
    if (this.#pre) {
      const currentLine = this.#getCurrentLine();
      const startLine = this.#currentStartLine;
      const lineEls = this.#pre.children;
      for (let i = 0; i < lineEls.length; i++) {
        lineEls[i].classList.toggle('td-line-active', (startLine + i) === currentLine);
      }
    }
  }

  #classForPos(pos) {
    const isSkip = this.#skipPositions.has(pos);
    if (pos < this.#position) {
      if (isSkip) return 'td-skip';
      return this.#errors.has(pos) ? 'td-error' : 'td-correct';
    }
    if (pos === this.#position) return 'td-cursor';
    if (isSkip) return 'td-skip';
    return 'td-pending';
  }
}
