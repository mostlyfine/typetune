// @vitest-environment jsdom
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventBus } from '../../src/core/event-bus.js';
import { SettingsPanel } from '../../src/ui/settings-panel.js';

describe('SettingsPanel', () => {
  let bus, container, mockTextProvider, mockEngine, mockSound;

  beforeEach(() => {
    document.body.innerHTML = '';
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    bus = new EventBus();
    container = document.createElement('div');
    document.body.appendChild(container);

    mockTextProvider = {
      loadFromLanguage: vi.fn().mockResolvedValue(undefined),
      loadFromFile: vi.fn().mockResolvedValue(undefined),
      loadText: vi.fn(),
    };
    mockEngine = {
      setMode: vi.fn(),
      start: vi.fn(),
    };
    mockSound = {
      toggle: vi.fn(),
      get enabled() { return this._enabled !== false; },
      _enabled: true,
    };

    new SettingsPanel(bus, container, mockTextProvider, mockEngine, mockSound);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('renders settings UI elements', () => {
    expect(container.querySelector('#sp-toggle')).not.toBeNull();
    expect(container.querySelector('#sp-language')).not.toBeNull();
    expect(container.querySelector('#sp-fetch')).not.toBeNull();
    expect(container.querySelector('#sp-mode')).not.toBeNull();
    expect(container.querySelector('#sp-preset')).not.toBeNull();
    expect(container.querySelector('#sp-keymap-file')).not.toBeNull();
  });

  test('toggle button collapses/expands settings bar', () => {
    const toggle = container.querySelector('#sp-toggle');
    const bar = container.querySelector('.sp-bar');
    toggle.click();
    expect(bar.classList.contains('sp-collapsed')).toBe(true);
    toggle.click();
    expect(bar.classList.contains('sp-collapsed')).toBe(false);
  });

  test('typing:start event collapses settings', () => {
    bus.emit('typing:start', {});
    const bar = container.querySelector('.sp-bar');
    expect(bar.classList.contains('sp-collapsed')).toBe(true);
  });

  test('sound button toggles sound', () => {
    const soundBtn = container.querySelector('#sp-sound');
    soundBtn.click();
    expect(mockSound.toggle).toHaveBeenCalled();
  });

  test('mode selection shows/hides value input', () => {
    const mode = container.querySelector('#sp-mode');
    const valueInput = container.querySelector('#sp-mode-value');
    const unit = container.querySelector('#sp-mode-unit');

    mode.value = 'time-custom';
    mode.dispatchEvent(new Event('change'));
    expect(valueInput.hidden).toBe(false);
    expect(unit.textContent).toBe('sec');

    mode.value = 'chars';
    mode.dispatchEvent(new Event('change'));
    expect(valueInput.hidden).toBe(false);
    expect(unit.textContent).toBe('chars');

    mode.value = 'free';
    mode.dispatchEvent(new Event('change'));
    expect(valueInput.hidden).toBe(true);
  });

  test('preset selection generates practice text', () => {
    const preset = container.querySelector('#sp-preset');
    preset.value = 'right-hand';
    preset.dispatchEvent(new Event('change'));
    expect(mockTextProvider.loadText).toHaveBeenCalled();
    expect(mockEngine.start).toHaveBeenCalled();
  });

  test('keymap reset emits layout:changed with null', () => {
    const spy = vi.fn();
    bus.on('layout:changed', spy);
    container.querySelector('#sp-keymap-reset').click();
    expect(spy).toHaveBeenCalledWith({ layout: null });
  });

  test('fetch button calls loadFromLanguage', async () => {
    const fetchBtn = container.querySelector('#sp-fetch');
    fetchBtn.click();
    // Wait for async
    await vi.waitFor(() => {
      expect(mockTextProvider.loadFromLanguage).toHaveBeenCalled();
    });
  });

  test('mobile viewport starts collapsed', () => {
    // Reset and recreate with mobile matchMedia
    document.body.innerHTML = '';
    const mobileContainer = document.createElement('div');
    document.body.appendChild(mobileContainer);
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    const mobileBus = new EventBus();
    new SettingsPanel(mobileBus, mobileContainer, mockTextProvider, mockEngine, mockSound);
    const bar = mobileContainer.querySelector('.sp-bar');
    expect(bar.classList.contains('sp-collapsed')).toBe(true);
  });

  test('theme button toggles theme', () => {
    const themeBtn = container.querySelector('#sp-theme');
    themeBtn.click();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    themeBtn.click();
    expect(document.documentElement.getAttribute('data-theme')).toBe('');
  });
});
