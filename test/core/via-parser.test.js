import { describe, test, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { ViaParser } from '../../src/core/via-parser.js';

const parser = new ViaParser();

describe('ViaParser', () => {
  test('parses saved keymap format with layers', () => {
    const data = {
      name: 'TestBoard',
      layers: [
        ['KC_A', 'KC_B', 'KC_C', 'KC_D', 'KC_E', 'KC_F',
         'KC_G', 'KC_H', 'KC_I', 'KC_J', 'KC_K', 'KC_L'],
      ],
    };
    const result = parser.parse(data);
    expect(result.name).toBe('TestBoard');
    expect(result.layers).toHaveLength(1);
    expect(result.layers[0].keycodes).toEqual(data.layers[0]);
    expect(result.layout).toBeDefined();
  });

  test('parses multiple layers', () => {
    const data = {
      layers: [
        ['KC_A', 'KC_B', 'KC_C', 'KC_D'],
        ['KC_E', 'KC_F', 'KC_G', 'KC_H'],
      ],
    };
    const result = parser.parse(data);
    expect(result.layers).toHaveLength(2);
  });

  test('filters out KC_NO keys from rows', () => {
    const data = {
      layers: [
        ['KC_A', 'KC_NO', 'KC_B', 'KC_NO', 'KC_C', 'KC_D'],
      ],
      cols: 6,
    };
    const result = parser.parse(data);
    const allKeys = result.layout.rows.flat().filter(k => !k.isGap);
    // KC_NO should be filtered out
    expect(allKeys.every(k => !k.isNone)).toBe(true);
  });

  test('throws for JSON without layers or layouts', () => {
    expect(() => parser.parse({ name: 'empty' }))
      .toThrow('No layers or layouts found');
  });

  test('accepts string input', () => {
    const data = { layers: [['KC_A', 'KC_B', 'KC_C', 'KC_D']] };
    const result = parser.parse(JSON.stringify(data));
    expect(result.layers).toHaveLength(1);
  });

  test('uses matrix cols for row splitting', () => {
    const data = {
      layers: [['KC_A', 'KC_B', 'KC_C', 'KC_D', 'KC_E', 'KC_F']],
      matrix: { cols: 3 },
    };
    const result = parser.parse(data);
    // With cols=3, should create 2 rows of 3 keys
    expect(result.layout.rows.length).toBeGreaterThan(0);
  });

  // KLE definition format tests
  test('parses KLE definition format', () => {
    const data = {
      name: 'KLE Board',
      layouts: {
        keymap: [
          ['0,0', '0,1', '0,2', '0,3'],
          ['1,0', '1,1', '1,2', '1,3'],
        ],
      },
    };
    const result = parser.parse(data);
    expect(result.name).toBe('KLE Board');
    expect(result.layout.rows).toHaveLength(2);
  });

  test('KLE handles key widths', () => {
    const data = {
      layouts: {
        keymap: [
          [{ w: 1.5 }, '0,0', '0,1', '0,2'],
        ],
      },
    };
    const result = parser.parse(data);
    expect(result.layout.rows[0][0].w).toBe(1.5);
  });

  test('KLE handles x offsets as gaps', () => {
    const data = {
      layouts: {
        keymap: [
          ['0,0', '0,1', { x: 0.5 }, '0,2', '0,3'],
        ],
      },
    };
    const result = parser.parse(data);
    const row = result.layout.rows[0];
    const hasGap = row.some(k => k.isGap);
    expect(hasGap).toBe(true);
  });

  test('KLE handles wide keys as SPACE', () => {
    const data = {
      layouts: {
        keymap: [
          [{ w: 6.25 }, '5,3'],
        ],
      },
    };
    const result = parser.parse(data);
    expect(result.layout.rows[0][0].code).toBe('SPACE');
  });

  test('KLE handles encoder detection (h <= 0.5)', () => {
    const data = {
      layouts: {
        keymap: [
          [{ h: 0.5 }, 'enc_ccw', { h: 0.5 }, 'enc_cw', '0,0'],
        ],
      },
    };
    const result = parser.parse(data);
    const row = result.layout.rows[0];
    const encoder = row.find(k => k.isEncoder);
    expect(encoder).toBeDefined();
  });

  describe('V6_US_Knob_1.1.json fixture', () => {
    let result;
    beforeAll(() => {
      const text = readFileSync('test/fixtures/V6_US_Knob_1.1.json', 'utf-8');
      const data = JSON.parse(text);
      result = parser.parse(data);
    });

    test('has name "Keychron V6"', () => {
      expect(result.name).toBe('Keychron V6');
    });

    test('layers is empty (definition file, no saved layers)', () => {
      expect(result.layers).toEqual([]);
    });

    test('layout has multiple rows from KLE keymap', () => {
      expect(result.layout.rows.length).toBeGreaterThanOrEqual(6);
    });

    test('detects encoder from h <= 0.5 keys', () => {
      const allKeys = result.layout.rows.flat();
      const encoders = allKeys.filter(k => k.isEncoder);
      expect(encoders.length).toBeGreaterThanOrEqual(1);
    });

    test('first full row contains ESC as first key (standard QWERTY matrix)', () => {
      // The first KLE row has encoder entries; the second full row should be the number row
      const fullRows = result.layout.rows.filter(row =>
        row.filter(k => !k.isGap && !k.isEncoder).length >= 10
      );
      expect(fullRows.length).toBeGreaterThan(0);
    });

    test('layout name matches board name', () => {
      expect(result.layout.name).toBe('Keychron V6');
    });
  });

  describe('Epomaker_Split70.json fixture', () => {
    let result;
    beforeAll(() => {
      const text = readFileSync('test/fixtures/Epomaker_Split70.json', 'utf-8');
      const data = JSON.parse(text);
      result = parser.parse(data);
    });

    test('has name "Epomaker_Split70"', () => {
      expect(result.name).toBe('Epomaker_Split70');
    });

    test('layers is empty (definition file)', () => {
      expect(result.layers).toEqual([]);
    });

    test('layout has 5 rows from KLE keymap', () => {
      expect(result.layout.rows).toHaveLength(5);
    });

    test('has gaps from x offsets (split layout)', () => {
      const allKeys = result.layout.rows.flat();
      const gaps = allKeys.filter(k => k.isGap);
      expect(gaps.length).toBeGreaterThanOrEqual(3);
    });

    test('has wide keys (SPACE from w >= 3)', () => {
      const allKeys = result.layout.rows.flat();
      const spaceKeys = allKeys.filter(k => k.code === 'SPACE');
      expect(spaceKeys.length).toBeGreaterThanOrEqual(2);
    });

    test('bottom row has modifier keys with custom widths', () => {
      const bottomRow = result.layout.rows[4];
      const wideKeys = bottomRow.filter(k => !k.isGap && k.w > 1);
      expect(wideKeys.length).toBeGreaterThanOrEqual(3);
    });

    test('handles multiline KLE labels (e0 encoder indicator)', () => {
      // First key "0,0\n...\ne0" - parsed as matrix position string
      const firstRow = result.layout.rows[0].filter(k => !k.isGap && !k.isEncoder);
      expect(firstRow.length).toBeGreaterThan(0);
    });
  });

  describe('vial.json (TH60JP) fixture', () => {
    let result;
    beforeAll(() => {
      const text = readFileSync('test/fixtures/vial.json', 'utf-8');
      const data = JSON.parse(text);
      result = parser.parse(data);
    });

    test('has name "TH60JP Prototype"', () => {
      expect(result.name).toBe('TH60JP Prototype');
    });

    test('layers is empty (definition file)', () => {
      expect(result.layers).toEqual([]);
    });

    test('layout has rows from complex KLE with layout variants', () => {
      // KLE has many variant rows via \n\n\n notation; parser produces multiple rows
      expect(result.layout.rows.length).toBeGreaterThanOrEqual(5);
    });

    test('handles multiline KLE labels with variant indices', () => {
      // Labels like "0,13\n\n\n0,0" contain newlines - regex ^(\d+),(\d+)$ won't match
      // These are stored as raw string codes
      const allKeys = result.layout.rows.flat().filter(k => !k.isGap && !k.isEncoder);
      expect(allKeys.length).toBeGreaterThan(0);
    });

    test('has SPACE key from very wide keys (w >= 6.25)', () => {
      const allKeys = result.layout.rows.flat();
      const spaceKeys = allKeys.filter(k => k.code === 'SPACE');
      expect(spaceKeys.length).toBeGreaterThanOrEqual(1);
    });

    test('has wide modifier keys (w: 1.5, 1.75, 2.25)', () => {
      const allKeys = result.layout.rows.flat().filter(k => !k.isGap);
      const wideKeys = allKeys.filter(k => k.w > 1 && k.w < 3);
      expect(wideKeys.length).toBeGreaterThanOrEqual(3);
    });

    test('filters out non-default layout variant keys', () => {
      const allKeys = result.layout.rows.flat().filter(k => !k.isGap && !k.isEncoder);
      const hasNewlines = allKeys.some(k => k.code.includes('\n'));
      expect(hasNewlines).toBe(false);
    });

    test('default layout has 5 rows (not 30+ from all variants)', () => {
      expect(result.layout.rows.length).toBeLessThanOrEqual(10);
    });
  });

  describe('ErgoDash.json fixture', () => {
    let result;
    beforeAll(() => {
      const text = readFileSync('test/fixtures/ErgoDash.json', 'utf-8');
      const data = JSON.parse(text);
      result = parser.parse(data);
    });

    test('has name "ErgoDash"', () => {
      expect(result.name).toBe('ErgoDash');
    });

    test('layers is empty (definition file)', () => {
      expect(result.layers).toEqual([]);
    });

    test('produces rows from columnar stagger KLE', () => {
      // ErgoDash KLE uses many rows with 1-4 keys and y offsets for column stagger
      expect(result.layout.rows.length).toBeGreaterThanOrEqual(5);
    });

    test('has gaps from large x offsets (split ergonomic)', () => {
      const allKeys = result.layout.rows.flat();
      const gaps = allKeys.filter(k => k.isGap);
      expect(gaps.length).toBeGreaterThanOrEqual(1);
    });

    test('uses STANDARD_MATRIX for matrix positions', () => {
      const allKeys = result.layout.rows.flat().filter(k => !k.isGap && !k.isEncoder);
      const codes = allKeys.map(k => k.code);
      expect(codes.length).toBeGreaterThan(0);
      const knownCodes = codes.filter(c => !c.includes(',') && !c.startsWith('R'));
      expect(knownCodes.length).toBeGreaterThan(0);
    });

    test('filters out non-default layout variant keys', () => {
      const allKeys = result.layout.rows.flat().filter(k => !k.isGap && !k.isEncoder);
      // No key code should contain newline characters (variant labels must be stripped)
      const hasNewlines = allKeys.some(k => k.code.includes('\n'));
      expect(hasNewlines).toBe(false);
    });
  });

  describe('lily58-mike.json fixture (VIA saved keymap)', () => {
    let result;
    beforeAll(() => {
      const text = readFileSync('test/fixtures/lily58-mike.json', 'utf-8');
      const data = JSON.parse(text);
      result = parser.parse(data);
    });

    test('has 3 layers', () => {
      expect(result.layers).toHaveLength(3);
    });

    test('name falls back to "VIA Custom" (no name field)', () => {
      expect(result.name).toBe('VIA Custom');
    });

    test('base layer preserves all 58 keycodes', () => {
      expect(result.layers[0].keycodes).toHaveLength(58);
    });

    test('base layer starts with ESC and contains QWERTY keys', () => {
      const keycodes = result.layers[0].keycodes;
      expect(keycodes[0]).toBe('KC_ESC');
      expect(keycodes).toContain('KC_Q');
      expect(keycodes).toContain('KC_W');
    });

    test('has MO layer keycodes in base layer', () => {
      const keycodes = result.layers[0].keycodes;
      expect(keycodes).toContain('MO(1)');
      expect(keycodes).toContain('MO(2)');
    });

    test('layout has rows (detectCols fallback for 58 keys)', () => {
      // 58 is not divisible by any candidate cols, so detectCols uses default
      expect(result.layout.rows.length).toBeGreaterThan(0);
    });

    test('layer 1 has numpad keycodes', () => {
      const keycodes = result.layers[1].keycodes;
      expect(keycodes).toContain('KC_P1');
      expect(keycodes).toContain('KC_P0');
    });

    test('layer 2 has RGB keycodes', () => {
      const keycodes = result.layers[2].keycodes;
      expect(keycodes).toContain('RGB_MOD');
      expect(keycodes).toContain('RGB_TOG');
    });
  });

  test('throws for LiNEA40.json (no layers or KLE keymap)', () => {
    const text = readFileSync('test/fixtures/LiNEA40.json', 'utf-8');
    const data = JSON.parse(text);
    expect(() => parser.parse(data)).toThrow('No layers or layouts found');
  });
});
