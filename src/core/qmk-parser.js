import { resolveQmkKeycode } from '../data/qmk-keycodes.js';
import { removeComments, buildSplitLayout } from './parser-utils.js';

export class QmkParser {
  parse(text) {
    const cleaned = removeComments(text);
    const layers = this.#extractLayers(cleaned);

    if (layers.length === 0) {
      throw new Error('No LAYOUT found in keymap file');
    }

    const rows = this.#parseLayoutRows(layers[0].body);
    const layout = this.#buildLayout(rows);

    return {
      name: layers[0].name || 'QMK Custom',
      layers,
      layout,
    };
  }

  #extractLayers(text) {
    const layers = [];
    // Match [N] = LAYOUT*(...) with balanced parentheses
    const regex = /\[(\d+)\]\s*=\s*(LAYOUT\w*)\s*\(/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const startIdx = match.index + match[0].length;
      const body = this.#extractParenBody(text, startIdx);
      if (body !== null) {
        layers.push({
          id: match[1],
          name: `Layer ${match[1]}`,
          macroName: match[2],
          body,
        });
      }
    }

    return layers;
  }

  // Extract content inside balanced parentheses starting after opening paren
  #extractParenBody(text, startIdx) {
    let depth = 1;
    let i = startIdx;
    while (i < text.length && depth > 0) {
      if (text[i] === '(') depth++;
      else if (text[i] === ')') depth--;
      i++;
    }
    if (depth !== 0) return null;
    return text.substring(startIdx, i - 1);
  }

  // Parse LAYOUT body preserving row structure from line breaks
  #parseLayoutRows(body) {
    const lines = body.split('\n').filter(l => l.trim().length > 0);
    const rows = [];

    for (const line of lines) {
      const keycodes = line
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      if (keycodes.length > 0) {
        rows.push(keycodes.map(kc => resolveQmkKeycode(kc)));
      }
    }

    return rows;
  }

  #buildLayout(rows) {
    return buildSplitLayout(rows, 'QMK Custom');
  }
}
