if ('serviceWorker' in navigator) {
  var isSecure =
    location.protocol === 'https:' ||
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1';
  if (isSecure) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function (error) {
        console.warn('Service worker registration failed:', error);
      });
    });
  }
}
