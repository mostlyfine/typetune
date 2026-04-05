import { describe, test, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { ZmkParser } from '../../src/core/zmk-parser.js';

const parser = new ZmkParser();

const minimalKeymap = `
/ {
  keymap {
    compatible = "zmk,keymap";
    default_layer {
      display-name = "Base";
      bindings = <
        &kp Q &kp W &kp E &kp R &kp T   &kp Y &kp U &kp I &kp O &kp P
        &kp A &kp S &kp D &kp F &kp G   &kp H &kp J &kp K &kp L &kp SEMI
        &kp Z &kp X &kp C &kp V &kp B   &kp N &kp M &kp COMMA &kp DOT &kp FSLH
                    &mo 1 &kp SPACE &kp ENTER   &kp BSPC &lt 2 TAB &kp ESC
      >;
    };
    nav_layer {
      display-name = "Nav";
      bindings = <
        &trans &trans &trans &trans &trans   &trans &trans &trans &trans &trans
        &trans &trans &trans &trans &trans   &kp LEFT &kp DOWN &kp UP &kp RIGHT &trans
        &trans &trans &trans &trans &trans   &trans &trans &trans &trans &trans
                    &trans &trans &trans   &trans &trans &trans
      >;
    };
  };
};`;

describe('ZmkParser', () => {
  test('parses minimal keymap', () => {
    const result = parser.parse(minimalKeymap);
    expect(result).toHaveProperty('layers');
    expect(result).toHaveProperty('layout');
    expect(result.layers.length).toBe(2);
  });

  test('extracts layer names from display-name', () => {
    const result = parser.parse(minimalKeymap);
    expect(result.layers[0].name).toBe('Base');
    expect(result.layers[1].name).toBe('Nav');
  });

  test('parses &kp bindings to correct codes', () => {
    const result = parser.parse(minimalKeymap);
    const layout = result.layout;
    // First row first key should be Q
    expect(layout.rows[0][0].code).toBe('Q');
  });

  test('handles &lt (layer-tap) bindings', () => {
    const result = parser.parse(minimalKeymap);
    // &lt 2 TAB should have layerTap
    const lastRow = result.layout.rows[result.layout.rows.length - 1];
    const ltKey = lastRow.find(k => k.layerTap === 2);
    expect(ltKey).toBeDefined();
    expect(ltKey.code).toBe('TAB');
  });

  test('handles &mo bindings as layer keys', () => {
    const result = parser.parse(minimalKeymap);
    const lastRow = result.layout.rows[result.layout.rows.length - 1];
    const moKey = lastRow.find(k => k.isLayer);
    expect(moKey).toBeDefined();
    expect(moKey.code).toBe('MO(1)');
  });

  test('handles &trans and &none', () => {
    const transKeymap = `
/ {
  keymap {
    compatible = "zmk,keymap";
    base {
      bindings = <&kp A &kp B &kp C &kp D>;
    };
    layer1 {
      bindings = <&trans &none &kp X &trans>;
    };
  };
};`;
    const result = parser.parse(transKeymap);
    const layer1 = result.layers[1];
    expect(layer1.bindings).toContain('trans');
  });

  test('resolves ZMK aliases', () => {
    const aliasKeymap = `
/ {
  keymap {
    compatible = "zmk,keymap";
    base {
      bindings = <
        &kp NUMBER_1 &kp BACKSPACE &kp RETURN &kp ESCAPE
        &kp LEFT_SHIFT &kp SEMICOLON &kp APOSTROPHE &kp FORWARD_SLASH
      >;
    };
  };
};`;
    const result = parser.parse(aliasKeymap);
    const keys = result.layout.rows.flat().filter(k => !k.isGap);
    const codes = keys.map(k => k.code);
    expect(codes).toContain('N1');
    expect(codes).toContain('BSPC');
    expect(codes).toContain('ENTER');
    expect(codes).toContain('ESC');
    expect(codes).toContain('LSHIFT');
    expect(codes).toContain('SEMI');
    expect(codes).toContain('SQT');
    expect(codes).toContain('FSLH');
  });

  test('resolves modifier wrappers like LS()', () => {
    const modKeymap = `
/ {
  keymap {
    compatible = "zmk,keymap";
    base {
      bindings = <&kp LS(N1) &kp LC(A) &kp B &kp C>;
    };
  };
};`;
    const result = parser.parse(modKeymap);
    const keys = result.layout.rows.flat().filter(k => !k.isGap);
    // LS(N1) should resolve N1 via the inner alias
    expect(keys[0].code).toBe('N1');
  });

  test('handles &mt (mod-tap) bindings', () => {
    const mtKeymap = `
/ {
  keymap {
    compatible = "zmk,keymap";
    base {
      bindings = <&mt LSHFT A &mt RCTL B &kp C &kp D>;
    };
  };
};`;
    const result = parser.parse(mtKeymap);
    const keys = result.layout.rows.flat().filter(k => !k.isGap);
    expect(keys[0].modTap).toBe('LSHFT');
    expect(keys[0].code).toBe('A');
  });

  test('handles &mkp and &msc bindings', () => {
    const mouseKeymap = `
/ {
  keymap {
    compatible = "zmk,keymap";
    base {
      bindings = <&mkp MB1 &msc SCRL_UP &kp A &kp B>;
    };
  };
};`;
    const result = parser.parse(mouseKeymap);
    const keys = result.layout.rows.flat().filter(k => !k.isGap);
    expect(keys[0].code).toBe('BTN1');
    expect(keys[1].code).toBe('WH_U');
  });

  test('throws when no layers found', () => {
    expect(() => parser.parse('/ { foo { bar = "baz"; }; };'))
      .toThrow('No layers found');
  });

  test('builds split layout with gap insertion', () => {
    const result = parser.parse(minimalKeymap);
    const firstRow = result.layout.rows[0];
    const hasGap = firstRow.some(k => k.isGap);
    expect(hasGap).toBe(true);
  });

  test('handles sensor-bindings with inc_dec_kp', () => {
    const encoderKeymap = `
/ {
  keymap {
    compatible = "zmk,keymap";
    base {
      bindings = <
        &kp A &kp B &kp C &kp D &kp E &kp F
        &kp G &kp H &kp I &kp J &kp K &kp L
        &kp M &kp N &kp O &kp P &kp Q &kp R
                  &kp S &kp T &kp U &kp V
      >;
      sensor-bindings = <&inc_dec_kp C_VOL_UP C_VOL_DN>;
    };
  };
};`;
    const result = parser.parse(encoderKeymap);
    const allKeys = result.layout.rows.flat();
    const encoder = allKeys.find(k => k.isEncoder);
    expect(encoder).toBeDefined();
    expect(encoder.encoderCCW).toBe('VOLU');
    expect(encoder.encoderCW).toBe('VOLD');
  });

  describe('moNa2.keymap fixture', () => {
    let result;
    beforeAll(() => {
      const text = readFileSync('test/fixtures/moNa2.keymap', 'utf-8');
      result = parser.parse(text);
    });

    test('parses 7 layers', () => {
      expect(result.layers).toHaveLength(7);
    });

    test('layer names match block identifiers', () => {
      const names = result.layers.map(l => l.name);
      expect(names).toEqual([
        'default_layer', 'layer_1', 'layer_2', 'layer_3', 'layer_4', 'MOUSE', 'SCROLL',
      ]);
    });

    test('default layer first row starts with QWERT', () => {
      const firstRow = result.layout.rows[0].filter(k => !k.isGap);
      const codes = firstRow.slice(0, 5).map(k => k.code);
      expect(codes).toEqual(['Q', 'W', 'E', 'R', 'T']);
    });

    test('default layer has mod-tap key (mt LEFT_SHIFT Z)', () => {
      const allKeys = result.layout.rows.flat().filter(k => !k.isGap && !k.isEncoder);
      const mtKey = allKeys.find(k => k.modTap === 'LEFT_SHIFT' && k.code === 'Z');
      expect(mtKey).toBeDefined();
    });

    test('default layer has layer-tap keys', () => {
      const allKeys = result.layout.rows.flat().filter(k => !k.isGap && !k.isEncoder);
      const ltKeys = allKeys.filter(k => k.layerTap !== undefined);
      expect(ltKeys.length).toBeGreaterThanOrEqual(3);
      expect(ltKeys.find(k => k.layerTap === 1)).toBeDefined();
      expect(ltKeys.find(k => k.layerTap === 2)).toBeDefined();
      expect(ltKeys.find(k => k.layerTap === 3)).toBeDefined();
    });

    test('layout has 4 rows (split with gaps)', () => {
      expect(result.layout.rows).toHaveLength(4);
      const hasGap = result.layout.rows[0].some(k => k.isGap);
      expect(hasGap).toBe(true);
    });

    test('resolves custom sensor-rotate behavior for encoders', () => {
      const allKeys = result.layout.rows.flat();
      const encoders = allKeys.filter(k => k.isEncoder);
      expect(encoders.length).toBe(2);
      // scroll_up_down behavior: <&msc SCRL_UP>, <&msc SCRL_DOWN>
      expect(encoders[0].encoderCCW).toBe('WH_U');
      expect(encoders[0].encoderCW).toBe('WH_D');
      // inc_dec_kp C_VOL_DN C_VOL_UP
      expect(encoders[1].encoderCCW).toBe('VOLD');
      expect(encoders[1].encoderCW).toBe('VOLU');
    });

    test('MOUSE layer contains mkp bindings', () => {
      const mouseLayer = result.layers.find(l => l.name === 'MOUSE');
      expect(mouseLayer.bindings).toContain('mkp');
    });

    test('right side of default layer has SQT key', () => {
      const row1 = result.layout.rows[1].filter(k => !k.isGap && !k.isEncoder);
      const codes = row1.map(k => k.code);
      expect(codes).toContain('SQT');
    });
  });

  describe('corne.keymap fixture', () => {
    let result;
    beforeAll(() => {
      const text = readFileSync('test/fixtures/corne.keymap', 'utf-8');
      result = parser.parse(text);
    });

    test('parses 3 layers', () => {
      expect(result.layers).toHaveLength(3);
    });

    test('layer names match block identifiers', () => {
      const names = result.layers.map(l => l.name);
      expect(names).toEqual(['default_layer', 'lower_layer', 'raise_layer']);
    });

    test('strips block comments and inline comments', () => {
      // corne.keymap has /* */ header and // line comments in default_layer
      expect(result.layers[0].bindings).not.toContain('//');
      expect(result.layers[0].bindings).not.toContain('/*');
    });

    test('default layer has 3x6 split + 3 thumb keys per side', () => {
      expect(result.layout.rows).toHaveLength(4);
      // First row: 6 left + gap + 6 right
      const firstRowKeys = result.layout.rows[0].filter(k => !k.isGap);
      expect(firstRowKeys).toHaveLength(12);
      // Thumb row: 3 left + gap + 3 right
      const thumbRow = result.layout.rows[3].filter(k => !k.isGap);
      expect(thumbRow).toHaveLength(6);
    });

    test('first row starts with TAB and ends with BSPC', () => {
      const firstRow = result.layout.rows[0].filter(k => !k.isGap);
      expect(firstRow[0].code).toBe('TAB');
      expect(firstRow[firstRow.length - 1].code).toBe('BSPC');
    });

    test('has MO layer keys for lower and raise', () => {
      const allKeys = result.layout.rows.flat().filter(k => !k.isGap);
      const layerKeys = allKeys.filter(k => k.isLayer);
      expect(layerKeys).toHaveLength(2);
      expect(layerKeys.map(k => k.code)).toContain('MO(1)');
      expect(layerKeys.map(k => k.code)).toContain('MO(2)');
    });

    test('raise layer resolves ZMK symbol aliases (EXCL, HASH, etc)', () => {
      const raiseLayer = result.layers[2];
      // EXCL → N1, AT → N2, HASH → N3, etc. via ZMK_ALIASES
      expect(raiseLayer.bindings).toContain('EXCL');
      expect(raiseLayer.bindings).toContain('HASH');
      expect(raiseLayer.bindings).toContain('PRCNT');
    });

    test('no encoders (no sensor-bindings)', () => {
      const allKeys = result.layout.rows.flat();
      const encoders = allKeys.filter(k => k.isEncoder);
      expect(encoders).toHaveLength(0);
    });
  });

  describe('poached_eggs.keymap fixture', () => {
    let result;
    beforeAll(() => {
      const text = readFileSync('test/fixtures/poached_eggs.keymap', 'utf-8');
      result = parser.parse(text);
    });

    test('parses 4 layers', () => {
      expect(result.layers).toHaveLength(4);
    });

    test('layer names match identifiers', () => {
      const names = result.layers.map(l => l.name);
      expect(names).toEqual(['default_layer', 'lower_layer', 'raise_layer', 'bt_layer']);
    });

    test('layout has 4 rows', () => {
      expect(result.layout.rows).toHaveLength(4);
      // First 3 rows have 12 keys each, thumb row has 14 (including &none)
      const firstRowKeys = result.layout.rows[0].filter(k => !k.isGap);
      expect(firstRowKeys).toHaveLength(12);
    });

    test('has mod-tap key (mt RIGHT_SHIFT ESCAPE)', () => {
      const allKeys = result.layout.rows.flat().filter(k => !k.isGap);
      const mtKey = allKeys.find(k => k.modTap === 'RIGHT_SHIFT' && k.code === 'ESC');
      expect(mtKey).toBeDefined();
    });

    test('has &none keys resolved as isNone', () => {
      const layer0 = result.layers[0];
      expect(layer0.bindings).toContain('none');
    });

    test('&tog is parsed as unknown behavior', () => {
      const allKeys = result.layout.rows.flat().filter(k => !k.isGap);
      const togKey = allKeys.find(k => k.code === 'tog');
      expect(togKey).toBeDefined();
      expect(togKey.isUnknown).toBe(true);
    });

    test('has MO(1) and MO(3) layer keys', () => {
      const allKeys = result.layout.rows.flat().filter(k => k.isLayer);
      const codes = allKeys.map(k => k.code);
      expect(codes).toContain('MO(1)');
      expect(codes).toContain('MO(3)');
    });

    test('resolves SINGLE_QUOTE alias to SQT', () => {
      const allKeys = result.layout.rows.flat().filter(k => !k.isGap);
      expect(allKeys.map(k => k.code)).toContain('SQT');
    });

    test('bt_layer contains unknown behaviors (studio_unlock, bt)', () => {
      const btLayer = result.layers[3];
      expect(btLayer.bindings).toContain('bt');
      expect(btLayer.bindings).toContain('studio_unlock');
    });

    test('no encoders', () => {
      const allKeys = result.layout.rows.flat();
      expect(allKeys.filter(k => k.isEncoder)).toHaveLength(0);
    });
  });

  test('strips comments before parsing', () => {
    const commentKeymap = `
// This is a comment
/* Block comment */
/ {
  keymap {
    compatible = "zmk,keymap";
    base {
      bindings = <&kp A &kp B &kp C &kp D>; // inline comment
    };
  };
};`;
    const result = parser.parse(commentKeymap);
    expect(result.layers).toHaveLength(1);
  });
});
