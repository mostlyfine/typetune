import { describe, test, expect } from 'vitest';
import { resolveKeycode, decodeVialKeycode, splitIntoRows } from '../../src/data/keycodes.js';

describe('resolveKeycode', () => {
  test('returns _NONE for null/undefined', () => {
    expect(resolveKeycode(null)).toEqual({ code: '_NONE', w: 1, isNone: true });
    expect(resolveKeycode(undefined)).toEqual({ code: '_NONE', w: 1, isNone: true });
  });

  test('resolves transparent aliases', () => {
    for (const alias of ['_______', 'KC_TRNS', 'KC_TRANSPARENT']) {
      expect(resolveKeycode(alias)).toEqual({ code: '_TRANS', w: 1, isTrans: true });
    }
  });

  test('resolves no-op aliases', () => {
    for (const alias of ['XXXXXXX', 'KC_NO']) {
      expect(resolveKeycode(alias)).toEqual({ code: '_NONE', w: 1, isNone: true });
    }
  });

  test('strips KC_ prefix and maps to internal code', () => {
    expect(resolveKeycode('KC_A').code).toBe('A');
    expect(resolveKeycode('KC_SPC').code).toBe('SPACE');
    expect(resolveKeycode('KC_MINS').code).toBe('MINUS');
  });

  test('handles MO(n) layer keys', () => {
    const result = resolveKeycode('MO(1)');
    expect(result).toEqual({ code: 'MO(1)', w: 1, isLayer: true });
  });

  test('handles TG, TO, OSL, TT, DF layer keys', () => {
    expect(resolveKeycode('TG(2)')).toEqual({ code: 'TG(2)', w: 1, isLayer: true });
    expect(resolveKeycode('TO(0)')).toEqual({ code: 'TO(0)', w: 1, isLayer: true });
    expect(resolveKeycode('OSL(3)')).toEqual({ code: 'OSL(3)', w: 1, isLayer: true });
    expect(resolveKeycode('TT(1)')).toEqual({ code: 'TT(1)', w: 1, isLayer: true });
    expect(resolveKeycode('DF(0)')).toEqual({ code: 'DF(0)', w: 1, isLayer: true });
  });

  test('handles LT(layer, keycode)', () => {
    const result = resolveKeycode('LT(1, KC_A)');
    expect(result).toEqual({ code: 'A', w: 1, layerTap: 1 });
  });

  test('handles MT(mod, keycode)', () => {
    const result = resolveKeycode('MT(MOD_LSFT, KC_A)');
    expect(result).toEqual({ code: 'A', w: 1, modTap: 'LSHIFT' });
  });

  test('handles shorthand mod-taps', () => {
    const result = resolveKeycode('LSFT_T(KC_A)');
    expect(result).toEqual({ code: 'A', w: 1, modTap: 'LSHIFT' });
  });

  test('handles LM(layer, mod)', () => {
    const result = resolveKeycode('LM(1, MOD_LSFT)');
    expect(result).toEqual({ code: 'LM(1)', w: 1, isLayer: true });
  });

  test('handles OSM(mod)', () => {
    const result = resolveKeycode('OSM(MOD_LSFT)');
    expect(result).toEqual({ code: 'LSHIFT', w: 1 });
  });

  test('handles VIA function keys', () => {
    expect(resolveKeycode('FN_MO13')).toEqual({ code: 'FN_MO13', w: 1, isLayer: true });
  });

  test('handles unknown function-style keycodes', () => {
    expect(resolveKeycode('RGB_TOG').isUnknown).toBe(true);
    expect(resolveKeycode('CUSTOM(1)').isUnknown).toBe(true);
    expect(resolveKeycode('RESET').isUnknown).toBe(true);
  });

  test('maps symbols via KC_ prefix', () => {
    expect(resolveKeycode('KC_SCLN').code).toBe('SEMI');
    expect(resolveKeycode('KC_QUOT').code).toBe('SQT');
    expect(resolveKeycode('KC_COMM').code).toBe('COMMA');
  });

  test('handles modifier keys', () => {
    expect(resolveKeycode('KC_LSFT').code).toBe('LSHIFT');
    expect(resolveKeycode('KC_RCTL').code).toBe('RCTRL');
    expect(resolveKeycode('KC_LGUI').code).toBe('LGUI');
  });

  test('handles raw keycode names without KC_ prefix', () => {
    expect(resolveKeycode('A').code).toBe('A');
    expect(resolveKeycode('SPACE').code).toBe('SPACE');
  });

  test('trims whitespace', () => {
    expect(resolveKeycode('  KC_A  ').code).toBe('A');
  });
});

