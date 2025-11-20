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

