import { describe, test, expect } from 'vitest';
import { ZMK_KEY_MAP, CHAR_TO_KEY } from '../../src/data/key-labels.js';

describe('ZMK_KEY_MAP', () => {
  test('has entries for letters A-Z', () => {
    for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
      expect(ZMK_KEY_MAP[letter]).toBeDefined();
      expect(ZMK_KEY_MAP[letter].char).toBe(letter.toLowerCase());
      expect(ZMK_KEY_MAP[letter].shiftChar).toBe(letter);
    }
  });

  test('has entries for numbers N1-N0', () => {
    for (let i = 0; i <= 9; i++) {
      const key = i === 0 ? 'N0' : `N${i}`;
      expect(ZMK_KEY_MAP[key]).toBeDefined();
      expect(ZMK_KEY_MAP[key].char).toBe(String(i));
    }
  });

  test('has entries for symbols', () => {
    expect(ZMK_KEY_MAP.SEMI.char).toBe(';');
    expect(ZMK_KEY_MAP.SQT.char).toBe("'");
    expect(ZMK_KEY_MAP.COMMA.char).toBe(',');
    expect(ZMK_KEY_MAP.DOT.char).toBe('.');
    expect(ZMK_KEY_MAP.FSLH.char).toBe('/');
  });

  test('special keys have correct chars', () => {
    expect(ZMK_KEY_MAP.SPACE.char).toBe(' ');
    expect(ZMK_KEY_MAP.ENTER.char).toBe('\n');
    expect(ZMK_KEY_MAP.TAB.char).toBe('\t');
  });
});

describe('CHAR_TO_KEY', () => {
  test('reverse lookup works for basic chars', () => {
    expect(CHAR_TO_KEY['a']).toEqual({ code: 'A', shift: false });
    expect(CHAR_TO_KEY[' ']).toEqual({ code: 'SPACE', shift: false });
    expect(CHAR_TO_KEY[';']).toEqual({ code: 'SEMI', shift: false });
  });

  test('maps shift chars correctly', () => {
    expect(CHAR_TO_KEY['!']).toEqual({ code: 'N1', shift: true });
    expect(CHAR_TO_KEY['@']).toEqual({ code: 'N2', shift: true });
    expect(CHAR_TO_KEY['A']).toEqual({ code: 'A', shift: true });
  });
});
