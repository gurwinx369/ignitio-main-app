'use client'

import { useEffect, useState } from 'react'
import { StreakAnticipation } from '@/components/streak/streak-anticipation'
import { StreakSparked } from '@/components/streak-sparked/streak-sparked'
import { NotificationAsk } from '@/components/streak-sparked/notification-ask'

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
  // ponytail: 'anticipated' default — no flicker since we check on mount
  const [phase, setPhase] = useState('anticipated')
  const [lessonHref, setLessonHref] = useState('/home')
  // 'notification' shown once after first lesson, then 'celebration'
  const [view, setView] = useState('celebration')

  useEffect(() => {
    try {
      const sparked = localStorage.getItem('ignitio:streak_phase') === 'sparked'
      if (sparked) {
        setPhase('sparked')
        setView(hasAskedNotification() ? 'celebration' : 'notification')
      }
      setLessonHref(getLessonHref())
    } catch {
      // localStorage unavailable — stay on anticipated
    }
  }, [])

  const handleNotificationResponse = (allowed) => {
    if (allowed && typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission().catch(() => {})
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
