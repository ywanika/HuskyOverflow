import 'whatwg-fetch';

// Polyfill for structuredClone (required by Chakra UI v3)
if (typeof globalThis.structuredClone === 'undefined') {
  globalThis.structuredClone = (obj: unknown) => {
    if (obj === undefined || obj === null) {
      return obj;
    }
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch {
      // Fallback for non-serializable objects
      return obj;
    }
  };
}

// Polyfill for TextEncoder/TextDecoder (required by Chakra UI v3 and react-router)
if (typeof globalThis.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  globalThis.TextEncoder = TextEncoder;
  globalThis.TextDecoder = TextDecoder;
}

// Suppress React act() warnings from @zag-js/react (used by Chakra UI v3)
// These warnings occur because zag-js triggers state updates that aren't wrapped in act()
// but they don't affect test correctness
const originalError = console.error;
console.error = (...args: unknown[]) => {
  // Check if this is an act() warning from zag-js
  const firstArg = args[0];
  if (typeof firstArg === 'string') {
    // Suppress act() warnings specifically from zag-js/TabsRoot
    if (
      firstArg.includes('not wrapped in act(...)') &&
      (firstArg.includes('TabsRoot') || firstArg.includes('@zag-js'))
    ) {
      return;
    }
  }
  // Pass through all other errors
  originalError.call(console, ...args);
};

