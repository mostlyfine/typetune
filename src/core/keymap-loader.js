import { ZmkParser } from './zmk-parser.js';
import { ViaParser } from './via-parser.js';
import { VialParser } from './vial-parser.js';
import { QmkParser } from './qmk-parser.js';

export class KeymapLoader {
  #zmk = new ZmkParser();
  #via = new ViaParser();
  #vial = new VialParser();
  #qmk = new QmkParser();

  load(text, filename = '') {
    const { format, parsed } = this.#detectFormat(text, filename);

    switch (format) {
      case 'zmk':  return this.#zmk.parse(text);
      case 'via':  return this.#via.parse(parsed);
      case 'vial': return this.#vial.parse(parsed);
      case 'qmk':  return this.#qmk.parse(text);
      default:
        throw new Error(`Unknown keymap format: ${filename}`);
    }
  }

  #detectFormat(text, filename) {
    const ext = this.#getExtension(filename);

    if (ext === '.keymap' || ext === '.dtsi') return { format: 'zmk', parsed: null };
    if (ext === '.c' || ext === '.h') return { format: 'qmk', parsed: null };

    if (ext === '.vil') {
      try {
        const data = JSON.parse(text);
        return { format: 'vial', parsed: data };
      } catch {
        throw new Error('Invalid .vil file: not valid JSON');
      }
    }

    if (ext === '.json') {
      return this.#detectJsonFormat(text);
    }

    return this.#detectFromContent(text);
  }

  #getExtension(filename) {
    const dot = filename.lastIndexOf('.');
    return dot >= 0 ? filename.substring(dot).toLowerCase() : '';
  }

  #detectJsonFormat(text) {
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Invalid JSON file');
    }
    if (data.uid !== undefined) return { format: 'vial', parsed: data };
    return { format: 'via', parsed: data };
  }

  #detectFromContent(text) {
    try {
      const data = JSON.parse(text);
      if (data.uid !== undefined) return { format: 'vial', parsed: data };
      if (data.layers || data.layouts) return { format: 'via', parsed: data };
    } catch {
      // Not JSON, continue
    }

    if (/keymap\s*\{/.test(text)) return { format: 'zmk', parsed: null };
    if (/PROGMEM\s+keymaps/.test(text) || /LAYOUT\w*\s*\(/.test(text)) return { format: 'qmk', parsed: null };

    throw new Error('Could not detect keymap format');
  }
}
