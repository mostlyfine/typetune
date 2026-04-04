import { decodeVialKeycode, resolveQmkKeycode, splitIntoRows } from '../data/qmk-keycodes.js';
import { buildSplitLayout } from './parser-utils.js';
import { ViaParser } from './via-parser.js';

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
      typeof kc === 'number' ? decodeVialKeycode(kc) : resolveQmkKeycode(kc)
    );

    const rows = this.#detectRows(keys, data);
    const layout = this.#buildLayout(rows);

    return {
      name: 'Vial Custom',
      layers,
      layout,
    };
  }

  #isVialSaveFormat(data) {
    if (!data.layout || !Array.isArray(data.layout) || data.layout.length === 0) return false;
    const first = data.layout[0];
    return Array.isArray(first) && Array.isArray(first[0]);
  }

  #parseVialSave(data) {
    const layerData = data.layout;
    const layers = layerData.map((layer, i) => ({
      id: String(i),
      name: `Layer ${i}`,
      keycodes: layer.flat(),
    }));

    const baseLayer = layerData[0];
    const half = baseLayer.length / 2;
    const leftRows = baseLayer.slice(0, half);
    const rightRows = baseLayer.slice(half);

    const GAP_KEY = { code: '_GAP', w: 0.5, isGap: true };
    const BLANK_KEY = { code: '_GAP', w: 1, isGap: true };
    const resolveKey = kc => kc === -1 ? BLANK_KEY : resolveQmkKeycode(kc);

    const layoutRows = [];
    for (let i = 0; i < half; i++) {
      const left = leftRows[i].map(resolveKey);
      const right = [...rightRows[i]].reverse().map(resolveKey);
      if (left.some(k => !k.isGap) || right.some(k => !k.isGap)) {
        layoutRows.push([...left, GAP_KEY, ...right]);
      }
    }

    return {
      name: 'Vial Custom',
      layers,
      layout: { name: 'Vial Custom', rows: layoutRows },
    };
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
