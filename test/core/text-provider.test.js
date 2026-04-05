// @vitest-environment jsdom
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { TextProvider } from '../../src/core/text-provider.js';
import { EventBus } from '../../src/core/event-bus.js';

describe('TextProvider', () => {
  let bus, provider;

  beforeEach(() => {
    bus = new EventBus();
    provider = new TextProvider(bus);
  });

  test('loadText() emits text:loaded with text and source', () => {
    const spy = vi.fn();
    bus.on('text:loaded', spy);
    provider.loadText('hello world', 'test');
    expect(spy).toHaveBeenCalledWith({
      text: 'hello world',
      language: 'preset',
      source: 'test',
    });
  });

  test('loadText() uses default source', () => {
    const spy = vi.fn();
    bus.on('text:loaded', spy);
    provider.loadText('hello');
    expect(spy.mock.calls[0][0].source).toBe('preset');
  });

  test('loadFromFile() reads file via FileReader and emits text:loaded', async () => {
    const spy = vi.fn();
    bus.on('text:loaded', spy);

    const file = new File(['function test() { return 1; }'], 'test.js', { type: 'text/plain' });
    await provider.loadFromFile(file);

    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls[0][0].source).toBe('test.js');
    expect(spy.mock.calls[0][0].language).toBe('javascript');
  });

  test('loadFromLanguage() fetches and processes text', async () => {
    const mockCode = `import foo from 'bar';
// comment
function hello() {
  return "world";
}`;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(mockCode),
    }));

    const spy = vi.fn();
    bus.on('text:loaded', spy);
    await provider.loadFromLanguage('javascript');

    expect(spy).toHaveBeenCalled();
    const loaded = spy.mock.calls[0][0];
    expect(loaded.language).toBe('javascript');
    expect(loaded.text).not.toContain('import');
    expect(loaded.text).toContain('function hello()');
  });

  test('loadFromLanguage() tries next candidate on fetch failure', async () => {
    let callCount = 0;
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.reject(new Error('fail'));
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve('function test() { return 1; }'),
      });
    }));

    const spy = vi.fn();
    bus.on('text:loaded', spy);
    await provider.loadFromLanguage('javascript');
    expect(spy).toHaveBeenCalled();
    expect(callCount).toBeGreaterThanOrEqual(2);
  });

  test('loadFromLanguage() throws when all candidates fail', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('fail')));
    await expect(provider.loadFromLanguage('javascript'))
      .rejects.toThrow('All sources failed');
  });

  test('processText strips comments and imports', async () => {
    const code = `/* block comment */
import { foo } from 'bar';
// line comment
function greet() {
  return "hello";
}`;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(code),
    }));

    const spy = vi.fn();
    bus.on('text:loaded', spy);
    await provider.loadFromLanguage('javascript');

    const text = spy.mock.calls[0][0].text;
    expect(text).not.toContain('block comment');
    expect(text).not.toContain('import');
    expect(text).not.toContain('line comment');
  });

  test('processText normalizes tabs to spaces', async () => {
    const code = "function test() {\n\treturn 1;\n}";
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(code),
    }));

    const spy = vi.fn();
    bus.on('text:loaded', spy);
    await provider.loadFromLanguage('javascript');

    const text = spy.mock.calls[0][0].text;
    expect(text).not.toContain('\t');
  });

  test('processText extracts function blocks', async () => {
    const code = `
const x = 1;
function foo() {
  return x;
}
const y = 2;
function bar() {
  return y;
}`;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(code),
    }));

    const spy = vi.fn();
    bus.on('text:loaded', spy);
    await provider.loadFromLanguage('javascript');

    const text = spy.mock.calls[0][0].text;
    expect(text).toContain('function foo()');
    expect(text).toContain('function bar()');
  });

  test('processText handles Python-style indent blocks', async () => {
    const code = `
def hello():
    return "world"

def goodbye():
    return "bye"
`;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(code),
    }));

    const spy = vi.fn();
    bus.on('text:loaded', spy);
    await provider.loadFromLanguage('python');

    const text = spy.mock.calls[0][0].text;
    expect(text).toContain('def hello()');
  });

  test('guessLanguage maps file extensions correctly', async () => {
    const spy = vi.fn();
    bus.on('text:loaded', spy);

    const tests = [
      ['test.js', 'javascript'],
      ['test.ts', 'typescript'],
      ['test.py', 'python'],
      ['test.go', 'go'],
      ['test.rs', 'rust'],
      ['test.rb', 'ruby'],
    ];

    for (const [filename, expected] of tests) {
      const file = new File(['x = 1'], filename, { type: 'text/plain' });
      await provider.loadFromFile(file);
      const lastCall = spy.mock.calls[spy.mock.calls.length - 1][0];
      expect(lastCall.language).toBe(expected);
    }
  });

  test('loadFromLanguage() throws for unknown language', async () => {
    await expect(provider.loadFromLanguage('unknown'))
      .rejects.toThrow('No repos for language');
  });

  test('processText strips various language imports', async () => {
    const code = `package main
import "fmt"
from os import path
use std::collections::HashMap;
require 'json'
using System;
extern crate serde;

func main() {
  fmt.Println("hello")
}`;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(code),
    }));

    const spy = vi.fn();
    bus.on('text:loaded', spy);
    await provider.loadFromLanguage('go');

    const text = spy.mock.calls[0][0].text;
    expect(text).not.toContain('package main');
    expect(text).not.toContain('import "fmt"');
    expect(text).toContain('func main()');
  });
});
