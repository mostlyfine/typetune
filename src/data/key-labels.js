// ZMK keycode -> { label, shiftLabel, char, shiftChar }
export const ZMK_KEY_MAP = {
  // Letters
  A: { label: 'a', shiftLabel: 'A', char: 'a', shiftChar: 'A' },
  B: { label: 'b', shiftLabel: 'B', char: 'b', shiftChar: 'B' },
  C: { label: 'c', shiftLabel: 'C', char: 'c', shiftChar: 'C' },
  D: { label: 'd', shiftLabel: 'D', char: 'd', shiftChar: 'D' },
  E: { label: 'e', shiftLabel: 'E', char: 'e', shiftChar: 'E' },
  F: { label: 'f', shiftLabel: 'F', char: 'f', shiftChar: 'F' },
  G: { label: 'g', shiftLabel: 'G', char: 'g', shiftChar: 'G' },
  H: { label: 'h', shiftLabel: 'H', char: 'h', shiftChar: 'H' },
  I: { label: 'i', shiftLabel: 'I', char: 'i', shiftChar: 'I' },
  J: { label: 'j', shiftLabel: 'J', char: 'j', shiftChar: 'J' },
  K: { label: 'k', shiftLabel: 'K', char: 'k', shiftChar: 'K' },
  L: { label: 'l', shiftLabel: 'L', char: 'l', shiftChar: 'L' },
  M: { label: 'm', shiftLabel: 'M', char: 'm', shiftChar: 'M' },
  N: { label: 'n', shiftLabel: 'N', char: 'n', shiftChar: 'N' },
  O: { label: 'o', shiftLabel: 'O', char: 'o', shiftChar: 'O' },
  P: { label: 'p', shiftLabel: 'P', char: 'p', shiftChar: 'P' },
  Q: { label: 'q', shiftLabel: 'Q', char: 'q', shiftChar: 'Q' },
  R: { label: 'r', shiftLabel: 'R', char: 'r', shiftChar: 'R' },
  S: { label: 's', shiftLabel: 'S', char: 's', shiftChar: 'S' },
  T: { label: 't', shiftLabel: 'T', char: 't', shiftChar: 'T' },
  U: { label: 'u', shiftLabel: 'U', char: 'u', shiftChar: 'U' },
  V: { label: 'v', shiftLabel: 'V', char: 'v', shiftChar: 'V' },
  W: { label: 'w', shiftLabel: 'W', char: 'w', shiftChar: 'W' },
  X: { label: 'x', shiftLabel: 'X', char: 'x', shiftChar: 'X' },
  Y: { label: 'y', shiftLabel: 'Y', char: 'y', shiftChar: 'Y' },
  Z: { label: 'z', shiftLabel: 'Z', char: 'z', shiftChar: 'Z' },

  // Numbers
  N1: { label: '1', shiftLabel: '!', char: '1', shiftChar: '!' },
  N2: { label: '2', shiftLabel: '@', char: '2', shiftChar: '@' },
  N3: { label: '3', shiftLabel: '#', char: '3', shiftChar: '#' },
  N4: { label: '4', shiftLabel: '$', char: '4', shiftChar: '$' },
  N5: { label: '5', shiftLabel: '%', char: '5', shiftChar: '%' },
  N6: { label: '6', shiftLabel: '^', char: '6', shiftChar: '^' },
  N7: { label: '7', shiftLabel: '&', char: '7', shiftChar: '&' },
  N8: { label: '8', shiftLabel: '*', char: '8', shiftChar: '*' },
  N9: { label: '9', shiftLabel: '(', char: '9', shiftChar: '(' },
  N0: { label: '0', shiftLabel: ')', char: '0', shiftChar: ')' },

  // Symbols
  MINUS:  { label: '-', shiftLabel: '_', char: '-', shiftChar: '_' },
  EQUAL:  { label: '=', shiftLabel: '+', char: '=', shiftChar: '+' },
  LBKT:   { label: '[', shiftLabel: '{', char: '[', shiftChar: '{' },
  RBKT:   { label: ']', shiftLabel: '}', char: ']', shiftChar: '}' },
  BSLH:   { label: '\\', shiftLabel: '|', char: '\\', shiftChar: '|' },
  SEMI:   { label: ';', shiftLabel: ':', char: ';', shiftChar: ':' },
  SQT:    { label: "'", shiftLabel: '"', char: "'", shiftChar: '"' },
  GRAVE:  { label: '`', shiftLabel: '~', char: '`', shiftChar: '~' },
  COMMA:  { label: ',', shiftLabel: '<', char: ',', shiftChar: '<' },
  DOT:    { label: '.', shiftLabel: '>', char: '.', shiftChar: '>' },
  FSLH:   { label: '/', shiftLabel: '?', char: '/', shiftChar: '?' },

  // Special
  SPACE:  { label: 'Space', char: ' ' },
  ENTER:  { label: 'Enter', char: '\n' },
  TAB:    { label: 'Tab', char: '\t' },
  BSPC:   { label: 'Bksp' },
  ESC:    { label: 'Esc' },
  DEL:    { label: 'Del' },
  INS:    { label: 'Ins' },
  PSCRN:  { label: 'PrtSc' },
  SLCK:   { label: 'ScrLk' },
  PAUSE:  { label: 'Pause' },
  HOME:   { label: 'Home' },
  END:    { label: 'End' },
  PG_UP:  { label: 'PgUp' },
  PG_DN:  { label: 'PgDn' },
  LEFT:   { label: '\u2190' },
  RIGHT:  { label: '\u2192' },
  UP:     { label: '\u2191' },
  DOWN:   { label: '\u2193' },
  LSHIFT: { label: 'Shift' },
  RSHIFT: { label: 'Shift' },
  LCTRL:  { label: 'Ctrl' },
  RCTRL:  { label: 'Ctrl' },
  LALT:   { label: 'Alt' },
  RALT:   { label: 'Alt' },
  LGUI:   { label: 'Cmd' },
  RGUI:   { label: 'Cmd' },
  CAPS:   { label: 'Caps' },
  // Function keys
  F1: { label: 'F1' }, F2: { label: 'F2' }, F3: { label: 'F3' },
  F4: { label: 'F4' }, F5: { label: 'F5' }, F6: { label: 'F6' },
  F7: { label: 'F7' }, F8: { label: 'F8' }, F9: { label: 'F9' },
  F10: { label: 'F10' }, F11: { label: 'F11' }, F12: { label: 'F12' },
  // Keypad
  KP_N0: { label: 'KP 0', char: '0' }, KP_N1: { label: 'KP 1', char: '1' },
  KP_N2: { label: 'KP 2', char: '2' }, KP_N3: { label: 'KP 3', char: '3' },
  KP_N4: { label: 'KP 4', char: '4' }, KP_N5: { label: 'KP 5', char: '5' },
  KP_N6: { label: 'KP 6', char: '6' }, KP_N7: { label: 'KP 7', char: '7' },
  KP_N8: { label: 'KP 8', char: '8' }, KP_N9: { label: 'KP 9', char: '9' },
  KP_SLASH: { label: 'KP /', char: '/' }, KP_STAR: { label: 'KP *', char: '*' },
  KP_MINUS: { label: 'KP -', char: '-' }, KP_PLUS: { label: 'KP +', char: '+' },
  KP_DOT: { label: 'KP .', char: '.' }, KP_ENTER: { label: 'KP Ent', char: '\n' },
  // Lock keys
  NUM_LOCK: { label: 'NumLk' },
  // Media
  MUTE: { label: 'Mute' }, VOLD: { label: 'Vol-' }, VOLU: { label: 'Vol+' },
};

// Reverse lookup: char -> { code, shift }
export const CHAR_TO_KEY = {};
for (const [code, info] of Object.entries(ZMK_KEY_MAP)) {
  if (info.char) {
    CHAR_TO_KEY[info.char] = { code, shift: false };
  }
  if (info.shiftChar) {
    CHAR_TO_KEY[info.shiftChar] = { code, shift: true };
  }
}
