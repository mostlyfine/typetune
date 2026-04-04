import { KEY_TO_FINGER, FINGERS } from './key-finger-map.js';
import { ZMK_KEY_MAP } from './key-labels.js';

// Common English + programming words for practice
const WORD_LIST = [
  // 2-3 letter
  'if', 'do', 'is', 'in', 'on', 'to', 'or', 'of', 'at', 'go', 'up', 'no', 'so',
  'be', 'we', 'he', 'me', 'by', 'my', 'an', 'as', 'it', 'us', 'am',
  'new', 'for', 'get', 'set', 'let', 'var', 'nil', 'end', 'out', 'put', 'run',
  'try', 'use', 'key', 'map', 'log', 'err', 'add', 'has', 'not', 'all', 'any',
  'old', 'raw', 'red', 'top', 'two', 'way', 'who', 'big', 'few', 'low', 'own',
  'def', 'int', 'str', 'len', 'max', 'min', 'sum', 'pop', 'nil', 'pub', 'mod',
  // 4 letter
  'true', 'false', 'null', 'void', 'bool', 'byte', 'char', 'long', 'enum',
  'case', 'else', 'from', 'func', 'goto', 'init', 'join', 'kill', 'list',
  'load', 'lock', 'loop', 'main', 'make', 'name', 'next', 'node', 'none',
  'open', 'path', 'port', 'push', 'pull', 'read', 'rust', 'save', 'self',
  'send', 'show', 'sign', 'size', 'skip', 'sort', 'step', 'stop', 'sync',
  'take', 'task', 'test', 'text', 'this', 'then', 'time', 'type', 'uint',
  'wait', 'walk', 'when', 'with', 'work', 'wrap', 'zero', 'data', 'done',
  'each', 'emit', 'fail', 'file', 'find', 'flag', 'flat', 'fold', 'fork',
  'free', 'hash', 'help', 'hide', 'hook', 'host', 'http', 'link', 'lint',
  'math', 'mock', 'move', 'must', 'call', 'copy', 'code', 'drop', 'dump',
  'edit', 'exec', 'exit', 'grow', 'keep', 'kind', 'last', 'left', 'like',
  'many', 'mark', 'memo', 'much', 'once', 'only', 'pack', 'page', 'pair',
  'pick', 'pipe', 'play', 'pool', 'pure', 'race', 'rand', 'rate', 'rest',
  'role', 'root', 'rule', 'safe', 'scan', 'seed', 'seek', 'shut', 'snap',
  'some', 'spec', 'spin', 'swap', 'tail', 'temp', 'tick', 'trim', 'turn',
  'unit', 'user', 'view', 'warn', 'weak', 'wide', 'tree', 'bind', 'cast',
  // 5 letter
  'async', 'await', 'begin', 'block', 'break', 'build', 'catch', 'check',
  'chunk', 'class', 'clean', 'clear', 'click', 'clone', 'close', 'const',
  'count', 'debug', 'defer', 'depth', 'drain', 'drive', 'erase', 'error',
  'event', 'every', 'fetch', 'final', 'first', 'fixed', 'flash', 'float',
  'flush', 'focus', 'force', 'found', 'frame', 'graph', 'group', 'guard',
  'index', 'inner', 'input', 'layer', 'level', 'limit', 'local', 'match',
  'merge', 'model', 'mount', 'mutex', 'never', 'order', 'other', 'outer',
  'owned', 'panic', 'parse', 'patch', 'pause', 'point', 'print', 'proxy',
  'query', 'queue', 'quiet', 'raise', 'range', 'reset', 'retry', 'route',
  'scale', 'scene', 'scope', 'setup', 'share', 'shell', 'shift', 'short',
  'sleep', 'slice', 'split', 'stack', 'start', 'state', 'steal', 'store',
  'style', 'super', 'table', 'throw', 'timer', 'token', 'total', 'trace',
  'train', 'trait', 'tuple', 'valid', 'value', 'watch', 'where', 'while',
  'write', 'yield', 'abort', 'above', 'apply', 'array', 'basic', 'batch',
  'bench', 'bound', 'cache', 'chain', 'child', 'claim', 'cover', 'craft',
  'cross', 'cycle', 'dense', 'draft', 'early', 'empty', 'equal', 'exact',
  'extra', 'field', 'forth', 'fresh', 'given', 'grand', 'happy', 'heavy',
  'large', 'later', 'light', 'logic', 'loose', 'lower', 'maybe', 'minor',
  'occur', 'offer', 'phase', 'place', 'plain', 'plant', 'power', 'prior',
  'prove', 'quick', 'ready', 'refer', 'reply', 'right', 'rough', 'round',
  'serve', 'shape', 'since', 'small', 'solid', 'solve', 'space', 'spare',
  'speed', 'spent', 'stamp', 'stand', 'stern', 'stock', 'stuff', 'thing',
  'third', 'tight', 'tough', 'track', 'trial', 'trust', 'twice', 'under',
  'union', 'until', 'upper', 'using', 'usual',
  // 6+ letter
  'assert', 'attach', 'buffer', 'client', 'commit', 'config', 'create',
  'decode', 'delete', 'detect', 'direct', 'double', 'enable', 'encode',
  'export', 'extend', 'extern', 'filter', 'finish', 'format', 'frozen',
  'global', 'handle', 'hidden', 'ignore', 'import', 'inline', 'insert',
  'invoke', 'lambda', 'launch', 'length', 'listen', 'lookup', 'manage',
  'method', 'module', 'mutable', 'native', 'number', 'object', 'offset',
  'option', 'origin', 'output', 'parent', 'permit', 'prefer', 'public',
  'record', 'reduce', 'reject', 'reload', 'remove', 'render', 'repeat',
  'report', 'result', 'return', 'revert', 'revoke', 'router', 'scroll',
  'search', 'secure', 'select', 'sender', 'server', 'signal', 'single',
  'socket', 'source', 'spread', 'static', 'status', 'stream', 'string',
  'struct', 'submit', 'switch', 'symbol', 'system', 'target', 'thread',
  'toggle', 'unique', 'unlock', 'unsafe', 'update', 'upload', 'window',
  'accept', 'access', 'action', 'branch', 'bridge', 'cancel', 'change',
  'column', 'custom', 'daemon', 'deploy', 'design', 'digest', 'escape',
  'gather', 'health', 'inject', 'layout', 'marker', 'memory', 'notion',
  'policy', 'prompt', 'random', 'reason', 'refund', 'schema', 'script',
  'simple', 'supply', 'travel', 'verify', 'worker',
  'default', 'channel', 'collect', 'command', 'compare', 'compile', 'connect',
  'context', 'convert', 'counter', 'current', 'display', 'dynamic', 'element',
  'execute', 'factory', 'feature', 'handler', 'hosting', 'integer', 'iterate',
  'keyword', 'library', 'literal', 'message', 'network', 'package', 'partial',
  'pattern', 'payload', 'pending', 'pointer', 'private', 'process', 'produce',
  'program', 'project', 'promise', 'protect', 'provide', 'publish', 'receive',
  'recover', 'refresh', 'release', 'request', 'require', 'resolve', 'restart',
  'runtime', 'section', 'segment', 'service', 'session', 'setting', 'timeout',
  'trigger', 'version', 'wrapper', 'abstract', 'argument', 'callback',
  'complete', 'constant', 'continue', 'database', 'dispatch', 'document',
  'download', 'endpoint', 'evaluate', 'function', 'generate', 'instance',
  'internal', 'iterator', 'listener', 'metadata', 'multiply', 'nullable',
  'observer', 'operator', 'optional', 'override', 'platform', 'practice',
  'priority', 'protocol', 'readonly', 'redirect', 'register', 'relation',
  'relative', 'required', 'resource', 'response', 'schedule', 'selector',
  'sequence', 'snapshot', 'strategy', 'template', 'terminal', 'transfer',
  'variable', 'interface', 'namespace', 'parameter', 'primitive', 'reference',
  'transform', 'undefined', 'exception', 'implement', 'condition',
];

