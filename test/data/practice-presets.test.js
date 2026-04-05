import { describe, test, expect } from 'vitest';
import { PRESETS, generatePracticeText } from '../../src/data/practice-presets.js';

describe('PRESETS', () => {
  test('has expected preset keys', () => {
    expect(Object.keys(PRESETS)).toEqual(
      expect.arrayContaining(['right-hand', 'left-hand', 'num-symbols', 'pinky', 'ring', 'middle', 'index'])
    );
  });

  test('each preset keys() returns non-empty array', () => {
    for (const [id, preset] of Object.entries(PRESETS)) {
      const keys = preset.keys();
      expect(keys.length).toBeGreaterThan(0);
    }
  });

  test('each preset has a name', () => {
    for (const preset of Object.values(PRESETS)) {
      expect(typeof preset.name).toBe('string');
      expect(preset.name.length).toBeGreaterThan(0);
    }
  });
});

describe('generatePracticeText', () => {
  test('returns empty string for empty keys', () => {
    expect(generatePracticeText([])).toBe('');
  });

  test('uses word list when provided', () => {
    const words = ['hello', 'world', 'test'];
    const result = generatePracticeText(['h', 'e', 'l', 'o'], 50, words);
    expect(result.length).toBeGreaterThan(0);
    // All words in result should come from the word list
    const resultWords = result.split(' ');
    for (const w of resultWords) {
      expect(words).toContain(w);
    }
  });

  test('falls back to chunk generation without words', () => {
    const keys = ['a', 'b', 'c'];
    const result = generatePracticeText(keys, 50);
    expect(result.length).toBeGreaterThan(0);
    // Result should contain spaces (chunks separated by spaces)
    expect(result).toContain(' ');
  });

  test('generated chunks only contain characters from provided keys', () => {
    const keys = ['x', 'y', 'z'];
    const result = generatePracticeText(keys, 100);
    for (const char of result) {
      if (char !== ' ') {
        expect(keys).toContain(char);
      }
    }
  });

  test('respects approximate length parameter', () => {
    const keys = ['a', 'b', 'c', 'd'];
    const result = generatePracticeText(keys, 200);
    // Should be roughly around 200 chars (not exact due to chunk/word boundaries)
    expect(result.length).toBeGreaterThanOrEqual(150);
  });
});
