import { describe, test, expect } from 'vitest';
import { REPOS, LANGUAGE_LABELS, LANGUAGES } from '../../src/data/repo-list.js';

describe('REPOS', () => {
  test('has entries for expected languages', () => {
    const langs = ['javascript', 'typescript', 'python', 'go', 'rust', 'ruby', 'php', 'csharp', 'java', 'cpp', 'swift'];
    for (const lang of langs) {
      expect(REPOS[lang]).toBeDefined();
      expect(Array.isArray(REPOS[lang])).toBe(true);
    }
  });

  test('each repo entry has required fields', () => {
    for (const repos of Object.values(REPOS)) {
      for (const repo of repos) {
        expect(repo).toHaveProperty('owner');
        expect(repo).toHaveProperty('repo');
        expect(repo).toHaveProperty('branch');
        expect(repo).toHaveProperty('files');
        expect(Array.isArray(repo.files)).toBe(true);
      }
    }
  });
});

describe('LANGUAGE_LABELS', () => {
  test('maps all keys in REPOS', () => {
    for (const key of Object.keys(REPOS)) {
      expect(LANGUAGE_LABELS[key]).toBeDefined();
      expect(typeof LANGUAGE_LABELS[key]).toBe('string');
    }
  });
});

describe('LANGUAGES', () => {
  test('is sorted array of all language keys', () => {
    expect(LANGUAGES).toHaveLength(Object.keys(REPOS).length);
    // Verify sorted (descending by label)
    for (let i = 1; i < LANGUAGES.length; i++) {
      const a = LANGUAGE_LABELS[LANGUAGES[i - 1]] || LANGUAGES[i - 1];
      const b = LANGUAGE_LABELS[LANGUAGES[i]] || LANGUAGES[i];
      expect(a.localeCompare(b)).toBeGreaterThanOrEqual(0);
    }
  });
});
