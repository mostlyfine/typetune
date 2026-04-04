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

  if (!isSplit) {
    return { name, rows };
  }

  // Use the smallest row length to determine the standard half-size
  // so that rows with more keys have their outer keys aligned
  const half = Math.min(...rows.map(r => r.length)) / 2;

  const layoutRows = rows.map(keys => {
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
