import { decodeVialKeycode, resolveKeycode, splitIntoRows } from '../data/keycodes.js';
import { GAP_KEY, buildSplitLayout, buildLayerCharMap, LAYER_ACTIVATOR_RE } from './parser-utils.js';
import { ViaParser } from './via-parser.js';
import { ZMK_KEY_MAP } from '../data/key-labels.js';

// Detect encoder columns (columns that are mostly -1 with at most one real key)
function detectEncoderCols(rows) {
  if (rows.length === 0) return new Set();
  const cols = rows[0].length;
  const encoderCols = new Set();
  for (let c = 0; c < cols; c++) {
    const blanks = rows.filter(r => r[c] === -1).length;
    if (blanks > 0 && blanks >= rows.length - 1) {
      encoderCols.add(c);
    }
  }
  return encoderCols;
}

function stripCols(rows, colsToStrip) {
  if (colsToStrip.size === 0) return rows;
  return rows.map(r => r.filter((_, c) => !colsToStrip.has(c)));
}

// Extract encoder key from encoder columns with rotation data from encoder_layout
// Returns a single encoder key object or null
function extractEncoderKey(rows, encCols, encoderLayout, encoderIndex) {
  if (encCols.size === 0 || !encoderLayout || !encoderLayout.length) return null;

  const baseEncoders = encoderLayout[0] || [];
  const rotation = baseEncoders[encoderIndex] || [];
  const ccw = rotation[0] ? resolveKeycode(rotation[0]) : null;
  const cw = rotation[1] ? resolveKeycode(rotation[1]) : null;

  // Find press key from any row in the encoder column
  let pressCode = '';
  for (const col of encCols) {
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][col] !== -1) {
        pressCode = resolveKeycode(rows[i][col])?.code || '';
        break;
      }
    }
    if (pressCode) break;
  }

  return {
    code: `_ENC${encoderIndex}`,
    w: 1,
    isEncoder: true,
    encoderPress: pressCode,
    encoderCCW: ccw?.code || '',
    encoderCW: cw?.code || '',
  };
}

// Estimate finger from physical position in a split keyboard half
function fingerForPosition(side, row, col, totalRows, totalCols) {
  const prefix = side === 'left' ? 'l-' : 'r-';
  const isThumbRow = row === totalRows - 1;

  if (isThumbRow) {
    if (col >= totalCols - 2) return `${prefix}thumb`;
    if (col >= totalCols - 3) return `${prefix}index`;
    if (col === 0) return `${prefix}pinky`;
    if (col === 1) return `${prefix}ring`;
    return `${prefix}middle`;
  }

  if (totalCols >= 6) {
    if (col <= 1) return `${prefix}pinky`;
    if (col === 2) return `${prefix}ring`;
    if (col === 3) return `${prefix}middle`;
    return `${prefix}index`;
  }

  if (col === 0) return `${prefix}pinky`;
  if (col === 1) return `${prefix}ring`;
  if (col === 2) return `${prefix}middle`;
  return `${prefix}index`;
}

export class VialParser {
  #via = new ViaParser();

  parse(jsonText) {
    const data = typeof jsonText === 'string' ? JSON.parse(jsonText) : jsonText;

    // Vial save format: layout[layer][row][keycode] (3D array of strings/-1)
    if (this.#isVialSaveFormat(data)) {
      return this.#parseVialSave(data);
    }

    if (!data.layers || !Array.isArray(data.layers) || data.layers.length === 0) {
      // Fallback: vial.json keyboard definition file with uid but no saved layers
      if (data.layouts?.keymap) {
        const result = this.#via.parse(data);
        return { ...result, name: 'Vial Custom' };
      }
      throw new Error('No layers or layouts found in Vial JSON');
    }

    const layers = data.layers.map((layer, i) => ({
      id: String(i),
      name: `Layer ${i}`,
      keycodes: layer,
    }));

    const baseLayer = layers[0].keycodes;
    const keys = baseLayer.map(kc =>
      typeof kc === 'number' ? decodeVialKeycode(kc) : resolveKeycode(kc)
    );

    const rows = this.#detectRows(keys, data);
    const layout = this.#buildLayout(rows);

    const layerKeyArrays = layers.slice(1).map((layer, i) => ({
      layerNum: i + 1,
      keys: layer.keycodes.map(kc =>
        typeof kc === 'number' ? decodeVialKeycode(kc) : resolveKeycode(kc)
      ),
    }));
    const layerCharMap = buildLayerCharMap(keys, layerKeyArrays);

    return {
      name: 'Vial Custom',
      layers,
      layout,
      layerCharMap,
    };
  }

