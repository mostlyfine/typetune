import { decodeVialKeycode, resolveQmkKeycode, splitIntoRows } from '../data/qmk-keycodes.js';
import { buildSplitLayout } from './parser-utils.js';

export class VialParser {
  parse(jsonText) {
    const data = typeof jsonText === 'string' ? JSON.parse(jsonText) : jsonText;

    if (!data.layers || !Array.isArray(data.layers) || data.layers.length === 0) {
      throw new Error('No layers found in Vial JSON');
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
      byRow.get(y).push(keys[i]);
    }

    const sortedYs = [...byRow.keys()].sort((a, b) => a - b);
    const rows = sortedYs.map(y => byRow.get(y));
    return rows.length > 0 ? rows : null;
  }

  #buildLayout(rows) {
    return buildSplitLayout(rows, 'Vial Custom');
  }
}
