// QMK keycode (KC_ prefix stripped) -> internal canonical code (matching ZMK_KEY_MAP keys)
export const QMK_TO_INTERNAL = {
  // Letters
  A: 'A', B: 'B', C: 'C', D: 'D', E: 'E', F: 'F', G: 'G', H: 'H',
  I: 'I', J: 'J', K: 'K', L: 'L', M: 'M', N: 'N', O: 'O', P: 'P',
  Q: 'Q', R: 'R', S: 'S', T: 'T', U: 'U', V: 'V', W: 'W', X: 'X',
  Y: 'Y', Z: 'Z',

  // Numbers
  1: 'N1', 2: 'N2', 3: 'N3', 4: 'N4', 5: 'N5',
  6: 'N6', 7: 'N7', 8: 'N8', 9: 'N9', 0: 'N0',

  // Symbols
  MINS: 'MINUS', MINUS: 'MINUS',
  EQL: 'EQUAL', EQUAL: 'EQUAL',
  LBRC: 'LBKT', LBRACKET: 'LBKT',
  RBRC: 'RBKT', RBRACKET: 'RBKT',
  BSLS: 'BSLH', BSLASH: 'BSLH', BACKSLASH: 'BSLH', NUBS: 'BSLH',
  SCLN: 'SEMI', SCOLON: 'SEMI', SEMICOLON: 'SEMI',
  QUOT: 'SQT', QUOTE: 'SQT',
  GRV: 'GRAVE', GRAVE: 'GRAVE',
  COMM: 'COMMA', COMMA: 'COMMA',
  DOT: 'DOT',
  SLSH: 'FSLH', SLASH: 'FSLH',

  // Special keys
  SPC: 'SPACE', SPACE: 'SPACE',
  ENT: 'ENTER', ENTER: 'ENTER',
  TAB: 'TAB',
  BSPC: 'BSPC', BSPACE: 'BSPC',
  ESC: 'ESC', ESCAPE: 'ESC',
  DEL: 'DEL', DELETE: 'DEL',
  INS: 'INS', INSERT: 'INS',
  PSCR: 'PSCRN', PSCREEN: 'PSCRN',
  SLCK: 'SLCK', SCROLLLOCK: 'SLCK',
  PAUS: 'PAUSE', PAUSE: 'PAUSE', BRK: 'PAUSE',
  HOME: 'HOME',
  END: 'END',
  PGUP: 'PG_UP', PAGEUP: 'PG_UP',
  PGDN: 'PG_DN', PGDOWN: 'PG_DN', PAGEDOWN: 'PG_DN',
  LEFT: 'LEFT', RGHT: 'RIGHT', RIGHT: 'RIGHT', UP: 'UP', DOWN: 'DOWN',

  // Modifiers
  LSFT: 'LSHIFT', LSHIFT: 'LSHIFT',
  RSFT: 'RSHIFT', RSHIFT: 'RSHIFT',
  LCTL: 'LCTRL', LCTRL: 'LCTRL',
  RCTL: 'RCTRL', RCTRL: 'RCTRL',
  LALT: 'LALT',
  RALT: 'RALT',
  LGUI: 'LGUI', LCMD: 'LGUI', LWIN: 'LGUI',
  RGUI: 'RGUI', RCMD: 'RGUI', RWIN: 'RGUI',
  CAPS: 'CAPS', CAPSLOCK: 'CAPS', CLCK: 'CAPS',

  // Function keys
  F1: 'F1', F2: 'F2', F3: 'F3', F4: 'F4', F5: 'F5', F6: 'F6',
  F7: 'F7', F8: 'F8', F9: 'F9', F10: 'F10', F11: 'F11', F12: 'F12',

  // Numpad
  P0: 'KP_N0', P1: 'KP_N1', P2: 'KP_N2', P3: 'KP_N3', P4: 'KP_N4',
  P5: 'KP_N5', P6: 'KP_N6', P7: 'KP_N7', P8: 'KP_N8', P9: 'KP_N9',
  PSLS: 'KP_SLASH', PAST: 'KP_STAR', PMNS: 'KP_MINUS', PPLS: 'KP_PLUS',
  PDOT: 'KP_DOT', PENT: 'KP_ENTER',
  NLCK: 'NUM_LOCK', NUMLOCK: 'NUM_LOCK',

  // Media
  MUTE: 'MUTE', VOLD: 'VOLD', VOLU: 'VOLU',

  // Transparent / No-op
  TRNS: '_TRANS', TRANSPARENT: '_TRANS',
  NO: '_NONE',
};

