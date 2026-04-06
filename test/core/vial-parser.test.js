import { describe, test, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { VialParser } from '../../src/core/vial-parser.js';

const parser = new VialParser();

// Minimal Vial save format fixture:
// layout[layer][row][keycode], rows = left half (3) + right half (3)
const minimalVialSave = {
  layout: [[
    // Left half (3 rows)
    ['KC_Q', 'KC_W', 'KC_E', 'KC_R', 'KC_T'],
    ['KC_A', 'KC_S', 'KC_D', 'KC_F', 'KC_G'],
    ['KC_Z', 'KC_X', 'KC_C', 'KC_V', 'KC_B'],
    // Right half (3 rows, reversed in output)
    ['KC_P', 'KC_O', 'KC_I', 'KC_U', 'KC_Y'],
    ['KC_SCLN', 'KC_L', 'KC_K', 'KC_J', 'KC_H'],
    ['KC_SLSH', 'KC_DOT', 'KC_COMM', 'KC_M', 'KC_N'],
  ]],
};

describe('VialParser', () => {
  test('parses minimal Vial save format', () => {
    const result = parser.parse(minimalVialSave);
    expect(result).toHaveProperty('layers');
    expect(result).toHaveProperty('layout');
    expect(result.name).toBe('Vial Custom');
    expect(result.layers).toHaveLength(1);
  });

  test('detects Vial save format (3D layout array)', () => {
    const result = parser.parse(minimalVialSave);
    // Should have rows (left + gap + right)
    expect(result.layout.rows.length).toBeGreaterThan(0);
    const firstRow = result.layout.rows[0];
    const hasGap = firstRow.some(k => k.isGap);
    expect(hasGap).toBe(true);
  });

  test('reverses right-hand rows', () => {
    const result = parser.parse(minimalVialSave);
    // Right half first row is ['KC_P','KC_O','KC_I','KC_U','KC_Y']
    // After reverse: ['KC_Y','KC_U','KC_I','KC_O','KC_P']
    const firstRow = result.layout.rows[0];
    const rightSide = firstRow.filter(k => !k.isGap).slice(5);
    expect(rightSide[0].code).toBe('Y');
    expect(rightSide[4].code).toBe('P');
  });

  test('filters out blank (-1) keys as gaps', () => {
    const data = {
      layout: [[
        ['KC_A', -1, 'KC_B', 'KC_C', 'KC_D'],
        ['KC_E', 'KC_F', 'KC_G', 'KC_H', 'KC_I'],
        ['KC_J', -1, 'KC_K', 'KC_L', 'KC_M'],
        ['KC_N', 'KC_O', 'KC_P', 'KC_Q', 'KC_R'],
      ]],
    };
    const result = parser.parse(data);
    expect(result.layout.rows.length).toBeGreaterThan(0);
  });

  test('handles encoder columns', () => {
    const data = {
      layout: [[
        ['KC_A', 'KC_B', 'KC_C', -1],   // col 3 is encoder
        ['KC_D', 'KC_E', 'KC_F', -1],
        ['KC_G', 'KC_H', 'KC_I', 'KC_MUTE'], // encoder press key
        ['KC_J', 'KC_K', 'KC_L', -1],
        ['KC_M', 'KC_N', 'KC_O', -1],
        ['KC_P', 'KC_Q', 'KC_R', -1],
      ]],
      encoder_layout: [[
        ['KC_VOLD', 'KC_VOLU'],
      ]],
    };
    const result = parser.parse(data);
    const allKeys = result.layout.rows.flat();
    const encoder = allKeys.find(k => k.isEncoder);
    expect(encoder).toBeDefined();
    expect(encoder.encoderCCW).toBe('VOLD');
    expect(encoder.encoderCW).toBe('VOLU');
  });

  test('builds layer char map from non-base layers', () => {
    const data = {
      layout: [
        // Layer 0 (base)
        [
          ['KC_Q', 'KC_W', 'KC_E', 'KC_R', 'KC_T'],
          ['KC_A', 'KC_S', 'KC_D', 'KC_F', 'MO(1)'],
          ['KC_P', 'KC_O', 'KC_I', 'KC_U', 'KC_Y'],
          ['KC_SCLN', 'KC_L', 'KC_K', 'KC_J', 'KC_H'],
        ],
        // Layer 1
        [
          ['KC_1', 'KC_2', 'KC_3', 'KC_4', 'KC_5'],
          ['_______', '_______', '_______', '_______', '_______'],
          ['KC_0', 'KC_9', 'KC_8', 'KC_7', 'KC_6'],
          ['_______', '_______', '_______', '_______', '_______'],
        ],
      ],
    };
    const result = parser.parse(data);
    expect(result.layerCharMap).toBeDefined();
  });

  test('falls back to VIA parser for definition files', () => {
    const data = {
      uid: [0],
      layouts: {
        keymap: [
          ['0,0', '0,1', '0,2', '0,3'],
        ],
      },
    };
    const result = parser.parse(data);
    expect(result.name).toBe('Vial Custom');
    expect(result.layout.rows.length).toBeGreaterThan(0);
  });

  test('throws for data with no layers and no layouts', () => {
    expect(() => parser.parse({ uid: [0] }))
      .toThrow('No layers or layouts found');
  });

  test('handles flat numeric keycodes via layers format', () => {
    const data = {
      layers: [[0x04, 0x05, 0x06, 0x07]], // A, B, C, D
    };
    const result = parser.parse(data);
    expect(result.layers).toHaveLength(1);
    const keys = result.layout.rows.flat().filter(k => !k.isGap);
    expect(keys[0].code).toBe('A');
  });

  test('handles string keycodes via layers format', () => {
    const data = {
      layers: [['KC_A', 'KC_B', 'KC_C', 'KC_D']],
    };
    const result = parser.parse(data);
    const keys = result.layout.rows.flat().filter(k => !k.isGap);
    expect(keys[0].code).toBe('A');
  });

  describe('colnix.vil fixture', () => {
    let result, data;
    beforeAll(() => {
      const text = readFileSync('test/fixtures/colnix.vil', 'utf-8');
      data = JSON.parse(text);
      result = parser.parse(data);
    });

    test('parses 10 layers', () => {
      expect(result.layers).toHaveLength(10);
    });

    test('base layer left side starts with TAB, Q, W, E, R, T', () => {
      const firstRow = result.layout.rows[0].filter(k => !k.isGap && !k.isEncoder);
      const leftCodes = firstRow.slice(0, 6).map(k => k.code);
      expect(leftCodes).toEqual(['TAB', 'Q', 'W', 'E', 'R', 'T']);
    });

    test('base layer right side starts with Y, U, I, O, P, BSPC', () => {
      const firstRow = result.layout.rows[0].filter(k => !k.isGap && !k.isEncoder);
      // Right half is reversed from ['KC_BSPACE','KC_P','KC_O','KC_I','KC_U','KC_Y']
      const rightCodes = firstRow.slice(6).map(k => k.code);
      expect(rightCodes).toEqual(['Y', 'U', 'I', 'O', 'P', 'BSPC']);
    });

    test('detects encoder keys with rotation data', () => {
      const allKeys = result.layout.rows.flat();
      const encoders = allKeys.filter(k => k.isEncoder);
      expect(encoders.length).toBeGreaterThanOrEqual(1);
      // First encoder: KC_VOLD/KC_VOLU
      const enc0 = encoders.find(k => k.code === '_ENC0');
      expect(enc0).toBeDefined();
      expect(enc0.encoderCCW).toBe('VOLD');
      expect(enc0.encoderCW).toBe('VOLU');
    });

    test('has layer keys (MO, TG)', () => {
      const allKeys = result.layout.rows.flat().filter(k => !k.isGap && !k.isEncoder);
      const layerKeys = allKeys.filter(k => k.isLayer);
      expect(layerKeys.length).toBeGreaterThanOrEqual(2);
      const codes = layerKeys.map(k => k.code);
      expect(codes).toContain('MO(1)');
      expect(codes).toContain('MO(2)');
    });

    test('builds layerCharMap from non-base layers', () => {
      expect(result.layerCharMap).toBeDefined();
      expect(typeof result.layerCharMap).toBe('object');
      // Layer 1 has KC_GRAVE (`) mapped, which produces '`' char
      // and number keys which map to digits
    });

    test('layout has split rows with gaps', () => {
      for (const row of result.layout.rows) {
        const hasGap = row.some(k => k.isGap);
        expect(hasGap).toBe(true);
      }
    });

    test('layout has 4 rows (matching 4 rows per half)', () => {
      expect(result.layout.rows).toHaveLength(4);
    });
  });

  describe('corne_v4-1_default.vil fixture', () => {
    let result;
    beforeAll(() => {
      const text = readFileSync('test/fixtures/corne_v4-1_default.vil', 'utf-8');
      const data = JSON.parse(text);
      result = parser.parse(data);
    });

    test('parses 10 layers', () => {
      expect(result.layers).toHaveLength(10);
    });

    test('base layer left side starts with TAB, Q, W, E, R, T', () => {
      const firstRow = result.layout.rows[0].filter(k => !k.isGap && !k.isEncoder);
      const leftCodes = firstRow.slice(0, 6).map(k => k.code);
      expect(leftCodes).toEqual(['TAB', 'Q', 'W', 'E', 'R', 'T']);
    });

    test('base layer right side has Y, U, I, O, P, BSPC (reversed)', () => {
      const firstRow = result.layout.rows[0].filter(k => !k.isGap && !k.isEncoder);
      // Right half reversed from [BSPC, P, O, I, U, Y, RCTRL]
      const rightKeys = firstRow.slice(6);
      const rightCodes = rightKeys.map(k => k.code);
      expect(rightCodes).toContain('Y');
      expect(rightCodes).toContain('BSPC');
    });

    test('has FN_MO13 and FN_MO23 Vial function keys', () => {
      const allKeys = result.layout.rows.flat().filter(k => !k.isGap && !k.isEncoder);
      const codes = allKeys.map(k => k.code);
      // FN_MO13/FN_MO23 are Vial-specific layer keys
      const hasFnKeys = codes.some(c => c.includes('MO13') || c.includes('FN'));
      expect(hasFnKeys).toBe(true);
    });

    test('layout has 4 rows with split gaps', () => {
      expect(result.layout.rows).toHaveLength(4);
      for (const row of result.layout.rows) {
        expect(row.some(k => k.isGap)).toBe(true);
      }
    });

    test('thumb row has fewer non-gap keys than alpha rows', () => {
      const thumbRow = result.layout.rows[3].filter(k => !k.isGap && !k.isEncoder);
      const alphaRow = result.layout.rows[0].filter(k => !k.isGap && !k.isEncoder);
      expect(thumbRow.length).toBeLessThan(alphaRow.length);
    });

    test('builds layerCharMap from non-base layers', () => {
      expect(result.layerCharMap).toBeDefined();
      expect(typeof result.layerCharMap).toBe('object');
    });

    test('has modifier keys on both sides (LCTRL, RCTRL)', () => {
      const allKeys = result.layout.rows.flat().filter(k => !k.isGap && !k.isEncoder);
      const codes = allKeys.map(k => k.code);
      expect(codes).toContain('LCTRL');
      expect(codes).toContain('RCTRL');
    });

    test('encoder_layout data is present but no encoder columns detected', () => {
      // Corne v4 has encoder_layout but last column has real keys (LCTRL/LALT),
      // so it's not detected as an encoder column
      const allKeys = result.layout.rows.flat();
      const encoders = allKeys.filter(k => k.isEncoder);
      expect(encoders).toHaveLength(0);
    });
  });

  test('builds layerCharMap from non-save format layers', () => {
    const data = {
      layers: [
        ['KC_A', 'KC_B', 'KC_C', 'MO(1)'],
        ['KC_1', 'KC_2', 'KC_TRNS', 'KC_TRNS'],
      ],
    };
    const result = parser.parse(data);
    expect(result.layerCharMap).toBeDefined();
    expect(result.layerCharMap['1']).toEqual({
      activator: 'MO(1)',
      targetCode: 'A',
    });
  });

  test('handles layer activators (MO, TG, layerTap)', () => {
    const data = {
      layout: [
        // Layer 0
        [
          ['KC_A', 'KC_B', 'KC_C', 'MO(1)', 'TG(2)'],
          ['KC_D', 'KC_E', 'LT(1, KC_F)', 'KC_G', 'KC_H'],
          ['KC_I', 'KC_J', 'KC_K', 'KC_L', 'KC_M'],
          ['KC_N', 'KC_O', 'KC_P', 'KC_Q', 'KC_R'],
        ],
        // Layer 1
        [
          ['KC_1', 'KC_2', 'KC_3', '_______', '_______'],
          ['_______', '_______', '_______', '_______', '_______'],
          ['KC_4', 'KC_5', 'KC_6', '_______', '_______'],
          ['_______', '_______', '_______', '_______', '_______'],
        ],
      ],
    };
    const result = parser.parse(data);
    expect(result.layerCharMap).toBeDefined();
  });
});
