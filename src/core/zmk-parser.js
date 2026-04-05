import { ZMK_KEY_MAP } from '../data/key-labels.js';
import { removeComments, buildSplitLayout } from './parser-utils.js';

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
  // Consumer/media
  C_VOL_UP: 'VOLU', C_VOLUME_UP: 'VOLU',
  C_VOL_DN: 'VOLD', C_VOLUME_DOWN: 'VOLD',
  C_MUTE: 'MUTE',
  // Pointing/scroll
  SCRL_UP: 'WH_U', SCRL_DOWN: 'WH_D', SCRL_LEFT: 'WH_L', SCRL_RIGHT: 'WH_R',
  // Mouse buttons
  MB1: 'BTN1', MB2: 'BTN2', MB3: 'BTN3', MB4: 'BTN4', MB5: 'BTN5',
  // Numpad full names
  KP_NUMBER_0: 'KP_N0', KP_NUMBER_1: 'KP_N1', KP_NUMBER_2: 'KP_N2',
  KP_NUMBER_3: 'KP_N3', KP_NUMBER_4: 'KP_N4', KP_NUMBER_5: 'KP_N5',
  KP_NUMBER_6: 'KP_N6', KP_NUMBER_7: 'KP_N7', KP_NUMBER_8: 'KP_N8',
  KP_NUMBER_9: 'KP_N9',
  // International
  INT_HENKAN: 'INT_HENKAN', INT_MUHENKAN: 'INT_MUHENKAN',
};

export class ZmkParser {
  parse(text) {
    const cleaned = removeComments(text);
    const behaviors = this.#extractBehaviors(cleaned);
    const layers = this.#extractLayers(cleaned);

    if (layers.length === 0) {
      throw new Error('No layers found in keymap file');
    }

    const encoderKeys = this.#resolveSensorBindings(layers[0].sensorBindings, behaviors);
    const bindingRows = this.#parseBindingRows(layers[0].bindings);
    const layout = this.#buildLayoutFromRows(bindingRows, encoderKeys);

    return {
      name: layers[0].name || 'ZMK Custom',
      layers,
      layout,
    };
  }

