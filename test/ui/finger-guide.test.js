// @vitest-environment jsdom
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { EventBus } from '../../src/core/event-bus.js';
import { FingerGuide } from '../../src/ui/finger-guide.js';

describe('FingerGuide', () => {
  let bus, container;

  beforeEach(() => {
    bus = new EventBus();
    container = document.createElement('div');
    document.body.appendChild(container);
    new FingerGuide(bus, container);
  });

  test('renders SVG with finger elements', () => {
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    const fingers = container.querySelectorAll('.fg-finger');
    expect(fingers.length).toBe(10);
  });

  test('highlight:key highlights correct fingers for a character', () => {
    bus.emit('highlight:key', { char: 'a' });
    const active = container.querySelectorAll('.fg-active');
    expect(active.length).toBeGreaterThan(0);
    // 'a' is left pinky
    expect(active[0].dataset.finger).toBe('l-pinky');
  });

  test('highlights shift finger for uppercase characters', () => {
    bus.emit('highlight:key', { char: 'A' });
    const active = container.querySelectorAll('.fg-active');
    const fingers = [...active].map(el => el.dataset.finger);
    expect(fingers).toContain('l-pinky'); // key finger
    expect(fingers).toContain('r-pinky'); // shift finger (RSHIFT for left-hand key)
  });

  test('clears previous highlights on new highlight', () => {
    bus.emit('highlight:key', { char: 'a' });
    bus.emit('highlight:key', { char: 'j' });
    const active = container.querySelectorAll('.fg-active');
    const fingers = [...active].map(el => el.dataset.finger);
    expect(fingers).not.toContain('l-pinky');
    expect(fingers).toContain('r-index');
  });

  test('layout:changed updates layer char map', () => {
    bus.emit('layout:changed', {
      layerCharMap: {
        '!': { activator: 'MO(1)', targetCode: 'Q', activatorFinger: 'l-thumb' },
      },
    });
    bus.emit('highlight:key', { char: '!' });
    const active = container.querySelectorAll('.fg-active');
    expect(active.length).toBeGreaterThan(0);
  });
});
