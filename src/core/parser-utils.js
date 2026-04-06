// Shared utilities for keymap parsers

import { ZMK_KEY_MAP } from '../data/key-labels.js';

export const GAP_KEY = { code: '_GAP', w: 0.5, isGap: true };

export const LAYER_ACTIVATOR_RE = /^(?:MO|TG|TT|TO|OSL)\((\d+)\)$/;

// Build layerCharMap from resolved key arrays
// baseKeys: flat array of resolved key objects from base layer
// layerKeyArrays: [{ layerNum, keys: [...] }, ...]
// Returns: { char: { activator, targetCode, shift? } }
export function buildLayerCharMap(baseKeys, layerKeyArrays) {
  const charMap = {};
  const activators = new Map(); // layerNum -> activator code
  const baseChars = new Set();

  for (const key of baseKeys) {
    if (key.isLayer) {
      const m = key.code.match(LAYER_ACTIVATOR_RE);
      if (m) activators.set(parseInt(m[1]), key.code);
    }
    if (key.layerTap !== undefined && !activators.has(key.layerTap)) {
      activators.set(key.layerTap, key.code);
    }
    const info = ZMK_KEY_MAP[key.code];
    if (info?.char) baseChars.add(info.char);
    if (info?.shiftChar) baseChars.add(info.shiftChar);
  }

  for (const { layerNum, keys } of layerKeyArrays) {
    const act = activators.get(layerNum);
    if (!act) continue;
    for (let i = 0; i < keys.length && i < baseKeys.length; i++) {
      const lk = keys[i];
      const bk = baseKeys[i];
      if (lk.isTrans || lk.isNone || lk.isLayer) continue;
      const info = ZMK_KEY_MAP[lk.code];
      if (!info) continue;
      if (info.char && !baseChars.has(info.char) && !charMap[info.char]) {
        charMap[info.char] = { activator: act, targetCode: bk.code };
      }
      if (info.shiftChar && !baseChars.has(info.shiftChar) && !charMap[info.shiftChar]) {
        charMap[info.shiftChar] = { activator: act, targetCode: bk.code, shift: true };
      }
    }
  }

  return charMap;
}

export function removeComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*/g, '');
}

export function buildSplitLayout(rows, name) {
  if (rows.length === 0) return { name, rows };

  // Determine half-size from even-length rows (handles keyboards with extra inner keys)
  const evenLens = rows.map(r => r.length).filter(l => l % 2 === 0 && l >= 4 && l <= 14);
  if (evenLens.length === 0) return { name, rows };

  const half = Math.min(...evenLens) / 2;

  // Verify: at least half the rows can be split with this half value
  const splittable = rows.filter(r => r.length >= half + 1).length;
  if (splittable < Math.ceil(rows.length / 2)) return { name, rows };

  const layoutRows = rows.map(keys => {
    if (keys.length < 2 * half) {
      // Short row (e.g., thumb cluster): split at half without overlap
      const left = keys.slice(0, Math.min(half, keys.length));
      const right = keys.slice(Math.min(half, keys.length));
      if (right.length > 0) {
        return [...left, { ...GAP_KEY }, ...right];
      }
      return [...left];
    }
    // Normal row: standard split with possible middle keys
    const left = keys.slice(0, half);
    const right = keys.slice(keys.length - half);
    const middle = keys.slice(half, keys.length - half);

    if (middle.length === 0) {
      return [...left, { ...GAP_KEY }, ...right];
    }
    return [...left, { ...GAP_KEY }, ...middle, { ...GAP_KEY }, ...right];
  });

  return { name, rows: layoutRows };
}
