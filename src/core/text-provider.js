import { REPOS } from '../data/repo-list.js';

export class TextProvider {
  #bus;

  constructor(bus) {
    this.#bus = bus;
  }

  async loadFromLanguage(language) {
    const repos = REPOS[language];
    if (!repos || repos.length === 0) throw new Error(`No repos for language: ${language}`);

    const repo = repos[Math.floor(Math.random() * repos.length)];
    const file = repo.files[Math.floor(Math.random() * repo.files.length)];
    const url = `https://raw.githubusercontent.com/${repo.owner}/${repo.repo}/${repo.branch}/${file}`;

    const text = await this.#fetch(url);
    const processed = this.#processText(text);
    this.#bus.emit('text:loaded', {
      text: processed,
      language,
      source: `${repo.owner}/${repo.repo}/${file}`,
    });
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
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\/\*[\s\S]*?\*\//g, '')        // remove /* block comments */
      .replace(/^[ \t]*\/\/.*$/gm, '')          // remove // line comments
      .replace(/^[ \t]*#(?!!|include).*$/gm, '') // remove # line comments (not #! or #include)
      .split('\n')
      .map(line => line.replace(/\t/g, '  '))   // convert tabs to 2 spaces
      .filter(line => line.trim().length > 0)    // remove blank lines
      .slice(0, 50)
      .join('\n')
      .trim();
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
    };
    return map[ext] || ext || 'unknown';
  }
}
