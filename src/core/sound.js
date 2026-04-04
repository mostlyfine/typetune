export class Sound {
  #bus;
  #ctx;
  #enabled = true;

  constructor(bus) {
    this.#bus = bus;
    bus.on('typing:input', ({ correct }) => {
      if (correct === true) this.#playKey();
    });
    bus.on('typing:error', () => this.#playError());
  }

  get enabled() { return this.#enabled; }

  toggle() {
    this.#enabled = !this.#enabled;
    this.#bus.emit('sound:changed', { enabled: this.#enabled });
  }

  #ensureCtx() {
    if (!this.#ctx) this.#ctx = new AudioContext();
    return this.#ctx;
  }

  #playKey() {
    if (!this.#enabled) return;
    const ctx = this.#ensureCtx();
    const t = ctx.currentTime;

    // Noise burst for typewriter click
    const bufferSize = ctx.sampleRate * 0.03;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Bandpass filter to shape the click
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 3000;
    filter.Q.value = 0.8;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(t);
    noise.stop(t + 0.04);
  }

  #playError() {
    if (!this.#enabled) return;
    const ctx = this.#ensureCtx();
    const t = ctx.currentTime;

    // Low buzzer
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.linearRampToValueAtTime(100, t + 0.15);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  }
}