  #isVialSaveFormat(data) {
    if (!data.layout || !Array.isArray(data.layout) || data.layout.length === 0) return false;
    const first = data.layout[0];
    return Array.isArray(first) && Array.isArray(first[0]);
  }

  #parseVialSave(data) {
    const layerData = data.layout;
    const encoderLayout = data.encoder_layout || [];
    const layers = layerData.map((layer, i) => ({
      id: String(i),
      name: `Layer ${i}`,
      keycodes: layer.flat(),
    }));

    const baseLayer = layerData[0];
    const half = baseLayer.length / 2;
    const leftRows = baseLayer.slice(0, half);
    const rightRows = baseLayer.slice(half);

    const leftEncCols = detectEncoderCols(leftRows);
    const rightEncCols = detectEncoderCols(rightRows);

    const cleanLeft = stripCols(leftRows, leftEncCols);
    const cleanRight = stripCols(rightRows, rightEncCols);

    // Extract encoder keys with rotation data
    const leftEncoder = extractEncoderKey(leftRows, leftEncCols, encoderLayout, 0);
    const rightEncoder = extractEncoderKey(rightRows, rightEncCols, encoderLayout, 1);
    // Physical encoder row: just above thumb cluster (second-to-last row)
    const encoderRow = half - 2;

    const BLANK_KEY = { code: '_GAP', w: 1, isGap: true };
    const resolveKey = kc => kc === -1 ? BLANK_KEY : resolveKeycode(kc);

    const layoutRows = [];
    for (let i = 0; i < half; i++) {
      const left = cleanLeft[i].map(resolveKey);
      const right = [...cleanRight[i]].reverse().map(resolveKey);

      if (i === encoderRow) {
        if (leftEncoder) left.push(leftEncoder);
        if (rightEncoder) right.unshift(rightEncoder);
      }

      if (left.some(k => !k.isGap && !k.isEncoder) || right.some(k => !k.isGap && !k.isEncoder)) {
        layoutRows.push([...left, GAP_KEY, ...right]);
      }
    }

    const layerCharMap = this.#buildLayerCharMap(layerData, half, leftEncCols, rightEncCols);

    return {
      name: 'Vial Custom',
      layers,
      layout: { name: 'Vial Custom', rows: layoutRows },
      layerCharMap,
    };
  }

  #buildLayerCharMap(layerData, half, leftEncCols, rightEncCols) {
    const charMap = {};
    const resolve = kc => kc === -1 ? null : resolveKeycode(kc);

    // Scan base layer for activators and existing chars
    const base = layerData[0];
    const baseLeft = stripCols(base.slice(0, half), leftEncCols);
    const baseRight = stripCols(base.slice(half), rightEncCols);
    const totalCols = baseLeft[0]?.length || 0;

    const activators = new Map(); // layerNum -> { code, finger }
    const baseChars = new Set();

    const scanSide = (rows, side) => {
      for (let i = 0; i < rows.length; i++) {
        for (let c = 0; c < rows[i].length; c++) {
          const key = resolve(rows[i][c]);
          if (!key) continue;
          if (key.isLayer) {
            const m = key.code.match(LAYER_ACTIVATOR_RE);
            if (m) {
              const finger = fingerForPosition(side, i, c, half, totalCols);
              activators.set(parseInt(m[1]), { code: key.code, finger });
            }
          }
          if (key.layerTap !== undefined && !activators.has(key.layerTap)) {
            const finger = fingerForPosition(side, i, c, half, totalCols);
            activators.set(key.layerTap, { code: key.code, finger });
          }
          const info = ZMK_KEY_MAP[key.code];
          if (info?.char) baseChars.add(info.char);
          if (info?.shiftChar) baseChars.add(info.shiftChar);
        }
      }
    };
    scanSide(baseLeft, 'left');
    scanSide(baseRight, 'right');

    // Map chars from non-base layers to base layer positions
    for (let li = 1; li < layerData.length; li++) {
      const act = activators.get(li);
      if (!act) continue;

      const layer = layerData[li];
      const layerLeft = stripCols(layer.slice(0, half), leftEncCols);
      const layerRight = stripCols(layer.slice(half), rightEncCols);

      const scanPairs = [[layerLeft, baseLeft], [layerRight, baseRight]];
      for (const [layerRows, baseRows] of scanPairs) {
        for (let i = 0; i < half; i++) {
          for (let c = 0; c < layerRows[i].length; c++) {
            const lk = resolve(layerRows[i][c]);
            const bk = resolve(baseRows[i][c]);
            if (lk && bk && !lk.isTrans && !lk.isNone && !lk.isLayer) {
              this.#addCharEntry(charMap, lk.code, bk.code, act, baseChars);
            }
          }
        }
      }
    }

    return charMap;
  }

  #addCharEntry(charMap, layerCode, baseCode, act, baseChars) {
    const info = ZMK_KEY_MAP[layerCode];
    if (!info) return;
    if (info.char && !baseChars.has(info.char) && !charMap[info.char]) {
      charMap[info.char] = { activator: act.code, targetCode: baseCode, activatorFinger: act.finger };
    }
    if (info.shiftChar && !baseChars.has(info.shiftChar) && !charMap[info.shiftChar]) {
      charMap[info.shiftChar] = { activator: act.code, targetCode: baseCode, shift: true, activatorFinger: act.finger };
    }
  }

  #detectRows(keys, data) {
    // Use physical layout data if available
    if (data.layout && Array.isArray(data.layout) && data.layout.length === keys.length) {
      const rows = this.#rowsFromPhysicalLayout(keys, data.layout);
      if (rows) return rows;
    }

    // Use matrix cols if available
    const cols = data.matrix?.cols || data.cols || null;
    if (cols) {
      return this.#buildRowsWithFiltering(keys, cols);
    }

    // Fallback to heuristic
    const rows = splitIntoRows(keys);
    // Filter out KC_NO keys
    return rows
      .map(row => row.filter(k => !k.isNone))
      .filter(row => row.length > 0);
  }

  #buildRowsWithFiltering(keys, cols) {
    const rows = [];
    for (let i = 0; i < keys.length; i += cols) {
      const row = keys.slice(i, i + cols);
      // Remove trailing and inline KC_NO
      const filtered = row.filter(k => !k.isNone);
      if (filtered.length > 0) rows.push(filtered);
    }
    return rows;
  }

  #rowsFromPhysicalLayout(keys, layoutInfo) {
    const first = layoutInfo[0];
    if (!first || typeof first !== 'object' || first.y === undefined) return null;

    const byRow = new Map();
    for (let i = 0; i < keys.length; i++) {
      if (keys[i].isNone) continue; // Skip KC_NO
      const entry = layoutInfo[i];
      const y = Math.round((entry.y || 0) * 4) / 4;
      if (!byRow.has(y)) byRow.set(y, []);
      const key = (entry.w && entry.w !== 1) ? { ...keys[i], w: entry.w } : keys[i];
      byRow.get(y).push(key);
    }

    const sortedYs = [...byRow.keys()].sort((a, b) => a - b);
    const rows = sortedYs.map(y => byRow.get(y));
    return rows.length > 0 ? rows : null;
  }

  #buildLayout(rows) {
    return buildSplitLayout(rows, 'Vial Custom');
  }
}
