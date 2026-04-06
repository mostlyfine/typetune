// @vitest-environment jsdom
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { TypingEngine } from '../../src/core/typing-engine.js';
import { EventBus } from '../../src/core/event-bus.js';

describe('TypingEngine', () => {
  let bus, engine;

  beforeEach(() => {
    vi.useFakeTimers();
    bus = new EventBus();
    engine = new TypingEngine(bus);
  });

  afterEach(() => {
    engine.stop();
    vi.useRealTimers();
  });

  function keydown(key, opts = {}) {
    document.dispatchEvent(new KeyboardEvent('keydown', { key, ...opts }));
  }

  test('setText() resets state', () => {
    engine.setText('hello');
    expect(engine.text).toBe('hello');
    expect(engine.position).toBe(0);
    expect(engine.errors).toEqual([]);
  });

  test('setText() computes skip positions for leading whitespace', () => {
    engine.setText('  hello\n  world');
    // Positions 0,1 (leading spaces) and 8,9 (leading spaces after newline) are skipped
    expect(engine.skipPositions.has(0)).toBe(true);
    expect(engine.skipPositions.has(1)).toBe(true);
    expect(engine.skipPositions.has(8)).toBe(true);
    expect(engine.skipPositions.has(9)).toBe(true);
  });

  test('setText() advances position past leading skips', () => {
    engine.setText('  hello');
    expect(engine.position).toBe(2); // skip past leading spaces
  });

  test('text:loaded event calls setText', () => {
    bus.emit('text:loaded', { text: 'test' });
    expect(engine.text).toBe('test');
  });

  test('setMode() sets time mode with limit', () => {
    engine.setMode('time', 30);
    // Internal state, verified via behavior
    engine.setText('abc');
    engine.start();
    // Just verify no error
    engine.stop();
  });

  test('setMode() sets chars mode with limit', () => {
    engine.setMode('chars', 50);
    engine.setText('abc');
    engine.start();
    engine.stop();
  });

  test('start() enables keydown handling', () => {
    engine.setText('abc');
    engine.start();
    const spy = vi.fn();
    bus.on('typing:input', spy);
    // Space to start, then 'a' as input
    keydown(' ');
    keydown('a');
    expect(spy).toHaveBeenCalled();
  });

  test('stop() removes keydown listener', () => {
    engine.setText('abc');
    engine.start();
    engine.stop();
    const spy = vi.fn();
    bus.on('typing:input', spy);
    keydown('a');
    expect(spy).not.toHaveBeenCalled();
  });

  test('correct character advances position', () => {
    engine.setText('abc');
    engine.start();
    keydown(' '); // start
    keydown('a');
    expect(engine.position).toBe(1);
  });

  test('incorrect character records error and emits typing:error', () => {
    engine.setText('abc');
    engine.start();
    const errorSpy = vi.fn();
    bus.on('typing:error', errorSpy);
    keydown(' '); // start
    keydown('x'); // wrong
    expect(engine.errors).toHaveLength(1);
    expect(engine.errors[0]).toEqual({ position: 0, expected: 'a', actual: 'x' });
    expect(errorSpy).toHaveBeenCalledWith({ position: 0, expected: 'a', actual: 'x' });
  });

  test('backspace decrements position and removes error', () => {
    engine.setText('abc');
    engine.start();
    keydown(' ');
    keydown('x'); // error at 0
    expect(engine.position).toBe(1);
    keydown('Backspace');
    expect(engine.position).toBe(0);
    expect(engine.errors).toHaveLength(0);
  });

  test('ignores modifier-only keys', () => {
    engine.setText('abc');
    engine.start();
    const spy = vi.fn();
    bus.on('typing:input', spy);
    keydown('Shift');
    keydown('Control');
    keydown('Alt');
    keydown('Meta');
    keydown('CapsLock');
    expect(spy).not.toHaveBeenCalled();
  });

  test('ignores shortcuts (ctrl+key, meta+key, alt+key)', () => {
    engine.setText('abc');
    engine.start();
    const spy = vi.fn();
    bus.on('typing:input', spy);
    keydown('a', { ctrlKey: true });
    keydown('a', { metaKey: true });
    keydown('a', { altKey: true });
    expect(spy).not.toHaveBeenCalled();
  });

  test('maps Enter key to newline', () => {
    engine.setText('a\nb');
    engine.start();
    keydown(' ');
    keydown('a');
    keydown('Enter');
    expect(engine.position).toBe(2);
  });

  test('skips positions marked as leading whitespace', () => {
    engine.setText('a\n  b');
    engine.start();
    keydown(' ');
    keydown('a');
    keydown('Enter');
    // After newline, position should skip past '  ' to 'b' at position 4
    expect(engine.position).toBe(4);
  });

  test('Space/Enter before active starts session', () => {
    engine.setText('abc');
    engine.start();
    const startSpy = vi.fn();
    bus.on('typing:start', startSpy);
    keydown(' ');
    expect(startSpy).toHaveBeenCalled();
  });

  test('first real input triggers typing:start', () => {
    engine.setText('abc');
    engine.start();
    const startSpy = vi.fn();
    bus.on('typing:start', startSpy);
    keydown('a');
    expect(startSpy).toHaveBeenCalled();
  });

  test('free mode completes when position reaches end', () => {
    engine.setMode('free');
    engine.setText('ab');
    engine.start();
    const completeSpy = vi.fn();
    bus.on('typing:complete', completeSpy);
    keydown(' ');
    keydown('a');
    keydown('b');
    expect(completeSpy).toHaveBeenCalled();
    const stats = completeSpy.mock.calls[0][0];
    expect(stats).toHaveProperty('wpm');
    expect(stats).toHaveProperty('accuracy');
    expect(stats).toHaveProperty('errors');
  });

  test('chars mode completes when correct count reaches limit', () => {
    engine.setMode('chars', 2);
    engine.setText('abcdef');
    engine.start();
    const completeSpy = vi.fn();
    bus.on('typing:complete', completeSpy);
    keydown(' ');
    keydown('a');
    keydown('b');
    expect(completeSpy).toHaveBeenCalled();
  });

  test('time mode completes on timeout', () => {
    engine.setMode('time', 1); // 1 second
    engine.setText('abcdef');
    engine.start();
    const completeSpy = vi.fn();
    bus.on('typing:complete', completeSpy);
    keydown(' ');
    vi.setSystemTime(Date.now() + 1500);
    vi.advanceTimersByTime(1500);
    expect(completeSpy).toHaveBeenCalled();
  });

  test('time mode duration is capped at timeLimit', () => {
    engine.setMode('time', 1); // 1 second
    engine.setText('abcdef');
    engine.start();
    const completeSpy = vi.fn();
    bus.on('typing:complete', completeSpy);
    keydown(' ');
    // Simulate interval firing 200ms late (1.2s elapsed)
    vi.setSystemTime(Date.now() + 1200);
    vi.advanceTimersByTime(1200);
    expect(completeSpy).toHaveBeenCalled();
    const stats = completeSpy.mock.calls[0][0];
    expect(stats.duration).toBe(1);
  });

  test('emits typing:progress with payload', () => {
    engine.setText('abc');
    engine.start();
    const progressSpy = vi.fn();
    bus.on('typing:progress', progressSpy);
    keydown(' ');
    keydown('a');
    expect(progressSpy).toHaveBeenCalled();
    const payload = progressSpy.mock.calls[0][0];
    expect(payload).toHaveProperty('position');
    expect(payload).toHaveProperty('total');
    expect(payload).toHaveProperty('wpm');
    expect(payload).toHaveProperty('accuracy');
    expect(payload).toHaveProperty('errors');
    expect(payload).toHaveProperty('remaining');
  });

  test('emits highlight:key for current position', () => {
    const highlightSpy = vi.fn();
    bus.on('highlight:key', highlightSpy);
    engine.setText('abc'); // setText emits highlight for first position
    expect(highlightSpy).toHaveBeenCalledWith({ char: 'a' });
  });

  test('does nothing with empty text', () => {
    engine.setText('');
    engine.start();
    const spy = vi.fn();
    bus.on('typing:input', spy);
    keydown('a');
    // No input emitted because text is empty
    expect(spy).not.toHaveBeenCalled();
  });

  test('stats timer emits progress periodically', () => {
    engine.setText('abcdef');
    engine.start();
    const progressSpy = vi.fn();
    bus.on('typing:progress', progressSpy);
    keydown(' '); // starts session
    vi.advanceTimersByTime(600); // stats timer fires at 500ms
    expect(progressSpy.mock.calls.length).toBeGreaterThanOrEqual(1);
  });
});
