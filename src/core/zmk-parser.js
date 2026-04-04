import { ZMK_KEY_MAP } from '../data/key-labels.js';

// ZMK keycode aliases -> canonical form used in ZMK_KEY_MAP
const ZMK_ALIASES = {
  NUMBER_1: 'N1', NUMBER_2: 'N2', NUMBER_3: 'N3', NUMBER_4: 'N4', NUMBER_5: 'N5',
  NUMBER_6: 'N6', NUMBER_7: 'N7', NUMBER_8: 'N8', NUMBER_9: 'N9', NUMBER_0: 'N0',
  RETURN: 'ENTER', RET: 'ENTER', RETURN2: 'ENTER',
  BACKSPACE: 'BSPC', DELETE: 'DEL', ESCAPE: 'ESC',
  LEFT_SHIFT: 'LSHIFT', LSHFT: 'LSHIFT',
  RIGHT_SHIFT: 'RSHIFT', RSHFT: 'RSHIFT',
  LEFT_CONTROL: 'LCTRL', LCTL: 'LCTRL',
  RIGHT_CONTROL: 'RCTRL', RCTL: 'RCTRL',
  LEFT_ALT: 'LALT', RIGHT_ALT: 'RALT',
  LEFT_GUI: 'LGUI', LEFT_COMMAND: 'LGUI', LEFT_WIN: 'LGUI', LCMD: 'LGUI', LWIN: 'LGUI',
  RIGHT_GUI: 'RGUI', RIGHT_COMMAND: 'RGUI', RIGHT_WIN: 'RGUI', RCMD: 'RGUI', RWIN: 'RGUI',
  CAPS_LOCK: 'CAPS', CAPSLOCK: 'CAPS', CLCK: 'CAPS',
  SEMICOLON: 'SEMI',
  APOSTROPHE: 'SQT', APOS: 'SQT', SINGLE_QUOTE: 'SQT',
  GRAVE_ACCENT: 'GRAVE',
  PERIOD: 'DOT',
  SLASH: 'FSLH', FORWARD_SLASH: 'FSLH',
  BACKSLASH: 'BSLH', NON_US_BSLH: 'BSLH',
  LEFT_BRACKET: 'LBKT', RIGHT_BRACKET: 'RBKT',
  EXCLAMATION: 'N1', EXCL: 'N1', AT_SIGN: 'N2', AT: 'N2',
  HASH: 'N3', POUND: 'N3', DOLLAR: 'N4', DLLR: 'N4',
  PERCENT: 'N5', PRCNT: 'N5', CARET: 'N6',
  AMPERSAND: 'N7', AMPS: 'N7',
  ASTERISK: 'N8', ASTRK: 'N8', STAR: 'N8',
  LEFT_PARENTHESIS: 'N9', LPAR: 'N9',
  RIGHT_PARENTHESIS: 'N0', RPAR: 'N0',
  UNDERSCORE: 'MINUS', UNDER: 'MINUS', PLUS: 'EQUAL',
  LEFT_BRACE: 'LBKT', LBRC: 'LBKT',
  RIGHT_BRACE: 'RBKT', RBRC: 'RBKT',
  PIPE: 'BSLH', COLON: 'SEMI',
  DOUBLE_QUOTES: 'SQT', DQT: 'SQT', TILDE: 'GRAVE',
  LESS_THAN: 'COMMA', LT: 'COMMA',
  GREATER_THAN: 'DOT', GT: 'DOT',
  QUESTION: 'FSLH', QMARK: 'FSLH',
  PAGE_UP: 'PG_UP', PAGE_DOWN: 'PG_DN',
  LEFT_ARROW: 'LEFT', RIGHT_ARROW: 'RIGHT', UP_ARROW: 'UP', DOWN_ARROW: 'DOWN',
  INSERT: 'INS', PRINTSCREEN: 'PSCRN', PRINT_SCREEN: 'PSCRN',
  SCROLLLOCK: 'SLCK', SCROLL_LOCK: 'SLCK', PAUSE_BREAK: 'PAUSE',
};

