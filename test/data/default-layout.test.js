import { describe, test, expect } from 'vitest';
import { QWERTY_LAYOUT } from '../../src/data/default-layout.js';

describe('QWERTY_LAYOUT', () => {
  test('has name QWERTY (Standard)', () => {
    expect(QWERTY_LAYOUT.name).toBe('QWERTY (Standard)');
  });

  test('has 5 rows', () => {
    expect(QWERTY_LAYOUT.rows).toHaveLength(5);
  });

  test('rows have expected key counts', () => {
    const counts = QWERTY_LAYOUT.rows.map(r => r.length);
    expect(counts).toEqual([14, 14, 13, 12, 7]);
  });

  test('each key has code and w properties', () => {
    for (const row of QWERTY_LAYOUT.rows) {
      for (const key of row) {
        expect(key).toHaveProperty('code');
        expect(key).toHaveProperty('w');
        expect(typeof key.code).toBe('string');
        expect(typeof key.w).toBe('number');
      }
    }
  });
});
