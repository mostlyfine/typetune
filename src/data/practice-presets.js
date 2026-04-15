import { KEY_TO_FINGER, FINGERS } from './key-finger-map.js';
import { ZMK_KEY_MAP } from './key-labels.js';

// Finger-pair word lists: 4-10 chars, max 1 char outside the finger's keys
// Words selected for: commonality, balanced key coverage, length variety

const PINKY_WORDS = [
  'aqua', 'quiz', 'apply', 'plaza', 'zip', 'quartz', 'apex', 'page',
  'ajax', 'proxy', 'zap', 'apple', 'zoom', 'pizza', 'appendix', 'lazy',
  'span', 'azure', 'alpha', 'space', 'quest', 'zebra', 'quasi', 'analyze',
  'puzzle', 'quality', 'zappa', 'asap', 'opaque',
];

const RING_WORDS = [
  'slow', 'windows', 'logs', 'scroll', 'down', 'low', 'linux', 'solo',
  'tools', 'sql', 'world', 'loss', 'local', 'wool', 'wood', 'follow',
  'small', 'oxide', 'swallow', 'allow', 'pools', 'solve', 'swell', 'slowly',
  'swirl', 'solid', 'loose', 'scrolls', 'workflow',
];

const MIDDLE_WORDS = [
  'edit', 'code', 'index', 'click', 'iced', 'deck', 'kind', 'dice',
  'icon', 'cited', 'link', 'edge', 'kinetic', 'dev', 'icing', 'device',
  'check', 'kick', 'dock', 'decide', 'dedicate', 'circle', 'did', 'engine',
  'client', 'king', 'coding', 'cookie',
];

const INDEX_WORDS = [
  'run', 'git', 'graph', 'hard', 'burn', 'unit', 'night', 'bright',
  'hunt', 'fruit', 'thumb', 'turn', 'might', 'bring', 'thin', 'truth',
  'rough', 'guard', 'front', 'hymn', 'fight', 'rhythm', 'habit', 'right',
  'mount', 'thought', 'brought', 'vibrant', 'number',
];

// Left hand: q,a,z,w,s,x,e,d,c,r,t,f,g,v,b (+1 miss), ~20 per length
const LEFT_HAND_WORDS = [
  // 4 chars
  'able', 'area', 'back', 'bare', 'base', 'bath', 'bear', 'beat',
  'best', 'bird', 'care', 'cast', 'crew', 'dare', 'data', 'debt',
  'edge', 'face', 'fact', 'free',
  // 5 chars
  'above', 'after', 'agree', 'arena', 'aside', 'basic', 'batch', 'beast',
  'blade', 'brand', 'brave', 'bread', 'breed', 'craft', 'draft', 'eager',
  'feast', 'grade', 'great', 'trace',
  // 6 chars
  'absent', 'accept', 'access', 'advent', 'affair', 'afford', 'artist',
  'assert', 'attach', 'basket', 'battle', 'before', 'beside', 'better',
  'bitter', 'breeze', 'bridge', 'buffer', 'career', 'desert',
  // 7 chars
  'address', 'advance', 'adverse', 'attract', 'average', 'barrier', 'battery',
  'because', 'besides', 'carrier', 'charter', 'correct', 'darkest', 'disease',
  'diverse', 'earnest', 'eastern', 'essence', 'western', 'welfare',
  // 8 chars
  'abstract', 'accurate', 'advanced', 'advocate', 'coverage', 'creative',
  'creature', 'database', 'decrease', 'dedicate', 'delegate', 'detector',
  'disaster', 'discrete', 'exercise', 'expected', 'extended', 'featured',
  'feedback', 'generate',
  // 9 chars
  'advantage', 'advertise', 'attracted', 'breakfast', 'broadcast', 'celebrate',
  'character', 'dedicated', 'desperate', 'devastate', 'extracted', 'graduated',
  'reference', 'reflected', 'refreshed', 'restarted', 'scattered', 'secretary',
  'suggested', 'traversed',
  // 10 chars
  'abstracted', 'accelerate', 'afterwards', 'attractive', 'degenerate',
  'desecrated', 'devastated', 'exaggerate', 'segregated', 'statecraft',
  'stewardess', 'tradecraft', 'vertebrate', 'watercraft', 'watercress',
];

