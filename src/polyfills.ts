/**
 * Polyfills para compatibilidad del navegador con Node.js
 * Necesario para que @cavos/aegis funcione en el navegador
 */

// Polyfill para process
if (typeof window !== 'undefined' && typeof process === 'undefined') {
  (window as any).process = {
    env: {
      NODE_ENV: import.meta.env.MODE || 'development',
    },
    version: 'v18.0.0', // Versión simulada de Node.js
    platform: 'browser',
    nextTick: (callback: () => void) => {
      setTimeout(callback, 0);
    },
  };
}

// Polyfill para global
if (typeof window !== 'undefined' && typeof global === 'undefined') {
  (window as any).global = window;
}

// Polyfill para Buffer si es necesario
if (typeof window !== 'undefined' && typeof Buffer === 'undefined') {
  // Buffer polyfill básico - solo si es necesario
  (window as any).Buffer = {
    from: (data: any) => new Uint8Array(data),
    isBuffer: (obj: any) => obj instanceof Uint8Array,
  };
}

export {};