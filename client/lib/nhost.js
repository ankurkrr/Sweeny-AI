// Utility to clear Nhost auth cache and last session
export function clearNhostAuthCache() {
  // Remove Nhost tokens and session from localStorage and sessionStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('nhost') || key.includes('auth')) {
      localStorage.removeItem(key);
    }
  });
  Object.keys(sessionStorage).forEach((key) => {
    if (key.startsWith('nhost') || key.includes('auth')) {
      sessionStorage.removeItem(key);
    }
  });
  // Optionally, remove all (uncomment next line if you want a full clear)
  // localStorage.clear(); sessionStorage.clear();
  console.log('Nhost auth cache and session cleared');
}

// Expose for dev use in browser console
if (typeof window !== 'undefined') {
  window.clearNhostAuthCache = clearNhostAuthCache;
}
import { NhostClient } from '@nhost/nhost-js';

export const nhost = new NhostClient({
  subdomain: 'rjobnorfovzdsfuialca',
  region: 'ap-south-1',
  clientTimeout: 30000, // Increase timeout to 30 seconds
  retries: 5, // Increase retries
});
