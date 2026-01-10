// Runtime configuration helper
// This file provides access to environment variables injected at runtime via config.js

interface RuntimeConfig {
  VITE_API_BASE_URL: string;
  VITE_API_SSE_BASE_URL: string;
}

declare global {
  interface Window {
    ENV?: RuntimeConfig;
  }
}

/**
 * Get runtime environment variable
 * Falls back to import.meta.env for development
 */
export function getEnv(key: keyof RuntimeConfig): string {
  // Try runtime config first (production)
  if (window.ENV && window.ENV[key]) {
    return window.ENV[key];
  }
  
  // Fall back to build-time env (development)
  const buildTimeValue = import.meta.env[key];
  if (buildTimeValue) {
    return buildTimeValue;
  }
  
  // Default values for development
  const defaults: RuntimeConfig = {
    VITE_API_BASE_URL: 'http://localhost:8088/api',
    VITE_API_SSE_BASE_URL: 'http://localhost:8088/api',
  };
  
  return defaults[key] || '';
}

export default {
  get API_BASE_URL() {
    return getEnv('VITE_API_BASE_URL');
  },
  get API_SSE_BASE_URL() {
    return getEnv('VITE_API_SSE_BASE_URL');
  },
};