  // Parse custom sensor-rotate behaviors from the behaviors block
  #extractBehaviors(text) {
    const behaviors = new Map();
    const body = this.#extractBlock(text, 'behaviors');
    if (!body) return behaviors;
    // Match each behavior block: name: label { ... };
    const blockRegex = /(\w+)\s*:\s*\w+\s*\{([\s\S]*?)\};/g;
    let match;
    while ((match = blockRegex.exec(body)) !== null) {
      const name = match[1];
      const blockBody = match[2];
      if (!blockBody.includes('behavior-sensor-rotate')) continue;

      // Extract bindings = <&action1 ARG>, <&action2 ARG>;
      const bindingsMatch = blockBody.match(/bindings\s*=\s*([\s\S]*?);/);
      if (!bindingsMatch) continue;

      const entries = [...bindingsMatch[1].matchAll(/<([^>]+)>/g)].map(m => m[1].trim());
      if (entries.length >= 2) {
        behaviors.set(name, {
          ccw: this.#parseBinding(entries[0]),
          cw: this.#parseBinding(entries[1]),
        });
      }
    }
    return behaviors;
  }

  // Extract the body of a named block using brace counting (handles nested blocks)
  #extractBlock(text, name) {
    const pattern = new RegExp(`\\b${name}\\s*\\{`);
    const match = pattern.exec(text);
    if (!match) return null;
    const braceStart = match.index + match[0].length - 1;

    let depth = 1;
    let i = braceStart + 1;
    while (i < text.length && depth > 0) {
      if (text[i] === '{') depth++;
      else if (text[i] === '}') depth--;
      i++;
    }
    return depth === 0 ? text.substring(braceStart + 1, i - 1) : null;
  }

  // Parse a single binding string like "&msc SCRL_UP" into {behavior, params}
  #parseBinding(str) {
    const parts = str.split(/\s+/).filter(Boolean);
    const behavior = parts[0]?.replace(/^&/, '') || '';
    const params = parts.slice(1);
    return { behavior, params };
  }

  #extractLayers(text) {
    const layers = [];
    const keymapBody = this.#extractBlock(text, 'keymap');
    if (!keymapBody) return layers;
    // Match each layer block capturing the full body
    const layerRegex = /(\w+)\s*\{([\s\S]*?)\n\s*\};/g;
    let match;
    while ((match = layerRegex.exec(keymapBody)) !== null) {
      const blockBody = match[2];

      // Extract bindings
      const bindingsMatch = blockBody.match(/bindings\s*=\s*<([\s\S]*?)>\s*;/);
      if (!bindingsMatch) continue;

      // Extract display-name
      const nameMatch = blockBody.match(/display-name\s*=\s*"([^"]*)"/);

      // Extract sensor-bindings
      const sensorMatch = blockBody.match(/sensor-bindings\s*=\s*([\s\S]*?);/);
      let sensorBindings = [];
      if (sensorMatch) {
        sensorBindings = [...sensorMatch[1].matchAll(/<([^>]+)>/g)]
          .map(m => this.#parseBinding(m[1].trim()));
      }

      layers.push({
        id: match[1],
        name: nameMatch?.[1] || match[1],
        bindings: bindingsMatch[1].trim(),
        sensorBindings,
      });
    }

    return layers;
  }

  // Resolve sensor-bindings to encoder key objects
  #resolveSensorBindings(sensorBindings, behaviors) {
    if (!sensorBindings || sensorBindings.length === 0) return [];

    return sensorBindings.map((binding, index) => {
      let ccwCode = '';
      let cwCode = '';

      const customBehavior = behaviors.get(binding.behavior);
      if (customBehavior) {
        // Custom sensor-rotate behavior: resolve inner bindings
        ccwCode = this.#resolveKeycode(customBehavior.ccw.params[0] || '');
        cwCode = this.#resolveKeycode(customBehavior.cw.params[0] || '');
      } else if (binding.behavior === 'inc_dec_kp' && binding.params.length >= 2) {
        // Built-in inc_dec_kp: params are [CCW_key, CW_key]
        ccwCode = this.#resolveKeycode(binding.params[0]);
        cwCode = this.#resolveKeycode(binding.params[1]);
      }

      return {
        code: `_ENC${index}`,
        w: 1,
        isEncoder: true,
        encoderPress: '',
        encoderCCW: ccwCode,
        encoderCW: cwCode,
      };
    });
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

  #buildLayoutFromRows(bindingRows, encoderKeys) {
    const rows = bindingRows.map(bindings => bindings.map(b => this.#bindingToKey(b)));
    const layout = buildSplitLayout(rows, 'ZMK Custom');

    // Insert encoder keys into the layout
    if (encoderKeys.length > 0 && layout.rows.length >= 2) {
      const encoderRowIdx = layout.rows.length - 2;
      const row = layout.rows[encoderRowIdx];
      const firstGap = row.findIndex(k => k.isGap);
      const lastGap = row.findLastIndex(k => k.isGap);

      if (firstGap >= 0) {
        // Left encoder: before first gap
        if (encoderKeys[0]) {
          row.splice(firstGap, 0, encoderKeys[0]);
        }
        // Right encoder: after last gap (adjusted for splice above)
        if (encoderKeys[1] && lastGap >= 0) {
          const adjusted = lastGap + (encoderKeys[0] ? 1 : 0) + 1;
          row.splice(adjusted, 0, encoderKeys[1]);
        }
      }
    }

    return layout;
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
    if (behavior === 'to' && params.length >= 1) {
      return { code: `TO(${params[0]})`, w: 1, isLayer: true };
    }
    if (behavior === 'mkp' && params.length >= 1) {
      return { code: this.#resolveKeycode(params[0]), w: 1 };
    }
    if (behavior === 'msc' && params.length >= 1) {
      return { code: this.#resolveKeycode(params[0]), w: 1 };
    }
    if (behavior === 'trans') return { code: '_TRANS', w: 1, isTrans: true };
    if (behavior === 'none') return { code: '_NONE', w: 1, isNone: true };
    // Custom hold-tap behaviors that act as layer taps
    if (params.length >= 2 && /^\d+$/.test(params[0])) {
      return { code: this.#resolveKeycode(params[1]), w: 1, layerTap: parseInt(params[0]) };
    }
    return { code: `${behavior}`, w: 1, isUnknown: true };
  }

  #resolveKeycode(param) {
    const modMatch = param.match(/^(LS|RS|LC|RC|LA|RA|LG|RG)\((.+)\)$/);
    if (modMatch) return ZMK_ALIASES[modMatch[2]] || modMatch[2];
    return ZMK_ALIASES[param] || param;
  }
}
