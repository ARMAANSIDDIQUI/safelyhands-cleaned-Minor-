// Service Worker Version: 1.0.1 (Bumpy update to fix cross-origin fetch issues)
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Skip interception for cross-origin requests (e.g. to backend.safelyhands.com)
    // Intercepting POST requests with bodies and re-fetching is unreliable in SWs.
    if (url.origin !== self.location.origin) {
        return;
    }

    // Handle same-origin requests normally
    event.respondWith(fetch(event.request));
});
