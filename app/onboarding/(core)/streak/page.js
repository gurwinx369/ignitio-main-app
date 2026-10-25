'use client'

import { useEffect, useState } from 'react'
import { StreakAnticipation } from '@/components/streak/streak-anticipation'
import { StreakSparked } from '@/components/streak-sparked/streak-sparked'
import { NotificationAsk } from '@/components/streak-sparked/notification-ask'

import { requestNotificationPermission } from '@/lib/firebase/firebase-messaging';
import { auth } from '@/lib/firebase/firebase';
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics/events';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// ponytail: same map as celebrate-cta.jsx — skills routing for streak start
const LESSON_ROUTES = {
  git: '/home/roadmaps/git-github/interactive-overviews/first-overview',
  python: '/home/roadmaps/python-beginner',
  dsa: '/home/roadmaps/dsa',
}

function getDays() {
  const today = new Date().getDay()
  return Array.from({ length: 7 }, (_, i) => DAY_LABELS[(today + i) % 7])
}

function getLessonHref() {
  try {
    // Primary: written by FreeOnboarding before auth — survives sync clearing onboarding_result
    const direct = localStorage.getItem('ignitio:streak_lesson_href')
    if (direct) return direct
    // Fallback: already-authenticated users who never went through signup
    const result = JSON.parse(localStorage.getItem('ignitio:onboarding_result') ?? 'null')
    const firstSkill = result?.goal === 'dsa' ? 'dsa' : (result?.roadmap?.[0] || 'python')
    return LESSON_ROUTES[firstSkill] ?? (result?.goal === 'dsa' ? '/home/roadmaps/dsa' : '/home/roadmaps/python-beginner')
  } catch {
    return '/home/roadmaps/python-beginner'
  }
}

// ponytail: single flag — no need for a full permission-state machine here
function hasAskedNotification() {
  try {
    return localStorage.getItem('ignitio:notification_asked') === '1'
  } catch {
    return true // if storage fails, skip the ask
  }
}

function markNotificationAsked() {
  try {
    localStorage.setItem('ignitio:notification_asked', '1')
  } catch {}
}

export default function StreakPage() {
  const [phase, setPhase] = useState(() => {
    if (typeof window === 'undefined') return 'anticipated';
    try {
      return localStorage.getItem('ignitio:streak_phase') === 'sparked' ? 'sparked' : 'anticipated';
    } catch {
      return 'anticipated';
    }
  });

  const [view, setView] = useState(() => {
    if (typeof window === 'undefined') return 'celebration';
    try {
      const sparked = localStorage.getItem('ignitio:streak_phase') === 'sparked';
      if (sparked) {
        return hasAskedNotification() ? 'celebration' : 'notification';
      }
      return 'celebration';
    } catch {
      return 'celebration';
    }
  });

  const [lessonHref, setLessonHref] = useState(() => {
    if (typeof window === 'undefined') return '/home';
    return getLessonHref();
  });

  const handleNotificationResponse = async (allowed) => {
    if (allowed) {
      trackEvent(ANALYTICS_EVENTS.NOTIFICATION_ACTIVATED, { source: 'onboarding_streak' });
    } else {
      trackEvent(ANALYTICS_EVENTS.NOTIFICATION_DECLINED, { source: 'onboarding_streak' });
    }

    if (allowed && typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const fcmToken = await requestNotificationPermission();
        if (fcmToken) {
          const idToken = auth.currentUser ? await auth.currentUser.getIdToken() : null;
          if (idToken) {
            fetch('/api/v1/notifications/save-token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${idToken}`,
              },
              body: JSON.stringify({ token: fcmToken, email: auth.currentUser.email }),
            }).catch(() => {});
          }
        }
      } catch (err) {
        // Fallback gracefully so onboarding navigation never freezes
      }
    }
    markNotificationAsked()
    setView('celebration')
  }

  const days = getDays()

  if (phase === 'sparked' && view === 'notification') {
    return (
      <NotificationAsk
        onAllow={() => handleNotificationResponse(true)}
        onSkip={() => handleNotificationResponse(false)}
      />
    )
  }

  if (phase === 'sparked') return <StreakSparked days={days} />
  return <StreakAnticipation days={days} lessonHref={lessonHref} />
}
