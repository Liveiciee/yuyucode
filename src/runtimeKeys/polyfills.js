const BufferCtor = globalThis.Buffer;

if (typeof globalThis.TextEncoder !== 'function' && BufferCtor) {
  globalThis.TextEncoder = class TextEncoderPolyfill {
    encode(value = '') {
      return new Uint8Array(BufferCtor.from(String(value), 'utf8'));
    }
  };
}

if (typeof globalThis.TextDecoder !== 'function' && BufferCtor) {
  globalThis.TextDecoder = class TextDecoderPolyfill {
    decode(value = new Uint8Array()) {
      return BufferCtor.from(value).toString('utf8');
    }
  };
}

function fallbackEncodeUtf8(value) {
  if (BufferCtor) {
    return new Uint8Array(BufferCtor.from(String(value), 'utf8'));
  }
  const encoded = encodeURIComponent(String(value));
  const bytes = [];
  for (let i = 0; i < encoded.length; i++) {
    const ch = encoded[i];
    if (ch === '%') {
      bytes.push(parseInt(encoded.slice(i + 1, i + 3), 16));
      i += 2;
    } else {
      bytes.push(ch.charCodeAt(0));
    }
  }
  return new Uint8Array(bytes);
}

function fallbackDecodeUtf8(value) {
  if (BufferCtor) {
    return BufferCtor.from(value).toString('utf8');
  }
  return Array.from(value, b => String.fromCharCode(b)).join('');
}

export const textEncoder = typeof globalThis.TextEncoder === 'function'
  ? new globalThis.TextEncoder()
  : { encode: fallbackEncodeUtf8 };

export const textDecoder = typeof globalThis.TextDecoder === 'function'
  ? new globalThis.TextDecoder()
  : { decode: fallbackDecodeUtf8 };

export { BufferCtor };
