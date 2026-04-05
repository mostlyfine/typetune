import { describe, test, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { KeymapLoader } from '../../src/core/keymap-loader.js';

// KeymapLoader integrates with real parsers, so we test dispatch logic
// via the returned result shape rather than mocking parsers.

describe('KeymapLoader', () => {
  const loader = new KeymapLoader();

  test('dispatches .keymap files to ZMK parser', () => {
    const zmkText = `
/ {
  keymap {
    compatible = "zmk,keymap";
    default_layer {
      bindings = <&kp A &kp B>;
    };
  };
};`;
    const result = loader.load(zmkText, 'test.keymap');
    expect(result).toHaveProperty('layers');
    expect(result.layers.length).toBeGreaterThan(0);
  });

  test('dispatches .dtsi files to ZMK parser', () => {
    const zmkText = `
/ {
  keymap {
    compatible = "zmk,keymap";
    default_layer {
      bindings = <&kp A &kp B>;
    };
  };
};`;
    const result = loader.load(zmkText, 'keys.dtsi');
    expect(result).toHaveProperty('layers');
  });

  test('dispatches .vil files to Vial parser', () => {
    // Vial save format: layout[layer][row][keycode], rows = left half + right half
    const vilData = {
      uid: [0],
      layout: [[
        ['KC_A', 'KC_B', 'KC_C'],
        ['KC_D', 'KC_E', 'KC_F'],
      ]],
    };
    const result = loader.load(JSON.stringify(vilData), 'layout.vil');
    expect(result).toHaveProperty('layers');
  });

  test('throws for .vil with invalid JSON', () => {
    expect(() => loader.load('not json', 'bad.vil'))
      .toThrow('Invalid .vil file');
  });

  test('dispatches .json with uid to Vial parser', () => {
    const data = {
      uid: [0],
      layout: [[
        ['KC_A', 'KC_B', 'KC_C'],
        ['KC_D', 'KC_E', 'KC_F'],
      ]],
    };
    const result = loader.load(JSON.stringify(data), 'layout.json');
    expect(result).toHaveProperty('layers');
  });

  test('dispatches .json without uid to VIA parser', () => {
    const data = {
      layers: [['KC_A', 'KC_B']],
    };
    const result = loader.load(JSON.stringify(data), 'layout.json');
    expect(result).toHaveProperty('layers');
  });

  test('throws for invalid .json', () => {
    expect(() => loader.load('not json', 'bad.json'))
      .toThrow('Invalid JSON');
  });

  test('content detection: keymap {} pattern goes to ZMK', () => {
    const text = `
/ {
  keymap {
    compatible = "zmk,keymap";
    base {
      bindings = <&kp Q &kp W>;
    };
  };
};`;
    const result = loader.load(text, '');
    expect(result).toHaveProperty('layers');
  });

  test('content detection: JSON with layers goes to VIA', () => {
    const data = { layers: [['KC_A']] };
    const result = loader.load(JSON.stringify(data), '');
    expect(result).toHaveProperty('layers');
  });

  test('content detection: JSON with uid goes to Vial', () => {
    const data = {
      uid: [0],
      layout: [[
        ['KC_A', 'KC_B', 'KC_C'],
        ['KC_D', 'KC_E', 'KC_F'],
      ]],
    };
    const result = loader.load(JSON.stringify(data), '');
    expect(result).toHaveProperty('layers');
  });

  test('throws for undetectable format', () => {
    expect(() => loader.load('random text', ''))
      .toThrow('Could not detect keymap format');
  });

  // --- Real fixture integration tests ---

  test('loads moNa2.keymap via .keymap extension', () => {
    const text = readFileSync('test/fixtures/moNa2.keymap', 'utf-8');
    const result = loader.load(text, 'moNa2.keymap');
    expect(result.layers).toHaveLength(7);
    expect(result.layout.rows).toHaveLength(4);
  });

  test('loads V6_US_Knob_1.1.json via .json extension (no uid → VIA)', () => {
    const text = readFileSync('test/fixtures/V6_US_Knob_1.1.json', 'utf-8');
    const result = loader.load(text, 'V6_US_Knob_1.1.json');
    expect(result.name).toBe('Keychron V6');
    expect(result.layers).toEqual([]);
    expect(result.layout.rows.length).toBeGreaterThanOrEqual(6);
  });

  test('loads colnix.vil via .vil extension', () => {
    const text = readFileSync('test/fixtures/colnix.vil', 'utf-8');
    const result = loader.load(text, 'colnix.vil');
    expect(result.layers).toHaveLength(10);
    expect(result.layerCharMap).toBeDefined();
  });

  test('loads LiNEA40.json and throws (no layers or KLE keymap)', () => {
    const text = readFileSync('test/fixtures/LiNEA40.json', 'utf-8');
    expect(() => loader.load(text, 'LiNEA40.json'))
      .toThrow('No layers or layouts found');
  });

  test('loads corne.keymap via .keymap extension', () => {
    const text = readFileSync('test/fixtures/corne.keymap', 'utf-8');
    const result = loader.load(text, 'corne.keymap');
    expect(result.layers).toHaveLength(3);
    expect(result.layout.rows).toHaveLength(4);
  });

  test('loads poached_eggs.keymap via .keymap extension', () => {
    const text = readFileSync('test/fixtures/poached_eggs.keymap', 'utf-8');
    const result = loader.load(text, 'poached_eggs.keymap');
    expect(result.layers).toHaveLength(4);
    expect(result.layout.rows).toHaveLength(4);
  });

  test('loads Epomaker_Split70.json via .json extension (no uid → VIA)', () => {
    const text = readFileSync('test/fixtures/Epomaker_Split70.json', 'utf-8');
    const result = loader.load(text, 'Epomaker_Split70.json');
    expect(result.name).toBe('Epomaker_Split70');
    expect(result.layers).toEqual([]);
    expect(result.layout.rows).toHaveLength(5);
  });

  test('loads corne_v4-1_default.vil via .vil extension (uid → Vial)', () => {
    const text = readFileSync('test/fixtures/corne_v4-1_default.vil', 'utf-8');
    const result = loader.load(text, 'corne_v4-1_default.vil');
    expect(result.layers).toHaveLength(10);
    expect(result.layout.rows).toHaveLength(4);
    expect(result.layerCharMap).toBeDefined();
  });

  test('loads vial.json (TH60JP) via .json extension (no uid → VIA definition)', () => {
    const text = readFileSync('test/fixtures/vial.json', 'utf-8');
    const result = loader.load(text, 'vial.json');
    expect(result.name).toBe('TH60JP Prototype');
    expect(result.layers).toEqual([]);
  });

  test('loads ErgoDash.json via .json extension (no uid → VIA definition)', () => {
    const text = readFileSync('test/fixtures/ErgoDash.json', 'utf-8');
    const result = loader.load(text, 'ErgoDash.json');
    expect(result.name).toBe('ErgoDash');
    expect(result.layers).toEqual([]);
    expect(result.layout.rows).toHaveLength(5);
  });

  test('loads lily58-mike.json via .json extension (saved keymap → VIA)', () => {
    const text = readFileSync('test/fixtures/lily58-mike.json', 'utf-8');
    const result = loader.load(text, 'lily58-mike.json');
    expect(result.layers).toHaveLength(3);
    expect(result.name).toBe('VIA Custom');
    expect(result.layout.rows.length).toBeGreaterThan(0);
  });
});
