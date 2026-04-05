// @vitest-environment jsdom
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { EventBus } from '../../src/core/event-bus.js';
import { TextDisplay } from '../../src/ui/text-display.js';

describe('TextDisplay', () => {
  let bus, container;

  beforeEach(() => {
    bus = new EventBus();
    container = document.createElement('div');
    document.body.appendChild(container);
    new TextDisplay(bus, container);
  });

  test('text:loaded builds DOM with character spans', () => {
    bus.emit('text:loaded', { text: 'abc' });
    const spans = container.querySelectorAll('span');
    expect(spans.length).toBeGreaterThanOrEqual(3);
  });

  test('first character gets td-cursor class', () => {
    bus.emit('text:loaded', { text: 'abc' });
    const cursor = container.querySelector('.td-cursor');
    expect(cursor).not.toBeNull();
    expect(cursor.textContent).toBe('a');
  });

  test('remaining characters get td-pending class', () => {
    bus.emit('text:loaded', { text: 'abc' });
    const pending = container.querySelectorAll('.td-pending');
    expect(pending.length).toBe(2); // b, c
  });

  test('correct input marks td-correct and moves cursor', () => {
    bus.emit('text:loaded', { text: 'abc' });
    bus.emit('typing:input', { correct: true, typedAt: 0, position: 1 });
    const correct = container.querySelector('.td-correct');
    expect(correct).not.toBeNull();
    expect(correct.textContent).toBe('a');
    const cursor = container.querySelector('.td-cursor');
    expect(cursor.textContent).toBe('b');
  });

  test('incorrect input marks td-error', () => {
    bus.emit('text:loaded', { text: 'abc' });
    bus.emit('typing:input', { correct: false, typedAt: 0, position: 1 });
    const error = container.querySelector('.td-error');
    expect(error).not.toBeNull();
    expect(error.textContent).toBe('a');
  });

  test('backspace clears error and moves cursor back', () => {
    bus.emit('text:loaded', { text: 'abc' });
    bus.emit('typing:input', { correct: false, typedAt: 0, position: 1 });
    bus.emit('typing:input', { type: 'backspace', position: 0 });
    const errors = container.querySelectorAll('.td-error');
    expect(errors.length).toBe(0);
    const cursor = container.querySelector('.td-cursor');
    expect(cursor.textContent).toBe('a');
  });

  test('skip positions get td-skip class', () => {
    bus.emit('text:loaded', { text: '  abc' });
    const skips = container.querySelectorAll('.td-skip');
    expect(skips.length).toBe(2); // 2 leading spaces
  });

  test('newline markers rendered as return symbols', () => {
    bus.emit('text:loaded', { text: 'a\nb' });
    const nl = container.querySelector('.td-newline');
    expect(nl).not.toBeNull();
    expect(nl.textContent).toBe('\u21B5');
  });

  test('empty text shows placeholder', () => {
    bus.emit('text:loaded', { text: '' });
    const placeholder = container.querySelector('.td-placeholder');
    expect(placeholder).not.toBeNull();
  });

  test('setSkipPositions updates skip positions', () => {
    const td = new TextDisplay(bus, container);
    td.setSkipPositions(new Set([0, 1]));
    // Just verify no error
  });
});
