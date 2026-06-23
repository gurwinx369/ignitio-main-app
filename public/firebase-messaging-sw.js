// public/firebase-messaging-sw.js
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js",
);

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyDIEt3oa0WdFy5YQyTC-Uf-cgTSHCIGVPc",
  authDomain: "ignitio-7e45a.firebaseapp.com",
  projectId: "ignitio-7e45a",
  storageBucket: "ignitio-7e45a.firebasestorage.app",
  messagingSenderId: "309371567173",
  appId: "1:309371567173:web:543ba289b46646bc86772c",
  measurementId: "G-3FWXQWYZRC",
});

// Retrieve an instance of Firebase Messaging so the SDK intercepts push events.
const messaging = firebase.messaging();

// Handle background messages (app in background or closed).
// All notification fields come from payload.data because we send data-only FCM messages.
// This is required for cross-platform reliability — mobile Chrome silently drops
// notification-type messages without invoking this handler at all.
messaging.onBackgroundMessage((payload) => {
  const data = payload.data || {};

  const title = data?.title || "New Notification";
  const options = {
    body: data?.body || "",
    icon: data?.icon || "/ignitio-logo.png",
    badge: data?.badge || "/ignitio-logo.png",
    tag: data?.tag || "ignitio-notification",
    // Store the full data object so notificationclick can use it
    data: {
      url: data?.url || "/",
      ...data,
    },
    requireInteraction: data?.requireInteraction === "true",
    vibrate: [200, 100, 200],
  };

  return self.registration.showNotification(title, options);
});

// Handle notification click — navigate to the URL stored in notification data
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Focus an already-open tab at the target URL if one exists
        for (const client of clientList) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        // Otherwise open a new tab
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      }),
  );
});
