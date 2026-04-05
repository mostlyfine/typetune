import { describe, test, expect } from 'vitest';
import { FINGERS, KEY_TO_FINGER, isRightHandKey, getFingerForChar, getFingersForLayerMapping } from '../../src/data/key-finger-map.js';

describe('FINGERS', () => {
  test('has all 10 finger identifiers', () => {
    expect(Object.keys(FINGERS)).toHaveLength(10);
    expect(FINGERS.L_PINKY).toBe('l-pinky');
    expect(FINGERS.R_THUMB).toBe('r-thumb');
  });
});

describe('KEY_TO_FINGER', () => {
  test('maps left-hand keys correctly', () => {
    expect(KEY_TO_FINGER.A).toBe('l-pinky');
    expect(KEY_TO_FINGER.S).toBe('l-ring');
    expect(KEY_TO_FINGER.D).toBe('l-middle');
    expect(KEY_TO_FINGER.F).toBe('l-index');
  });

  test('maps right-hand keys correctly', () => {
    expect(KEY_TO_FINGER.J).toBe('r-index');
    expect(KEY_TO_FINGER.K).toBe('r-middle');
    expect(KEY_TO_FINGER.L).toBe('r-ring');
    expect(KEY_TO_FINGER.SEMI).toBe('r-pinky');
  });
});

describe('isRightHandKey', () => {
  test('returns true for right-hand codes', () => {
    expect(isRightHandKey('J')).toBe(true);
    expect(isRightHandKey('SPACE')).toBe(true);
  });

  test('returns false for left-hand codes', () => {
    expect(isRightHandKey('A')).toBe(false);
    expect(isRightHandKey('F')).toBe(false);
  });

  test('returns false for unknown codes', () => {
    expect(isRightHandKey('UNKNOWN')).toBe(false);
  });
});

describe('getFingerForChar', () => {
  test('returns correct finger for lowercase letters', () => {
    const fingers = getFingerForChar('a');
    expect(fingers).toContain('l-pinky');
    expect(fingers).toHaveLength(1);
  });

  test('includes shift finger for uppercase letters', () => {
    const fingers = getFingerForChar('A');
    expect(fingers).toContain('l-pinky');
    expect(fingers).toContain('r-pinky'); // RSHIFT for left-hand key
  });

  test('uses LSHIFT for right-hand uppercase', () => {
    const fingers = getFingerForChar('J');
    expect(fingers).toContain('r-index');
    expect(fingers).toContain('l-pinky'); // LSHIFT
  });

  test('returns null for unmapped characters', () => {
    expect(getFingerForChar('★')).toBeNull();
  });
});

describe('getFingersForLayerMapping', () => {
  test('returns activator + target fingers', () => {
    const result = getFingersForLayerMapping({
      activatorFinger: 'l-thumb',
      targetCode: 'J',
      shift: false,
    });
    expect(result).toContain('l-thumb');
    expect(result).toContain('r-index');
  });

  test('includes shift finger when shift is true', () => {
    const result = getFingersForLayerMapping({
      activatorFinger: 'l-thumb',
      targetCode: 'J',
      shift: true,
    });
    expect(result).toContain('l-pinky'); // LSHIFT for right-hand key
  });

  test('handles missing activatorFinger', () => {
    const result = getFingersForLayerMapping({
      targetCode: 'A',
      shift: false,
    });
    expect(result).toContain('l-pinky');
    expect(result).toHaveLength(1);
  });
});
