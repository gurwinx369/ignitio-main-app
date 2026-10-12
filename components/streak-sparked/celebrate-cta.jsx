'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, CalendarCheck, CalendarPlus } from 'lucide-react'

// ponytail: inline map, 2 skills max — no need for a config file
const ROADMAP_ROUTES = {
  git: '/home/roadmaps/git-github',
  python: '/home/roadmaps/python-beginner',
}

function getRoadmapHref() {
  try {
    const result = JSON.parse(localStorage.getItem('ignitio:onboarding_result') ?? 'null')
    const firstSkill = result?.roadmap?.[0]
    return ROADMAP_ROUTES[firstSkill] ?? '/home'
  } catch {
    return '/home'
  }
}

export function CelebrateCta({ visible }) {
  const router = useRouter()
  const [committed, setCommitted] = useState(false)

  return (
    <motion.div
      className="flex w-full flex-col items-center gap-2.5"
      initial={{ opacity: 0, y: 30 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <button
        type="button"
        onClick={() => router.push(getRoadmapHref())}
        className="group relative flex h-14 w-full max-w-md items-center justify-center gap-3 overflow-hidden rounded-2xl bg-brew font-display text-lg font-bold uppercase tracking-wide text-[#04121F] shadow-[0_4px_0_0_var(--brew-deep)] transition-[transform,box-shadow] duration-100 hover:brightness-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brew/40 active:translate-y-[4px] active:shadow-[0_0_0_0_var(--brew-deep)]"
      >
        <span aria-hidden="true" className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 animate-shine bg-white/35" />
        <span className="relative">Continue</span>
        <ArrowRight className="relative size-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </button>

      <button
        type="button"
        aria-pressed={committed}
        onClick={() => setCommitted((c) => !c)}
        className="flex h-11 w-full max-w-md items-center justify-center gap-2 rounded-2xl border-2 border-line text-sm font-extrabold text-muted-ink transition-colors hover:border-line-strong hover:text-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brew/40 aria-pressed:border-brew/60 aria-pressed:bg-brew/10 aria-pressed:text-brew"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={committed ? 'yes' : 'no'}
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 420, damping: 24 }}
          >
            {committed ? (
              <>
                <CalendarCheck className="size-4" aria-hidden="true" />
                {"Committed. See you tomorrow for cup #2!"}
              </>
            ) : (
              <>
                <CalendarPlus className="size-4" aria-hidden="true" />
                {"I'll be back tomorrow"}
              </>
            )}
          </motion.span>
        </AnimatePresence>
      </button>
    </motion.div>
  )
}

