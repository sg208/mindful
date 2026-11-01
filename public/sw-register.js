// Registers the service worker on secure origins (HTTPS or local preview).
// Registration failure is non-fatal: the site works the same without it.
const isSecureOrigin =
  location.protocol === 'https:' ||
  location.hostname === 'localhost' ||
  location.hostname === '127.0.0.1';

const handleLoad = async () => {
  try {
    await navigator.serviceWorker.register('/sw.js');
  } catch {
    // Offline support is a progressive enhancement; nothing to recover.
  }
};

if ('serviceWorker' in navigator && isSecureOrigin) {
  window.addEventListener('load', handleLoad);
}
