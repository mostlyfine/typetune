// Shared utilities for keymap parsers

export const GAP_KEY = { code: '_GAP', w: 0.5, isGap: true };

export function removeComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*/g, '');
}

export function buildSplitLayout(rows, name) {
  const isSplit = rows.length > 0 &&
    rows.every(r => r.length % 2 === 0 && r.length >= 4 && r.length <= 14);

  const layoutRows = rows.map(keys => {
    if (isSplit) {
      const half = keys.length / 2;
      const left = keys.slice(0, half);
      const right = keys.slice(half);
      return [...left, { ...GAP_KEY }, ...right];
    }
    return keys;
  });

  return { name, rows: layoutRows };
}
