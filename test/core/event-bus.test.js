import { describe, test, expect, vi } from 'vitest';
import { EventBus } from '../../src/core/event-bus.js';

describe('EventBus', () => {
  test('on() registers callback that fires on emit()', () => {
    const bus = new EventBus();
    const cb = vi.fn();
    bus.on('test', cb);
    bus.emit('test', 'data');
    expect(cb).toHaveBeenCalledWith('data');
  });

  test('on() returns unsubscribe function', () => {
    const bus = new EventBus();
    const cb = vi.fn();
    const unsub = bus.on('test', cb);
    unsub();
    bus.emit('test');
    expect(cb).not.toHaveBeenCalled();
  });

  test('off() removes a specific callback', () => {
    const bus = new EventBus();
    const cb = vi.fn();
    bus.on('test', cb);
    bus.off('test', cb);
    bus.emit('test');
    expect(cb).not.toHaveBeenCalled();
  });

  test('emit() passes payload to all listeners', () => {
    const bus = new EventBus();
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    bus.on('test', cb1);
    bus.on('test', cb2);
    bus.emit('test', { key: 'value' });
    expect(cb1).toHaveBeenCalledWith({ key: 'value' });
    expect(cb2).toHaveBeenCalledWith({ key: 'value' });
  });

  test('emit() on event with no listeners does not throw', () => {
    const bus = new EventBus();
    expect(() => bus.emit('nonexistent')).not.toThrow();
  });

  test('removing one listener does not affect others', () => {
    const bus = new EventBus();
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    bus.on('test', cb1);
    bus.on('test', cb2);
    bus.off('test', cb1);
    bus.emit('test');
    expect(cb1).not.toHaveBeenCalled();
    expect(cb2).toHaveBeenCalled();
  });

  test('off() on non-existent event does not throw', () => {
    const bus = new EventBus();
    expect(() => bus.off('nonexistent', () => {})).not.toThrow();
  });

  test('same callback can listen to multiple events', () => {
    const bus = new EventBus();
    const cb = vi.fn();
    bus.on('a', cb);
    bus.on('b', cb);
    bus.emit('a', 1);
    bus.emit('b', 2);
    expect(cb).toHaveBeenCalledTimes(2);
    expect(cb).toHaveBeenCalledWith(1);
    expect(cb).toHaveBeenCalledWith(2);
  });
});
