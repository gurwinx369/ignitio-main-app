'use client'

import { useEffect, useState } from 'react'
import { StreakAnticipation } from '@/components/streak/streak-anticipation'
import { StreakSparked } from '@/components/streak-sparked/streak-sparked'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// ponytail: same map as celebrate-cta.jsx — 2 skills, no config file needed
const LESSON_ROUTES = {
  git: '/home/roadmaps/git-github/interactive-overviews/first-overview',
  python: '/home/roadmaps/python-beginner',
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
    const firstSkill = result?.roadmap?.[0] || 'python'
    return LESSON_ROUTES[firstSkill] ?? '/home/roadmaps/python-beginner'
  } catch {
    return '/home/roadmaps/python-beginner'
  }
}


export default function StreakPage() {
  // ponytail: 'anticipated' default — no flicker since we check on mount
  const [phase, setPhase] = useState('anticipated')
  const [lessonHref, setLessonHref] = useState('/home')

  useEffect(() => {
    try {
      if (localStorage.getItem('ignitio:streak_phase') === 'sparked') {
        setPhase('sparked')
      }
      setLessonHref(getLessonHref())
    } catch {
      // localStorage unavailable — stay on anticipated
    }
  }, [])

  const days = getDays()

  if (phase === 'sparked') return <StreakSparked days={days} />
  return <StreakAnticipation days={days} lessonHref={lessonHref} />
}
