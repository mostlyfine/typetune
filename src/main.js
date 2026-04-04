import './style.css';
import { EventBus } from './core/event-bus.js';
import { TypingEngine } from './core/typing-engine.js';
import { TextProvider } from './core/text-provider.js';
import { Sound } from './core/sound.js';
import { TextDisplay } from './ui/text-display.js';
import { StatsDisplay } from './ui/stats-display.js';
import { Keyboard } from './ui/keyboard.js';
import { FingerGuide } from './ui/finger-guide.js';
import { SettingsPanel } from './ui/settings-panel.js';

const bus = new EventBus();

const engine = new TypingEngine(bus);
const textProvider = new TextProvider(bus);
const sound = new Sound(bus);
const textDisplay = new TextDisplay(bus, document.getElementById('text-display'));
const statsDisplay = new StatsDisplay(bus, document.getElementById('stats-display'));
const keyboard = new Keyboard(bus, document.getElementById('keyboard'));
const fingerGuide = new FingerGuide(bus, document.getElementById('finger-guide'));
const settingsPanel = new SettingsPanel(bus, document.getElementById('settings-panel'), textProvider, engine, sound);

// Load initial sample (already stripped of comments/indent)
const sampleText = `function fibonacci(n) {
  if (n <= 1) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}`;

bus.on('typing:retry', () => {
  bus.emit('text:loaded', { text: engine.text, source: 'retry' });
  engine.start();
});

bus.emit('text:loaded', { text: sampleText, language: 'javascript', source: 'sample' });
engine.start();
