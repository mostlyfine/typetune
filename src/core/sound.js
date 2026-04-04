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
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    gain.gain.value = 0.05;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  #playError() {
    if (!this.#enabled) return;
    const ctx = this.#ensureCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 300;
    osc.type = 'square';
    gain.gain.value = 0.08;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }
}
