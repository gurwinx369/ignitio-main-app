'use client';

import { useEffect } from 'react';
import { useAuth } from '@/features/context/AuthContext';

export default function TimezoneSync() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const syncTimezone = async () => {
      try {
        const resolvedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (!resolvedTimezone) return;

        const cacheKey = `ignitio:timezone-sync:${user.uid}`;
        const cachedData = localStorage.getItem(cacheKey);

        if (cachedData) {
          try {
            const parsed = JSON.parse(cachedData);
            const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
            const now = Date.now();
            // Skip if same timezone and synced less than 7 days ago
            if (parsed.timezone === resolvedTimezone && (now - parsed.syncedAt) < SEVEN_DAYS_MS) {
              return;
            }
          } catch (e) {
            // Ignore parse errors, just re-sync
          }
        }

        const token = await user.getIdToken();
        const response = await fetch('/api/v2/user/timezone', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ timezone: resolvedTimezone })
        });

        if (response.ok) {
          localStorage.setItem(cacheKey, JSON.stringify({
            timezone: resolvedTimezone,
            syncedAt: Date.now()
          }));
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Timezone sync failed:", error);
        }
      }
    };

    syncTimezone();
  }, [user]);

  return null;
}
