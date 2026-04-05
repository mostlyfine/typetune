// @vitest-environment jsdom
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { Sound } from '../../src/core/sound.js';
import { EventBus } from '../../src/core/event-bus.js';

// Mock AudioContext
function createMockAudioContext() {
  const mockGain = {
    gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn(),
  };
  const mockFilter = {
    type: '',
    frequency: { value: 0 },
    Q: { value: 0 },
    connect: vi.fn(),
  };
  const mockOsc = {
    type: '',
    frequency: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  };
  const mockBuffer = {
    getChannelData: vi.fn().mockReturnValue(new Float32Array(100)),
  };
  const mockSource = {
    buffer: null,
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  };

  return {
    currentTime: 0,
    sampleRate: 44100,
    destination: {},
    createGain: vi.fn().mockReturnValue(mockGain),
    createBiquadFilter: vi.fn().mockReturnValue(mockFilter),
    createOscillator: vi.fn().mockReturnValue(mockOsc),
    createBuffer: vi.fn().mockReturnValue(mockBuffer),
    createBufferSource: vi.fn().mockReturnValue(mockSource),
  };
}

describe('Sound', () => {
  let bus, sound, mockCtx;

  beforeEach(() => {
    bus = new EventBus();
    mockCtx = createMockAudioContext();
    vi.stubGlobal('AudioContext', vi.fn().mockReturnValue(mockCtx));
    sound = new Sound(bus);
  });

  test('enabled is true by default', () => {
    expect(sound.enabled).toBe(true);
  });

  test('toggle() flips enabled state', () => {
    sound.toggle();
    expect(sound.enabled).toBe(false);
    sound.toggle();
    expect(sound.enabled).toBe(true);
  });

  test('toggle() emits sound:changed event', () => {
    const spy = vi.fn();
    bus.on('sound:changed', spy);
    sound.toggle();
    expect(spy).toHaveBeenCalledWith({ enabled: false });
  });

  test('correct input triggers playKey', () => {
    bus.emit('typing:input', { correct: true });
    expect(mockCtx.createBufferSource).toHaveBeenCalled();
  });

  test('playKey does nothing when disabled', () => {
    sound.toggle(); // disable
    bus.emit('typing:input', { correct: true });
    expect(mockCtx.createBufferSource).not.toHaveBeenCalled();
  });

  test('error event triggers playError', () => {
    bus.emit('typing:error', {});
    expect(mockCtx.createOscillator).toHaveBeenCalled();
  });

  test('playError does nothing when disabled', () => {
    sound.toggle(); // disable
    bus.emit('typing:error', {});
    expect(mockCtx.createOscillator).not.toHaveBeenCalled();
  });

  test('creates AudioContext lazily on first play', () => {
    // Before any sound play, AudioContext should not be created
    const AudioContextFn = globalThis.AudioContext;
    expect(AudioContextFn).toHaveBeenCalledTimes(0);
    bus.emit('typing:input', { correct: true });
    expect(AudioContextFn).toHaveBeenCalledTimes(1);
  });
});
