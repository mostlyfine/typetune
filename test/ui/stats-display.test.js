// @vitest-environment jsdom
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { EventBus } from '../../src/core/event-bus.js';
import { StatsDisplay } from '../../src/ui/stats-display.js';

describe('StatsDisplay', () => {
  let bus, container;

  beforeEach(() => {
    bus = new EventBus();
    container = document.createElement('div');
    document.body.appendChild(container);
    new StatsDisplay(bus, container);
  });

  test('builds stats bar with WPM, accuracy, errors, remaining', () => {
    expect(container.querySelector('[data-stat="wpm"]')).not.toBeNull();
    expect(container.querySelector('[data-stat="accuracy"]')).not.toBeNull();
    expect(container.querySelector('[data-stat="errors"]')).not.toBeNull();
    expect(container.querySelector('[data-stat="remaining"]')).not.toBeNull();
  });

  test('typing:progress updates displayed values', () => {
    bus.emit('typing:progress', { wpm: 60, accuracy: 95.5, errors: 3, remaining: 42 });
    expect(container.querySelector('[data-stat="wpm"]').textContent).toBe('60');
    expect(container.querySelector('[data-stat="accuracy"]').textContent).toBe('95.5%');
    expect(container.querySelector('[data-stat="errors"]').textContent).toBe('3');
    expect(container.querySelector('[data-stat="remaining"]').textContent).toBe('42');
  });

  test('typing:complete shows result panel', () => {
    bus.emit('typing:complete', { wpm: 80, accuracy: 98, errors: 2, duration: 30.5 });
    const result = container.querySelector('[data-stat="result"]');
    expect(result.hidden).toBe(false);
    expect(result.innerHTML).toContain('80');
    expect(result.innerHTML).toContain('98%');
    expect(result.innerHTML).toContain('30.5s');
  });

  test('result panel has retry button', () => {
    bus.emit('typing:complete', { wpm: 80, accuracy: 98, errors: 2, duration: 30 });
    const retryBtn = container.querySelector('.result-retry');
    expect(retryBtn).not.toBeNull();
  });

  test('retry button emits typing:retry', () => {
    bus.emit('typing:complete', { wpm: 80, accuracy: 98, errors: 2, duration: 30 });
    const spy = vi.fn();
    bus.on('typing:retry', spy);
    container.querySelector('.result-retry').click();
    expect(spy).toHaveBeenCalled();
  });

  test('text:loaded resets all values', () => {
    bus.emit('typing:progress', { wpm: 60, accuracy: 95, errors: 3, remaining: 42 });
    bus.emit('text:loaded', {});
    expect(container.querySelector('[data-stat="wpm"]').textContent).toBe('0');
    expect(container.querySelector('[data-stat="accuracy"]').textContent).toBe('100%');
    expect(container.querySelector('[data-stat="errors"]').textContent).toBe('0');
    expect(container.querySelector('[data-stat="remaining"]').textContent).toBe('-');
  });
});