// QMK MOD_* -> internal modifier code
const MOD_MAP = {
  MOD_LSFT: 'LSHIFT', MOD_RSFT: 'RSHIFT',
  MOD_LCTL: 'LCTRL', MOD_RCTL: 'RCTRL',
  MOD_LALT: 'LALT', MOD_RALT: 'RALT',
  MOD_LGUI: 'LGUI', MOD_RGUI: 'RGUI',
};

// HID usage ID -> internal code (for Vial numeric keycodes)
const HID_TO_INTERNAL = {
  0x04: 'A', 0x05: 'B', 0x06: 'C', 0x07: 'D', 0x08: 'E', 0x09: 'F',
  0x0A: 'G', 0x0B: 'H', 0x0C: 'I', 0x0D: 'J', 0x0E: 'K', 0x0F: 'L',
  0x10: 'M', 0x11: 'N', 0x12: 'O', 0x13: 'P', 0x14: 'Q', 0x15: 'R',
  0x16: 'S', 0x17: 'T', 0x18: 'U', 0x19: 'V', 0x1A: 'W', 0x1B: 'X',
  0x1C: 'Y', 0x1D: 'Z',
  0x1E: 'N1', 0x1F: 'N2', 0x20: 'N3', 0x21: 'N4', 0x22: 'N5',
  0x23: 'N6', 0x24: 'N7', 0x25: 'N8', 0x26: 'N9', 0x27: 'N0',
  0x28: 'ENTER', 0x29: 'ESC', 0x2A: 'BSPC', 0x2B: 'TAB', 0x2C: 'SPACE',
  0x2D: 'MINUS', 0x2E: 'EQUAL', 0x2F: 'LBKT', 0x30: 'RBKT', 0x31: 'BSLH',
  0x33: 'SEMI', 0x34: 'SQT', 0x35: 'GRAVE', 0x36: 'COMMA', 0x37: 'DOT',
  0x38: 'FSLH',
  0x39: 'CAPS',
  0x3A: 'F1', 0x3B: 'F2', 0x3C: 'F3', 0x3D: 'F4', 0x3E: 'F5', 0x3F: 'F6',
  0x40: 'F7', 0x41: 'F8', 0x42: 'F9', 0x43: 'F10', 0x44: 'F11', 0x45: 'F12',
  0x46: 'PSCRN', 0x47: 'SLCK', 0x48: 'PAUSE',
  0x49: 'INS', 0x4A: 'HOME', 0x4B: 'PG_UP', 0x4C: 'DEL', 0x4D: 'END', 0x4E: 'PG_DN',
  0x4F: 'RIGHT', 0x50: 'LEFT', 0x51: 'DOWN', 0x52: 'UP',
  // Left modifiers
  0xE0: 'LCTRL', 0xE1: 'LSHIFT', 0xE2: 'LALT', 0xE3: 'LGUI',
  // Right modifiers
  0xE4: 'RCTRL', 0xE5: 'RSHIFT', 0xE6: 'RALT', 0xE7: 'RGUI',
};

function resolveSimple(name) {
  return QMK_TO_INTERNAL[name] || name;
}

// Resolve modifier expression like "MOD_LSFT | MOD_RSFT" to first known mod
function resolveModExpr(expr) {
  const parts = expr.split(/\s*\|\s*/);
  for (const part of parts) {
    const mod = MOD_MAP[part.trim()];
    if (mod) return mod;
  }
  return parts[0].trim();
}

