// Retire the former fseview app worker. Keep this URL for existing installations.
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('opexa-fseview-shell-'))await caches.delete(key);await self.clients.claim();await self.registration.unregister();})()));
