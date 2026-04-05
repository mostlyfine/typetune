import { describe, test, expect } from 'vitest';
import { GAP_KEY, removeComments, buildSplitLayout } from '../../src/core/parser-utils.js';

describe('GAP_KEY', () => {
  test('has expected shape', () => {
    expect(GAP_KEY).toEqual({ code: '_GAP', w: 0.5, isGap: true });
  });
});

describe('removeComments', () => {
  test('strips single-line // comments', () => {
    expect(removeComments('code // comment\nnext')).toBe('code \nnext');
  });

  test('strips multi-line /* */ comments', () => {
    expect(removeComments('before /* block\ncomment */ after')).toBe('before  after');
  });

  test('handles both comment types together', () => {
    const input = '/* header */\ncode // inline\nmore';
    expect(removeComments(input)).toBe('\ncode \nmore');
  });

  test('preserves non-comment content', () => {
    const input = 'no comments here';
    expect(removeComments(input)).toBe('no comments here');
  });

  test('handles empty string', () => {
    expect(removeComments('')).toBe('');
  });
});

describe('buildSplitLayout', () => {
  const key = (code) => ({ code, w: 1 });
  const makeRow = (codes) => codes.map(key);

  test('returns unchanged for empty rows', () => {
    expect(buildSplitLayout([], 'test')).toEqual({ name: 'test', rows: [] });
  });

  test('returns unchanged when no even-length rows in range', () => {
    const rows = [makeRow(['A', 'B'])]; // length 2, below threshold of 4
    const result = buildSplitLayout(rows, 'test');
    expect(result.rows).toEqual(rows);
  });

  test('inserts gap for even-length rows', () => {
    const rows = [makeRow(['A', 'B', 'C', 'D', 'E', 'F'])];
    const result = buildSplitLayout(rows, 'split');
    expect(result.name).toBe('split');
    // half = 3, so [A,B,C, GAP, D,E,F]
    expect(result.rows[0]).toHaveLength(7);
    expect(result.rows[0][3].isGap).toBe(true);
  });

  test('handles rows with middle keys (odd inner keys)', () => {
    // 6 keys in even row sets half=3, then a row with 7 keys has 1 middle key
    const rows = [
      makeRow(['A', 'B', 'C', 'D', 'E', 'F']),
      makeRow(['A', 'B', 'C', 'M', 'D', 'E', 'F']),
    ];
    const result = buildSplitLayout(rows, 'test');
    // Row with middle: [A,B,C, GAP, M, GAP, D,E,F]
    const row1 = result.rows[1];
    expect(row1[3].isGap).toBe(true);
    expect(row1[4].code).toBe('M');
    expect(row1[5].isGap).toBe(true);
  });

  test('handles short rows (thumb clusters)', () => {
    const rows = [
      makeRow(['A', 'B', 'C', 'D', 'E', 'F']),
      makeRow(['T1', 'T2', 'T3', 'T4', 'T5']), // odd length, not in evenLens
    ];
    const result = buildSplitLayout(rows, 'test');
    // evenLens=[6], half=3, short row length 5 < 2*3=6
    // left=slice(0,3)=[T1,T2,T3], right=slice(3)=[T4,T5]
    const thumbRow = result.rows[1];
    expect(thumbRow).toHaveLength(6);
    expect(thumbRow[3].isGap).toBe(true);
  });

  test('returns unchanged when not enough rows are splittable', () => {
    // All rows too short to split
    const rows = [
      makeRow(['A', 'B']),
      makeRow(['C', 'D']),
      makeRow(['E', 'F']),
    ];
    const result = buildSplitLayout(rows, 'test');
    expect(result.rows).toEqual(rows);
  });
});