// Collect typable chars for each finger
function charsForFinger(fingerId) {
  const chars = [];
  for (const [code, finger] of Object.entries(KEY_TO_FINGER)) {
    if (finger === fingerId && ZMK_KEY_MAP[code]?.char) {
      chars.push(ZMK_KEY_MAP[code].char);
    }
  }
  return chars;
}

function charsForHand(side) {
  const prefix = side === 'left' ? 'l-' : 'r-';
  const chars = [];
  for (const [code, finger] of Object.entries(KEY_TO_FINGER)) {
    if (finger.startsWith(prefix) && ZMK_KEY_MAP[code]?.char) {
      chars.push(ZMK_KEY_MAP[code].char);
    }
  }
  return chars;
}

const NUMBER_CHARS = '0123456789'.split('');
const SYMBOL_CHARS = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/\\`~'.split('');

// Filter words that can be typed using only the given character set
function filterWords(allowedChars) {
  const charSet = new Set(allowedChars);
  return WORD_LIST.filter(word =>
    [...word].every(ch => charSet.has(ch))
  );
}

// Generate practice text from matching words, fallback to random if too few
function buildText(allowedChars, length) {
  const words = filterWords(allowedChars);

  if (words.length >= 5) {
    // Enough real words — use them
    const result = [];
    let totalLen = 0;
    while (totalLen < length) {
      const word = words[Math.floor(Math.random() * words.length)];
      result.push(word);
      totalLen += word.length + 1;
    }
    return result.join(' ');
  }

  // Too few real words — mix words with short random groups
  const printable = allowedChars.filter(k => k.trim().length > 0);
  if (printable.length === 0) return '';

  const result = [];
  let totalLen = 0;
  while (totalLen < length) {
    // Alternate: use a real word if available, otherwise generate a short pattern
    if (words.length > 0 && Math.random() < 0.4) {
      const word = words[Math.floor(Math.random() * words.length)];
      result.push(word);
      totalLen += word.length + 1;
    } else {
      const len = 2 + Math.floor(Math.random() * 4);
      let group = '';
      for (let i = 0; i < len; i++) {
        group += printable[Math.floor(Math.random() * printable.length)];
      }
      result.push(group);
      totalLen += group.length + 1;
    }
  }
  return result.join(' ');
}

export const PRESETS = {
  'right-hand':  { name: 'Right Hand', keys: () => charsForHand('right') },
  'left-hand':   { name: 'Left Hand',  keys: () => charsForHand('left') },
  'numbers':     { name: 'Numbers',    keys: () => NUMBER_CHARS },
  'symbols':     { name: 'Symbols',    keys: () => SYMBOL_CHARS },
  'l-pinky':     { name: 'Left Pinky',   keys: () => charsForFinger(FINGERS.L_PINKY) },
  'l-ring':      { name: 'Left Ring',    keys: () => charsForFinger(FINGERS.L_RING) },
  'l-middle':    { name: 'Left Middle',  keys: () => charsForFinger(FINGERS.L_MIDDLE) },
  'l-index':     { name: 'Left Index',   keys: () => charsForFinger(FINGERS.L_INDEX) },
  'r-index':     { name: 'Right Index',  keys: () => charsForFinger(FINGERS.R_INDEX) },
  'r-middle':    { name: 'Right Middle', keys: () => charsForFinger(FINGERS.R_MIDDLE) },
  'r-ring':      { name: 'Right Ring',   keys: () => charsForFinger(FINGERS.R_RING) },
  'r-pinky':     { name: 'Right Pinky',  keys: () => charsForFinger(FINGERS.R_PINKY) },
};

export function generatePracticeText(keys, length = 200) {
  if (keys.length === 0) return '';
  return buildText(keys, length);
}
