import { REPOS } from '../data/repo-list.js';

const FUNC_PATTERNS = [
  /^(export\s+)?(default\s+)?(async\s+)?function\s/,
  /\bfunc\s+\w/,
  /^(pub(\s*\(\w+\))?\s+)?(async\s+)?(unsafe\s+)?fn\s/,
  /^(async\s+)?def\s/,
];

export class TextProvider {
  #bus;

  constructor(bus) {
    this.#bus = bus;
  }

  async loadFromLanguage(language) {
    const repos = REPOS[language];
    if (!repos || repos.length === 0) throw new Error(`No repos for language: ${language}`);

    // Build shuffled list of all repo/file candidates
    const candidates = repos.flatMap(repo =>
      repo.files.map(file => ({ repo, file }))
    );
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    for (const { repo, file } of candidates) {
      const url = `https://raw.githubusercontent.com/${repo.owner}/${repo.repo}/${repo.branch}/${file}`;
      try {
        const text = await this.#fetch(url);
        const processed = this.#processText(text);
        this.#bus.emit('text:loaded', {
          text: processed,
          language,
          source: `${repo.owner}/${repo.repo}/${file}`,
        });
        return;
      } catch {
        // try next candidate
      }
    }
    throw new Error(`All sources failed for ${language}`);
  }

  loadFromFile(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const processed = this.#processText(reader.result);
        this.#bus.emit('text:loaded', {
          text: processed,
          language: this.#guessLanguage(file.name),
          source: file.name,
        });
        resolve();
      };
      reader.readAsText(file);
    });
  }

  loadText(text, source = 'preset') {
    this.#bus.emit('text:loaded', {
      text,
      language: 'preset',
      source,
    });
  }

  async #fetch(url) {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Failed to fetch: ${resp.status} ${resp.statusText}`);
    return resp.text();
  }

  #processText(text) {
    const cleaned = text
      .replace(/\r\n/g, '\n')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^[ \t]*import\s*\([\s\S]*?\n[ \t]*\)/gm, '')
      .replace(/^[ \t]*import\s*\{[\s\S]*?\}\s*from\b.*$/gm, '')
      .replace(/^[ \t]*from\s+\S+\s+import\s*\([\s\S]*?\)/gm, '')
      .replace(/^[ \t]*use\s+\S+::\{[\s\S]*?\};\s*$/gm, '')
      .replace(/^[ \t]*\/\/.*$/gm, '')
      .replace(/^[ \t]*#(?![!]).*$/gm, '')
      .replace(/^[ \t]*package\s+[\w.]+;\s*$/gm, '')
      .replace(/^[ \t]*import\b.*$/gm, '')
      .replace(/^[ \t]*from\s+\S+\s+import\b.*$/gm, '')
      .replace(/^[ \t]*(require|require_relative|require_once|include_once)\b.*$/gm, '')
      .replace(/^[ \t]*include\s+['"].*$/gm, '')
      .replace(/^[ \t]*use\s+\S+;\s*$/gm, '')
      .replace(/^[ \t]*using\s+\S+.*;\s*$/gm, '')
      .replace(/^[ \t]*extern\s+crate\b.*$/gm, '');

    const lines = cleaned.split('\n')
      .map(line => line.replace(/\t/g, '  '))
      .filter(line => line.trim().length > 0);

    return this.#extractFunctions(lines).slice(0, 50).join('\n').trim();
  }

  #extractFunctions(lines) {
    const blocks = [];
    let i = 0;

    while (i < lines.length) {
      if (this.#isFuncStart(lines[i])) {
        const { result, end } = this.#extractBlock(lines, i);
        blocks.push(...result);
        i = end + 1;
        if (blocks.length >= 50) break;
      } else {
        i++;
      }
    }

    return blocks.length > 0 ? blocks : lines;
  }

  #isFuncStart(line) {
    const t = line.trimStart();
    if (FUNC_PATTERNS.some(p => p.test(t))) return true;
    if (/^(public|private|protected|internal|open|fileprivate)\s+/.test(t) &&
        /\w+\s*\(/.test(t) &&
        !/\b(class|interface|struct|enum|record|delegate|namespace)\b/.test(t)) return true;
    return false;
  }

  #extractBlock(lines, start) {
    // Python/Ruby: indentation-based (def without opening brace)
    if (/^\s*(async\s+)?def\s/.test(lines[start]) && !lines[start].includes('{')) {
      return this.#extractIndentBlock(lines, start);
    }
    return this.#extractBraceBlock(lines, start);
  }

  #extractBraceBlock(lines, start) {
    let depth = 0;
    let opened = false;
    const result = [];

    for (let i = start; i < lines.length; i++) {
      result.push(lines[i]);
      for (const ch of lines[i]) {
        if (ch === '{') { depth++; opened = true; }
        if (ch === '}') depth--;
      }
      if (opened && depth <= 0) {
        return { result, end: i };
      }
    }

    if (!opened) return { result: [lines[start]], end: start };
    return { result, end: lines.length - 1 };
  }

  #extractIndentBlock(lines, start) {
    const result = [lines[start]];
    const baseIndent = lines[start].search(/\S/);

    for (let i = start + 1; i < lines.length; i++) {
      const indent = lines[i].search(/\S/);
      if (indent >= 0 && indent <= baseIndent) {
        // Ruby: include closing 'end'
        if (lines[i].trim() === 'end') {
          result.push(lines[i]);
          return { result, end: i };
        }
        return { result, end: i - 1 };
      }
      result.push(lines[i]);
    }

    return { result, end: lines.length - 1 };
  }

  #guessLanguage(filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    const map = {
      js: 'javascript', mjs: 'javascript', jsx: 'javascript',
      ts: 'typescript', tsx: 'typescript',
      py: 'python',
      go: 'go',
      rs: 'rust',
      rb: 'ruby',
      php: 'php',
      cs: 'csharp',
      java: 'java',
      cpp: 'cpp', cc: 'cpp', cxx: 'cpp', hpp: 'cpp', h: 'cpp',
      swift: 'swift',
    };
    return map[ext] || ext || 'unknown';
  }
}