describe('decodeVialKeycode', () => {
  test('passes strings through to resolveKeycode', () => {
    expect(decodeVialKeycode('KC_A').code).toBe('A');
  });

  test('decodes 0x0000 as _NONE', () => {
    expect(decodeVialKeycode(0x0000)).toEqual({ code: '_NONE', w: 1, isNone: true });
  });

  test('decodes 0x0001 as _TRANS', () => {
    expect(decodeVialKeycode(0x0001)).toEqual({ code: '_TRANS', w: 1, isTrans: true });
  });

  test('decodes basic HID keycodes', () => {
    expect(decodeVialKeycode(0x04).code).toBe('A');
    expect(decodeVialKeycode(0x2C).code).toBe('SPACE');
    expect(decodeVialKeycode(0x28).code).toBe('ENTER');
  });

  test('returns unknown for unmapped HID codes', () => {
    expect(decodeVialKeycode(0x00FF).isUnknown).toBe(true);
  });

  test('decodes MO(layer) range', () => {
    expect(decodeVialKeycode(0x5101)).toEqual({ code: 'MO(1)', w: 1, isLayer: true });
  });

  test('decodes TG(layer) range', () => {
    expect(decodeVialKeycode(0x5302)).toEqual({ code: 'TG(2)', w: 1, isLayer: true });
  });

  test('decodes TT(layer) range', () => {
    expect(decodeVialKeycode(0x5401)).toEqual({ code: 'TT(1)', w: 1, isLayer: true });
  });

  test('decodes TO(layer) range', () => {
    expect(decodeVialKeycode(0x5200)).toEqual({ code: 'TO(0)', w: 1, isLayer: true });
  });

  test('decodes LT(layer, kc) with known key', () => {
    // LT(1, A) = 0x4100 | 0x04 = 0x4104
    const result = decodeVialKeycode(0x4104);
    expect(result.code).toBe('A');
    expect(result.layerTap).toBe(1);
  });

  test('decodes LT(layer, kc) with unknown key', () => {
    const result = decodeVialKeycode(0x41FF);
    expect(result.isLayer).toBe(true);
  });

  test('decodes MT(mod, kc) with shift', () => {
    // MT with shift bit (0x02) and A (0x04) = 0x2204
    const result = decodeVialKeycode(0x2204);
    expect(result.code).toBe('A');
    expect(result.modTap).toBe('LSHIFT');
  });

  test('decodes MT(mod, kc) with right shift', () => {
    // Right modifier bit = 0x10, shift = 0x02: 0x1204
    const result = decodeVialKeycode(0x3204);
    expect(result.code).toBe('A');
    expect(result.modTap).toBe('RSHIFT');
  });

  test('decodes MT with unknown key', () => {
    const result = decodeVialKeycode(0x22FF);
    expect(result.isUnknown).toBe(true);
  });

  test('returns unknown for unrecognized ranges', () => {
    const result = decodeVialKeycode(0x7000);
    expect(result.isUnknown).toBe(true);
    expect(result.code).toMatch(/^0x/);
  });
});

describe('splitIntoRows', () => {
  const keys = Array.from({ length: 36 }, (_, i) => ({ code: `K${i}` }));

  test('splits by cols when provided', () => {
    const result = splitIntoRows(keys.slice(0, 12), 6);
    expect(result).toHaveLength(2);
    expect(result[0]).toHaveLength(6);
  });

  test('uses known pattern for 36 keys', () => {
    const result = splitIntoRows(keys);
    expect(result.map(r => r.length)).toEqual([10, 10, 10, 6]);
  });

  test('uses known pattern for 42 keys', () => {
    const k42 = Array.from({ length: 42 }, (_, i) => ({ code: `K${i}` }));
    const result = splitIntoRows(k42);
    expect(result.map(r => r.length)).toEqual([12, 12, 12, 6]);
  });

  test('falls back to heuristic for unknown count', () => {
    const k15 = Array.from({ length: 15 }, (_, i) => ({ code: `K${i}` }));
    const result = splitIntoRows(k15);
    // 15 <= 40, rowSize = 10
    expect(result[0]).toHaveLength(10);
    expect(result[1]).toHaveLength(5);
  });

  test('heuristic uses 12 for medium counts', () => {
    const k48 = Array.from({ length: 48 }, (_, i) => ({ code: `K${i}` }));
    // 48 is a known pattern [12,12,12,12], so use 50 instead
    const k50 = Array.from({ length: 50 }, (_, i) => ({ code: `K${i}` }));
    const result = splitIntoRows(k50);
    expect(result.map(r => r.length)).toEqual([12, 12, 12, 12, 2]);
  });
});
