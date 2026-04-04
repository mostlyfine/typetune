import { KEY_TO_FINGER, FINGERS } from './key-finger-map.js';
import { ZMK_KEY_MAP } from './key-labels.js';

// Finger-pair word lists: 4-10 chars, max 1 char outside the finger's keys
// Words selected for: commonality, balanced key coverage, length variety

// Pinky: q, a, z, p — very limited alphabet
const PINKY_WORDS = [
  'aqua', 'jazz', 'papa', 'razz', 'pupa', 'napa',
  'pizza', 'plaza', 'papal', 'pappy', 'poppa', 'kappa',
  'papaya', 'piazza',
];

// Ring: w, s, x, o, l — x is rare; oxbow covers it
const RING_WORDS = [
  // 4 chars (w,s,o,l well covered)
  'also', 'blow', 'boss', 'bowl', 'cool', 'doll', 'flow', 'fool',
  'glow', 'less', 'look', 'loop', 'loss', 'lost', 'moss', 'poll',
  'pool', 'roll', 'slow', 'snow',
  // 5 chars (x via oxbow)
  'allow', 'bowls', 'floss', 'gloss', 'loose', 'lowly', 'oxbow', 'scowl',
  'sloop', 'slosh', 'shows', 'spool', 'stool', 'swell', 'swill', 'swoon',
  'tolls', 'tools', 'walls', 'wells',
  // 6 chars
  'follow', 'hollow', 'lollop', 'powwow', 'sallow', 'slowly', 'swoosh',
  'wallow', 'willow', 'woolly',
  // 7 chars
  'swallow',
];

// Middle: e, d, c, i, k — k is rarest; kick/deck/pick cover it
const MIDDLE_WORDS = [
  // 4 chars (all keys well covered)
  'bike', 'cake', 'code', 'dead', 'deck', 'deed', 'deep', 'deer',
  'desk', 'dice', 'dike', 'dime', 'dine', 'disc', 'dock', 'duck',
  'duke', 'edge', 'kick', 'kind',
  // 5 chars (k via check/click/cheek)
  'added', 'check', 'cheek', 'chick', 'chide', 'cider', 'civic', 'click',
  'creed', 'creek', 'diced', 'dried', 'edict', 'kneed', 'liked', 'niece',
  'piece', 'sided', 'skied', 'tided',
  // 6 chars (k via kicked/picked/decked/necked)
  'accede', 'acidic', 'decade', 'deceit', 'decide', 'decked', 'decode',
  'decree', 'deduce', 'device', 'exceed', 'indeed', 'kicked', 'necked',
  'picked', 'recede', 'secede', 'wicked',
  // 7 chars
  'checked', 'decided', 'deceive', 'decried', 'divided', 'edifice',
];

// Index: r, t, f, g, v, b, y, u, h, j, n, m — j,v are rarest
const INDEX_WORDS = [
  // 4 chars (j via jump/jury/just, v via vary/verb/navy/envy)
  'army', 'baby', 'bang', 'barn', 'bath', 'bomb', 'burn', 'bury',
  'envy', 'from', 'fury', 'gang', 'gift', 'high', 'hung', 'hurt',
  'hymn', 'jump', 'jury', 'myth',
  // 5 chars (j via jumpy/joint, v via gravy)
  'birth', 'bring', 'brunt', 'brush', 'bunch', 'buyer', 'entry', 'fifty',
  'fight', 'forum', 'fruit', 'funny', 'gravy', 'grunt', 'hurry', 'jumpy',
  'might', 'month', 'rugby', 'thumb',
  // 6 chars (j via jaunty→7, v via virtue→6 no... v via vanity? v,a,n,i,t,y - a miss, i miss = 2. Invalid)
  'autumn', 'bounty', 'bright', 'buffer', 'butter', 'fluffy', 'fourth',
  'fright', 'gritty', 'hungry', 'hunter', 'jaunty', 'mighty', 'mutiny',
  'number', 'return', 'rhythm', 'rubber', 'thorny', 'thrust',
  // 7 chars (j via juryman, v via viburnum→8)
  'brought', 'bunting', 'burnout', 'burning', 'buttery', 'further',
  'gruffly', 'humming', 'hunting', 'naughty', 'running', 'thrifty',
  'thought', 'through', 'turnout', 'turning',
  // 8 chars
  'burgundy', 'sunburnt', 'truthful',
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
