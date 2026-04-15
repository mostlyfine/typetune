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

  test('builds stats bar with elapsed and remaining only', () => {
    expect(container.querySelector('[data-stat="elapsed"]')).not.toBeNull();
    expect(container.querySelector('[data-stat="remaining"]')).not.toBeNull();
    expect(container.querySelector('[data-stat="wpm"]')).toBeNull();
    expect(container.querySelector('[data-stat="accuracy"]')).toBeNull();
    expect(container.querySelector('[data-stat="errors"]')).toBeNull();
  });

  test('typing:progress updates elapsed and remaining', () => {
    bus.emit('typing:progress', { wpm: 60, accuracy: 95.5, errors: 3, elapsed: 12, remaining: 42 });
    expect(container.querySelector('[data-stat="elapsed"]').textContent).toBe('12s');
    expect(container.querySelector('[data-stat="remaining"]').textContent).toBe('42');
  });

  test('typing:complete shows result panel and hides stats bar', () => {
    bus.emit('typing:complete', { wpm: 80, accuracy: 98, errors: 2, duration: 30.5 });
    const result = container.querySelector('[data-stat="result"]');
    const bar = container.querySelector('.stats-bar');
    expect(result.hidden).toBe(false);
    expect(bar.hidden).toBe(true);
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

  test('text:loaded resets values and restores bar', () => {
    bus.emit('typing:progress', { elapsed: 12, remaining: 42 });
    bus.emit('typing:complete', { wpm: 80, accuracy: 98, errors: 2, duration: 30 });
    bus.emit('text:loaded', {});
    expect(container.querySelector('[data-stat="elapsed"]').textContent).toBe('0s');
    expect(container.querySelector('[data-stat="remaining"]').textContent).toBe('-');
    expect(container.querySelector('.stats-bar').hidden).toBe(false);
    expect(container.querySelector('[data-stat="result"]').hidden).toBe(true);
  });
});