// Right hand: y,u,h,j,n,m,i,k,o,l,p (+1 miss), ~20 per length
const RIGHT_HAND_WORDS = [
  // 4 chars
  'bill', 'book', 'bulk', 'chip', 'clip', 'coin', 'cook', 'cool',
  'copy', 'doll', 'dull', 'dump', 'film', 'flip', 'folk', 'fool',
  'full', 'hill', 'holy', 'hook',
  // 5 chars
  'apply', 'chunk', 'enjoy', 'fully', 'funny', 'happy', 'honey', 'honor',
  'human', 'humor', 'imply', 'input', 'irony', 'joint', 'juicy', 'knock',
  'known', 'lemon', 'limit', 'youth',
  // 6 chars
  'column', 'common', 'hollow', 'junior', 'kimono', 'mainly',
  'monkey', 'motion', 'notion', 'online', 'option', 'pillow', 'poison',
  'policy', 'polish', 'simply', 'supply', 'unholy', 'uphill', 'violin',
  // 7 chars
  'billion', 'happily', 'homonym', 'killjoy', 'lookout', 'million', 'minimal',
  'minimum', 'monthly', 'moonlit', 'nominal', 'opinion', 'outlook', 'polling',
  'pumpkin', 'unknown',
  // 8 chars
  'aluminum', 'bouillon', 'chipmunk', 'dominion', 'humility', 'illusion',
  'lollipop', 'monopoly', 'multiply', 'nihilism', 'populism', 'unlikely',
  // 9 chars
  'communion', 'hillbilly', 'hollyhock', 'oligopoly', 'pollution', 'polyphony',
  // 10 chars
  'homophonic', 'philosophy',
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
const NUM_SYMBOL_CHARS = [...NUMBER_CHARS, ...SYMBOL_CHARS];

// Generate random chunks from character set (for numbers/symbols)
function buildChunks(chars, length) {
  const result = [];
  let totalLen = 0;
  while (totalLen < length) {
    const chunkLen = 3 + Math.floor(Math.random() * 5);
    let chunk = '';
    for (let i = 0; i < chunkLen; i++) {
      chunk += chars[Math.floor(Math.random() * chars.length)];
    }
    result.push(chunk);
    totalLen += chunk.length + 1;
  }
  return result.join(' ');
}

// Generate practice text from a word list
function buildTextFromWords(words, length) {
  if (words.length === 0) return '';
  const result = [];
  let totalLen = 0;
  while (totalLen < length) {
    const word = words[Math.floor(Math.random() * words.length)];
    result.push(word);
    totalLen += word.length + 1;
  }
  return result.join(' ');
}

export const PRESETS = {
  'right-hand':  { name: 'Right Hand',        keys: () => charsForHand('right'),    words: RIGHT_HAND_WORDS },
  'left-hand':   { name: 'Left Hand',         keys: () => charsForHand('left'),     words: LEFT_HAND_WORDS },
  'num-symbols': { name: 'Numbers & Symbols', keys: () => NUM_SYMBOL_CHARS,         words: null },
  'pinky':       { name: 'Pinky',             keys: () => [...charsForFinger(FINGERS.L_PINKY), ...charsForFinger(FINGERS.R_PINKY)], words: PINKY_WORDS },
  'ring':        { name: 'Ring',              keys: () => [...charsForFinger(FINGERS.L_RING), ...charsForFinger(FINGERS.R_RING)],   words: RING_WORDS },
  'middle':      { name: 'Middle',            keys: () => [...charsForFinger(FINGERS.L_MIDDLE), ...charsForFinger(FINGERS.R_MIDDLE)], words: MIDDLE_WORDS },
  'index':       { name: 'Index',             keys: () => [...charsForFinger(FINGERS.L_INDEX), ...charsForFinger(FINGERS.R_INDEX)], words: INDEX_WORDS },
};

export function generatePracticeText(keys, length = 200, words = null) {
  if (keys.length === 0) return '';
  if (words && words.length > 0) return buildTextFromWords(words, length);
  return buildChunks(keys, length);
}
