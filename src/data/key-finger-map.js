// Finger identifiers
export const FINGERS = {
  L_PINKY:  'l-pinky',
  L_RING:   'l-ring',
  L_MIDDLE: 'l-middle',
  L_INDEX:  'l-index',
  L_THUMB:  'l-thumb',
  R_THUMB:  'r-thumb',
  R_INDEX:  'r-index',
  R_MIDDLE: 'r-middle',
  R_RING:   'r-ring',
  R_PINKY:  'r-pinky',
};

// ZMK keycode -> finger ID (standard touch typing)
export const KEY_TO_FINGER = {
  // Left pinky
  GRAVE: FINGERS.L_PINKY, N1: FINGERS.L_PINKY,
  TAB: FINGERS.L_PINKY, Q: FINGERS.L_PINKY,
  CAPS: FINGERS.L_PINKY, A: FINGERS.L_PINKY,
  LSHIFT: FINGERS.L_PINKY, Z: FINGERS.L_PINKY,
  LCTRL: FINGERS.L_PINKY,

  // Left ring
  N2: FINGERS.L_RING,
  W: FINGERS.L_RING,
  S: FINGERS.L_RING,
  X: FINGERS.L_RING,

  // Left middle
  N3: FINGERS.L_MIDDLE,
  E: FINGERS.L_MIDDLE,
  D: FINGERS.L_MIDDLE,
  C: FINGERS.L_MIDDLE,

  // Left index
  N4: FINGERS.L_INDEX, N5: FINGERS.L_INDEX,
  R: FINGERS.L_INDEX, T: FINGERS.L_INDEX,
  F: FINGERS.L_INDEX, G: FINGERS.L_INDEX,
  V: FINGERS.L_INDEX, B: FINGERS.L_INDEX,

  // Left thumb
  LALT: FINGERS.L_THUMB, LGUI: FINGERS.L_THUMB,

  // Right thumb
  SPACE: FINGERS.R_THUMB,
  RALT: FINGERS.R_THUMB, RGUI: FINGERS.R_THUMB,

  // Right index
  N6: FINGERS.R_INDEX, N7: FINGERS.R_INDEX,
  Y: FINGERS.R_INDEX, U: FINGERS.R_INDEX,
  H: FINGERS.R_INDEX, J: FINGERS.R_INDEX,
  N: FINGERS.R_INDEX, M: FINGERS.R_INDEX,

  // Right middle
  N8: FINGERS.R_MIDDLE,
  I: FINGERS.R_MIDDLE,
  K: FINGERS.R_MIDDLE,
  COMMA: FINGERS.R_MIDDLE,

  // Right ring
  N9: FINGERS.R_RING,
  O: FINGERS.R_RING,
  L: FINGERS.R_RING,
  DOT: FINGERS.R_RING,

  // Right pinky
  N0: FINGERS.R_PINKY, MINUS: FINGERS.R_PINKY, EQUAL: FINGERS.R_PINKY, BSPC: FINGERS.R_PINKY,
  P: FINGERS.R_PINKY, LBKT: FINGERS.R_PINKY, RBKT: FINGERS.R_PINKY, BSLH: FINGERS.R_PINKY,
  SEMI: FINGERS.R_PINKY, SQT: FINGERS.R_PINKY, ENTER: FINGERS.R_PINKY,
  FSLH: FINGERS.R_PINKY, RSHIFT: FINGERS.R_PINKY, RCTRL: FINGERS.R_PINKY,
};

export function isRightHandKey(code) {
  const finger = KEY_TO_FINGER[code];
  return finger ? finger.startsWith('r-') : false;
}

// Char -> finger (via CHAR_TO_KEY reverse lookup)
import { CHAR_TO_KEY } from './key-labels.js';

export function getFingerForChar(char) {
  const mapping = CHAR_TO_KEY[char];
  if (!mapping) return null;

  const fingers = [KEY_TO_FINGER[mapping.code]];

  // If shift is needed, add the opposite-hand shift finger
  if (mapping.shift) {
    const mainFinger = KEY_TO_FINGER[mapping.code];
    if (mainFinger && mainFinger.startsWith('r-')) {
      fingers.push(FINGERS.L_PINKY); // LSHIFT
    } else {
      fingers.push(FINGERS.R_PINKY); // RSHIFT
    }
  }

  return fingers.filter(Boolean);
}

// Fingers for layer combo: activator + target + optional shift
export function getFingersForLayerMapping(mapping) {
  const fingers = new Set();

  if (mapping.activatorFinger) {
    fingers.add(mapping.activatorFinger);
  }

  const targetFinger = KEY_TO_FINGER[mapping.targetCode];
  if (targetFinger) {
    fingers.add(targetFinger);

    if (mapping.shift) {
      fingers.add(targetFinger.startsWith('r-') ? FINGERS.L_PINKY : FINGERS.R_PINKY);
    }
  }

  return [...fingers];
}