export class ZmkParser {
  parse(text) {
    const cleaned = this.#removeComments(text);
    const layers = this.#extractLayers(cleaned);

    if (layers.length === 0) {
      throw new Error('No layers found in keymap file');
    }

    const bindingRows = this.#parseBindingRows(layers[0].bindings);
    const layout = this.#buildLayoutFromRows(bindingRows);

    return {
      name: layers[0].name || 'ZMK Custom',
      layers,
      layout,
    };
  }

  #removeComments(text) {
    return text
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*/g, '');
  }

  #extractLayers(text) {
    const layers = [];
    const keymapMatch = text.match(/keymap\s*\{([\s\S]*?)\n\s*\};/);
    if (!keymapMatch) return layers;

    const keymapBody = keymapMatch[1];
    const layerRegex = /(\w+)\s*\{[^}]*?(?:display-name\s*=\s*"([^"]*)")?\s*[^}]*?bindings\s*=\s*<([\s\S]*?)>\s*;/g;
    let match;
    while ((match = layerRegex.exec(keymapBody)) !== null) {
      layers.push({
        id: match[1],
        name: match[2] || match[1],
        bindings: match[3].trim(),
      });
    }

    return layers;
  }

  // Parse bindings preserving row structure from line breaks
  #parseBindingRows(bindingsText) {
    const lines = bindingsText.split('\n').filter(l => l.trim().length > 0);
    return lines.map(line => this.#parseLine(line));
  }

  #parseLine(line) {
    const tokens = [];
    const parts = line.trim().split(/\s+/).filter(Boolean);
    let i = 0;
    while (i < parts.length) {
      if (parts[i].startsWith('&')) {
        const behavior = parts[i].substring(1);
        const params = [];
        i++;
        while (i < parts.length && !parts[i].startsWith('&')) {
          params.push(parts[i]);
          i++;
        }
        tokens.push({ behavior, params });
      } else {
        i++;
      }
    }
    return tokens;
  }

  // Build layout directly from row structure — no preset needed
  #buildLayoutFromRows(bindingRows) {
    const rows = [];
    for (const bindings of bindingRows) {
      const keys = bindings.map(b => this.#bindingToKey(b));
      const half = Math.ceil(keys.length / 2);
      const left = keys.slice(0, half);
      const right = keys.slice(half);
      rows.push([...left, { code: '_GAP', w: 0.5, isGap: true }, ...right]);
    }
    return { name: 'ZMK Custom', rows };
  }

  #bindingToKey(binding) {
    const { behavior, params } = binding;
    if (behavior === 'kp' && params.length >= 1) {
      return { code: this.#resolveKeycode(params[0]), w: 1 };
    }
    if (behavior === 'lt' && params.length >= 2) {
      return { code: this.#resolveKeycode(params[1]), w: 1, layerTap: parseInt(params[0]) };
    }
    if (behavior === 'mt' && params.length >= 2) {
      return { code: this.#resolveKeycode(params[1]), w: 1, modTap: params[0] };
    }
    if (behavior === 'mo' && params.length >= 1) {
      return { code: `MO(${params[0]})`, w: 1, isLayer: true };
    }
    if (behavior === 'trans') return { code: '_TRANS', w: 1, isTrans: true };
    if (behavior === 'none') return { code: '_NONE', w: 1, isNone: true };
    return { code: `${behavior}`, w: 1, isUnknown: true };
  }

  #resolveKeycode(param) {
    const modMatch = param.match(/^(LS|RS|LC|RC|LA|RA|LG|RG)\((.+)\)$/);
    if (modMatch) return ZMK_ALIASES[modMatch[2]] || modMatch[2];
    return ZMK_ALIASES[param] || param;
  }
}
