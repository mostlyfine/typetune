// @vitest-environment jsdom
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { EventBus } from '../../src/core/event-bus.js';
import { Keyboard } from '../../src/ui/keyboard.js';

describe('Keyboard', () => {
  let bus, container;

  beforeEach(() => {
    bus = new EventBus();
    container = document.createElement('div');
    document.body.appendChild(container);
    new Keyboard(bus, container);
  });

  test('renders default QWERTY layout', () => {
    const keys = container.querySelectorAll('.kb-key');
    expect(keys.length).toBeGreaterThan(0);
  });

  test('renders correct number of rows', () => {
    const rows = container.querySelectorAll('.kb-row');
    expect(rows.length).toBe(5); // QWERTY has 5 rows
  });

  test('highlight:key event highlights the correct key', () => {
    bus.emit('highlight:key', { char: 'a' });
    const highlighted = container.querySelectorAll('.kb-highlight');
    expect(highlighted.length).toBeGreaterThan(0);
    expect(highlighted[0].dataset.code).toBe('A');
  });

  test('shift keys highlight when character requires shift', () => {
    bus.emit('highlight:key', { char: 'A' }); // uppercase needs shift
    const highlighted = container.querySelectorAll('.kb-highlight');
    const codes = [...highlighted].map(el => el.dataset.code);
    expect(codes).toContain('A');
    // A is left-hand, so RSHIFT should highlight
    expect(codes).toContain('RSHIFT');
  });

  test('layout:changed event re-renders with new layout', () => {
    const newLayout = {
      name: 'Test',
      rows: [
        [{ code: 'A', w: 1 }, { code: 'B', w: 1 }],
      ],
    };
    bus.emit('layout:changed', { layout: newLayout, layerCharMap: {} });
    const keys = container.querySelectorAll('.kb-key');
    expect(keys.length).toBe(2);
  });

  test('typing:error event increments error count', () => {
    bus.emit('typing:error', { expected: 'a' });
    bus.emit('typing:error', { expected: 'a' });
    // Errors are tracked, shown on complete
    bus.emit('typing:complete', {});
    const errorKeys = container.querySelectorAll('[class*="kb-error"]');
    expect(errorKeys.length).toBeGreaterThan(0);
  });

  test('text:loaded event clears error heatmap', () => {
    bus.emit('typing:error', { expected: 'a' });
    bus.emit('typing:complete', {});
    bus.emit('text:loaded', {});
    const errorKeys = container.querySelectorAll('[class*="kb-error"]');
    expect(errorKeys.length).toBe(0);
  });

  test('highlight clears previous highlights', () => {
    bus.emit('highlight:key', { char: 'a' });
    bus.emit('highlight:key', { char: 'b' });
    const highlighted = container.querySelectorAll('.kb-highlight');
    // Only 'b' should be highlighted, not 'a'
    expect(highlighted.length).toBe(1);
    expect(highlighted[0].dataset.code).toBe('B');
  });

  test('renders gap keys with kb-gap class', () => {
    const gapLayout = {
      name: 'Split',
      rows: [
        [{ code: 'A', w: 1 }, { code: '_GAP', w: 0.5, isGap: true }, { code: 'B', w: 1 }],
      ],
    };
    bus.emit('layout:changed', { layout: gapLayout, layerCharMap: {} });
    const gaps = container.querySelectorAll('.kb-gap');
    expect(gaps.length).toBe(1);
  });

  test('renders encoder keys', () => {
    const encLayout = {
      name: 'Enc',
      rows: [
        [{ code: '_ENC0', w: 1, isEncoder: true, encoderCCW: 'VOLD', encoderCW: 'VOLU', encoderPress: 'MUTE' }],
      ],
    };
    bus.emit('layout:changed', { layout: encLayout, layerCharMap: {} });
    const encoders = container.querySelectorAll('.kb-encoder');
    expect(encoders.length).toBe(1);
  });

  test('renders layer keys with kb-layer class', () => {
    const layerLayout = {
      name: 'Layers',
      rows: [
        [{ code: 'MO(1)', w: 1, isLayer: true }, { code: 'A', w: 1 }],
      ],
    };
    bus.emit('layout:changed', { layout: layerLayout, layerCharMap: {} });
    const layerKeys = container.querySelectorAll('.kb-layer');
    expect(layerKeys.length).toBe(1);
  });
});
