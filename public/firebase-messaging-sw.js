// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
    apiKey: "AIzaSyDIEt3oa0WdFy5YQyTC-Uf-cgTSHCIGVPc",
    authDomain: "ignitio-7e45a.firebaseapp.com",
    projectId: "ignitio-7e45a",
    storageBucket: "ignitio-7e45a.firebasestorage.app",
    messagingSenderId: "309371567173",
    appId: "1:309371567173:web:543ba289b46646bc86772c",
    measurementId: "G-3FWXQWYZRC"
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('Background message received:', payload);

    const notificationTitle = payload.notification?.title || 'New Notification';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new message',
        icon: payload.notification?.icon || '/ignitio-logo.png',
        badge: '/ignitio-logo.png',
        tag: payload.data?.tag || 'default-tag',
        data: payload.data,
        requireInteraction: false,
        vibrate: [200, 100, 200]
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);

    event.notification.close();

    // Get the URL to open (from notification data or default)
    const urlToOpen = event.notification.data?.url || '/';

    // Open or focus the client
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if there's already a window open
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                // If no window is open, open a new one
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});