// Resolve a QMK keycode string to an internal key object
export function resolveQmkKeycode(raw) {
  if (!raw) return { code: '_NONE', w: 1, isNone: true };
  raw = raw.trim();

  // Transparent aliases
  if (raw === '_______' || raw === 'KC_TRNS' || raw === 'KC_TRANSPARENT') {
    return { code: '_TRANS', w: 1, isTrans: true };
  }
  // No-op aliases
  if (raw === 'XXXXXXX' || raw === 'KC_NO') {
    return { code: '_NONE', w: 1, isNone: true };
  }

  // MO(layer)
  const moMatch = raw.match(/^MO\((\d+)\)$/);
  if (moMatch) {
    return { code: `MO(${moMatch[1]})`, w: 1, isLayer: true };
  }

  // TG(layer), TO(layer), OSL(layer), TT(layer)
  const layerMatch = raw.match(/^(TG|TO|OSL|TT|DF)\((\d+)\)$/);
  if (layerMatch) {
    return { code: `${layerMatch[1]}(${layerMatch[2]})`, w: 1, isLayer: true };
  }

  // LT(layer, keycode)
  const ltMatch = raw.match(/^LT\((\d+)\s*,\s*(.+)\)$/);
  if (ltMatch) {
    const inner = resolveQmkKeycode(ltMatch[2]);
    return { code: inner.code, w: 1, layerTap: parseInt(ltMatch[1]) };
  }

  // MT(mod, keycode) — mod can be combined like MOD_LSFT | MOD_RSFT
  const mtMatch = raw.match(/^MT\((.+?)\s*,\s*(KC_\w+|[A-Z]\w*)\)$/);
  if (mtMatch) {
    const modStr = mtMatch[1].trim();
    const mod = resolveModExpr(modStr);
    const inner = resolveQmkKeycode(mtMatch[2]);
    return { code: inner.code, w: 1, modTap: mod };
  }

  // Shorthand mod-taps: LSFT_T(kc), LCTL_T(kc), etc.
  const modTapShort = raw.match(/^(LSFT|RSFT|LCTL|RCTL|LALT|RALT|LGUI|RGUI)_T\((.+)\)$/);
  if (modTapShort) {
    const mod = QMK_TO_INTERNAL[modTapShort[1]] || modTapShort[1];
    const inner = resolveQmkKeycode(modTapShort[2]);
    return { code: inner.code, w: 1, modTap: mod };
  }

  // LM(layer, mod)
  const lmMatch = raw.match(/^LM\((\d+)\s*,\s*(\w+)\)$/);
  if (lmMatch) {
    return { code: `LM(${lmMatch[1]})`, w: 1, isLayer: true };
  }

  // OSM(mod)
  const osmMatch = raw.match(/^OSM\((\w+)\)$/);
  if (osmMatch) {
    const mod = MOD_MAP[osmMatch[1]] || osmMatch[1];
    return { code: mod, w: 1 };
  }

  // VIA layer function keys: FN_MO13, FN_MO23, etc.
  if (raw.match(/^FN_MO\d+$/)) {
    return { code: raw, w: 1, isLayer: true };
  }

  // Unknown function-style keycodes: CUSTOM(...), RGB_*, RESET, etc.
  if (raw.match(/^(CUSTOM|RGB_|BL_|QK_|RESET)/) || raw.match(/^CUSTOM\(\d+\)$/)) {
    return { code: raw, w: 1, isUnknown: true };
  }

  // Strip KC_ prefix
  let name = raw;
  if (name.startsWith('KC_')) {
    name = name.substring(3);
  }

  const code = resolveSimple(name);

  if (code === '_TRANS') return { code, w: 1, isTrans: true };
  if (code === '_NONE') return { code, w: 1, isNone: true };

  return { code, w: 1 };
}

