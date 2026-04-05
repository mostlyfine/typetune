import { resolveKeycode } from '../data/keycodes.js';
import { buildSplitLayout } from './parser-utils.js';

// Keys that typically start a keyboard row
const ROW_START_KEYS = new Set([
  'KC_ESC', 'KC_GRV', 'KC_TAB', 'KC_LCTL', 'KC_LSFT', 'KC_CAPS',
]);

// Standard QWERTY keycode per matrix position [row][col]
// Fallback for VIA definition files that lack layers
const STANDARD_MATRIX = [
  ['ESC','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12','PSCRN','DEL','INS'],
  ['GRAVE','N1','N2','N3','N4','N5','N6','N7','N8','N9','N0','MINUS','EQUAL','BSPC','HOME','PG_UP'],
  ['TAB','Q','W','E','R','T','Y','U','I','O','P','LBKT','RBKT','BSLH','DEL','PG_DN'],
  ['CAPS','A','S','D','F','G','H','J','K','L','SEMI','SQT','BSLH','ENTER','HOME','PG_UP'],
  ['LSHIFT','BSLH','Z','X','C','V','B','N','M','COMMA','DOT','FSLH','RSHIFT','UP','RSHIFT','END'],
  ['LCTRL','LGUI','LALT','LGUI','LALT','SPACE','SPACE','SPACE','RALT','RGUI','RCTRL','RCTRL','LEFT','DOWN','RIGHT','RIGHT'],
];

export class ViaParser {
  parse(jsonText) {
    const data = typeof jsonText === 'string' ? JSON.parse(jsonText) : jsonText;

    // Saved keymap format (has layers)
    if (data.layers && Array.isArray(data.layers) && data.layers.length > 0) {
      return this.#parseKeymapSave(data);
    }

    // Keyboard definition format (has layouts.keymap in KLE format)
    if (data.layouts?.keymap) {
      return this.#parseDefinition(data);
    }

    throw new Error('No layers or layouts found in VIA JSON');
  }

  // --- Saved keymap parsing (existing logic) ---

  #parseKeymapSave(data) {
    const layers = data.layers.map((layer, i) => ({
      id: String(i),
      name: `Layer ${i}`,
      keycodes: layer,
    }));

    const baseLayer = layers[0].keycodes;
    const cols = data.matrix?.cols || data.cols || this.#detectCols(baseLayer);
    const rows = this.#buildRows(baseLayer, cols);
    const layout = this.#buildLayout(rows);

    return { name: data.name || 'VIA Custom', layers, layout };
  }

  #detectCols(keycodes) {
    const n = keycodes.length;
    let bestCols = 15;
    let bestScore = -1;

    for (const cols of [16, 15, 14, 12, 10, 8, 7, 6]) {
      if (n % cols !== 0) continue;
      const numRows = n / cols;
      if (numRows < 4 || numRows > 16) continue;

      let startMatches = 0;
      let activeRows = 0;

      for (let r = 0; r < numRows; r++) {
        const rowStart = r * cols;
        let activeCount = 0;
        let firstActiveChecked = false;

        for (let c = 0; c < cols; c++) {
          const kc = keycodes[rowStart + c];
          if (kc !== 'KC_NO') {
            activeCount++;
            if (!firstActiveChecked && c < 3) {
              if (ROW_START_KEYS.has(kc)) startMatches++;
              firstActiveChecked = true;
            }
          }
        }

        if (activeCount >= 3) activeRows++;
      }

      const score = startMatches * 100 - activeRows * 5 + cols;
      if (score > bestScore) {
        bestScore = score;
        bestCols = cols;
      }
    }

    return bestCols;
  }

  #buildRows(keycodes, cols) {
    const rows = [];
    for (let i = 0; i < keycodes.length; i += cols) {
      const rawRow = keycodes.slice(i, i + cols);
      const keys = rawRow.map(kc => resolveKeycode(kc)).filter(k => !k.isNone);
      if (keys.length > 0) rows.push(keys);
    }
    return rows;
  }

  #buildLayout(rows) {
    return buildSplitLayout(rows, 'VIA Custom');
  }

  // --- Keyboard definition parsing (KLE format) ---

  #parseDefinition(data) {
    const kleRows = data.layouts.keymap;
    const rows = this.#parseKle(kleRows);

    return {
      name: data.name || 'VIA Custom',
      layers: [],
      layout: { name: data.name || 'VIA Custom', rows },
    };
  }

  // Parse KLE-format layout array into rows of key objects with proper widths
  // Handles x offsets as gaps, matrix positions ("row,col") for QWERTY fallback
  #parseKle(kleRows) {
    const rows = [];

    for (const kleRow of kleRows) {
      // Skip metadata object (first element of first row in some KLE exports)
      if (!Array.isArray(kleRow)) continue;

      const row = [];
      let props = {};

      for (const entry of kleRow) {
        if (typeof entry === 'object' && entry !== null) {
          Object.assign(props, entry);
        } else if (typeof entry === 'string') {
          // Insert gap for horizontal offset
          if (props.x && props.x >= 0.25) {
            row.push({ code: '_GAP', w: props.x, isGap: true });
          }

          const w = props.w || 1;
          let code;

          if (w >= 3) {
            code = 'SPACE';
          } else {
            const posMatch = entry.match(/^(\d+),(\d+)$/);
            if (posMatch) {
              const mRow = parseInt(posMatch[1]);
              const mCol = parseInt(posMatch[2]);
              const rowMap = STANDARD_MATRIX[mRow];
              code = rowMap ? (rowMap[mCol] || `R${mRow}C${mCol}`) : `R${mRow}C${mCol}`;
            } else {
              code = entry;
            }
          }

          row.push({ code, w });
          props = {};
        }
      }

      if (row.length > 0) rows.push(row);
    }

    return rows;
  }
}
