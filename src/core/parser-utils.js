// Shared utilities for keymap parsers

export const GAP_KEY = { code: '_GAP', w: 0.5, isGap: true };

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