// Decode Vial numeric keycode to internal key object
export function decodeVialKeycode(num) {
  if (typeof num === 'string') return resolveQmkKeycode(num);

  num = num & 0xFFFF;

  // KC_NO
  if (num === 0x0000) return { code: '_NONE', w: 1, isNone: true };
  // KC_TRNS
  if (num === 0x0001) return { code: '_TRANS', w: 1, isTrans: true };

  // Basic HID keycodes (0x0004-0x00FF)
  if (num >= 0x0004 && num <= 0x00FF) {
    const code = HID_TO_INTERNAL[num];
    if (code) return { code, w: 1 };
    return { code: `HID(${num})`, w: 1, isUnknown: true };
  }

  // MO(layer) — 0x5100-0x51FF
  if ((num & 0xFF00) === 0x5100) {
    const layer = num & 0xFF;
    return { code: `MO(${layer})`, w: 1, isLayer: true };
  }

  // TG(layer) — 0x5300-0x53FF
  if ((num & 0xFF00) === 0x5300) {
    const layer = num & 0xFF;
    return { code: `TG(${layer})`, w: 1, isLayer: true };
  }

  // TO(layer) — 0x5200-0x52FF
  if ((num & 0xFF00) === 0x5200) {
    const layer = num & 0xFF;
    return { code: `TO(${layer})`, w: 1, isLayer: true };
  }

  // LT(layer, kc) — 0x4000-0x4FFF
  if (num >= 0x4000 && num <= 0x4FFF) {
    const layer = (num >> 8) & 0x0F;
    const kc = num & 0xFF;
    const code = HID_TO_INTERNAL[kc];
    if (code) return { code, w: 1, layerTap: layer };
    return { code: `LT(${layer})`, w: 1, isLayer: true };
  }

  // MT(mod, kc) — 0x2000-0x3FFF
  if (num >= 0x2000 && num <= 0x3FFF) {
    const modBits = (num >> 8) & 0x1F;
    const kc = num & 0xFF;
    const code = HID_TO_INTERNAL[kc];
    // Decode mod bits (bit0=Ctrl, bit1=Shift, bit2=Alt, bit3=GUI, bit4=right)
    const isRight = modBits & 0x10;
    let mod = 'LCTRL';
    if (modBits & 0x02) mod = isRight ? 'RSHIFT' : 'LSHIFT';
    else if (modBits & 0x01) mod = isRight ? 'RCTRL' : 'LCTRL';
    else if (modBits & 0x04) mod = isRight ? 'RALT' : 'LALT';
    else if (modBits & 0x08) mod = isRight ? 'RGUI' : 'LGUI';
    if (code) return { code, w: 1, modTap: mod };
    return { code: `MT(${num.toString(16)})`, w: 1, isUnknown: true };
  }

  return { code: `0x${num.toString(16).toUpperCase()}`, w: 1, isUnknown: true };
}

// Split flat key array into rows
// If cols is provided (from matrix info), use it directly
export function splitIntoRows(keys, cols) {
  const n = keys.length;

  // If matrix cols info is available, split by cols
  if (cols && cols > 0) {
    const rows = [];
    for (let i = 0; i < n; i += cols) {
      rows.push(keys.slice(i, i + cols));
    }
    return rows;
  }

  // Known split keyboard patterns: total -> row sizes
  const patterns = {
    36: [10, 10, 10, 6],       // 3x5+3 (Corne, Sweep)
    42: [12, 12, 12, 6],       // 3x6+3 (Corne 6-col)
    44: [12, 12, 12, 8],       // 3x6+4
    46: [12, 12, 12, 10],      // 3x6+5
    48: [12, 12, 12, 12],      // 4x6
    50: [12, 12, 12, 12, 2],   // 4x6+1
    56: [14, 14, 14, 14],      // 4x7 (Lily58)
    58: [14, 14, 14, 14, 2],   // 4x7+1 (Sofle)
    60: [14, 14, 13, 12, 7],   // Standard 60%
    61: [14, 14, 13, 12, 8],   // 60% ANSI
  };

  if (patterns[n]) {
    const sizes = patterns[n];
    const rows = [];
    let offset = 0;
    for (const size of sizes) {
      rows.push(keys.slice(offset, offset + size));
      offset += size;
    }
    return rows;
  }

  // Fallback: guess row size based on total count
  const rowSize = n <= 40 ? 10 : n <= 50 ? 12 : 14;
  const rows = [];
  for (let i = 0; i < n; i += rowSize) {
    rows.push(keys.slice(i, i + rowSize));
  }
  return rows;
}
