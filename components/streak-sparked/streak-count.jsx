'use client'

import { AnimatePresence, motion } from 'motion/react'
import { Coffee, Sparkles, Zap } from 'lucide-react'

const REWARDS = [
  { icon: Zap, label: '+10 XP', accent: 'text-[#FFC83D]' },
  { icon: Coffee, label: 'Cup #1 brewed', accent: 'text-brew' },
  { icon: Sparkles, label: 'Streak started', accent: 'text-kibo' },
]

export function StreakCount({ value = 0, showRewards = false }) {
  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, y: 24, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.35 }}
    >
      <div className="relative flex h-[clamp(68px,11dvh,104px)] items-center justify-center">
        {value === 1 && (
          <motion.span
            aria-hidden="true"
            className="absolute size-[160%] rounded-full bg-[radial-gradient(circle,rgba(255,200,61,0.35)_0%,rgba(255,200,61,0)_65%)]"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: [0.3, 1.4, 1], opacity: [0, 1, 0.5] }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        )}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            className={
              value === 1
                ? 'relative bg-gradient-to-b from-white via-[#C8FCFF] to-kibo bg-clip-text font-display text-[clamp(72px,12dvh,112px)] font-bold leading-none text-transparent'
                : 'relative font-display text-[clamp(72px,12dvh,112px)] font-bold leading-none text-muted-ink/40'
            }
            style={value === 1 ? { filter: 'drop-shadow(0 0 22px rgba(25,198,255,0.65))' } : undefined}
            initial={{ y: 70, opacity: 0, scale: 0.4, rotate: -12 }}
            animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
            exit={{ y: -70, opacity: 0, scale: 0.6 }}
            transition={{ type: 'spring', stiffness: 420, damping: 14 }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>

      <h1 className="font-display text-2xl font-bold leading-tight text-ink md:text-3xl">
        <span className="sr-only">{value}</span>
        {' day streak'}
        <AnimatePresence>
          {value === 1 && (
            <motion.span
              className="inline-block text-brew"
              initial={{ opacity: 0, scale: 0, rotate: -30 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 12, delay: 0.1 }}
            >
              !
            </motion.span>
          )}
        </AnimatePresence>
      </h1>

      <ul className="mt-3 flex flex-wrap items-center justify-center gap-2" aria-label="Rewards earned">
        {REWARDS.map((r, i) => (
          <motion.li
            key={r.label}
            className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs font-extrabold text-ink md:text-sm"
            initial={{ opacity: 0, y: 12, scale: 0.6 }}
            animate={showRewards ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 12, scale: 0.6 }}
            transition={{ type: 'spring', stiffness: 420, damping: 18, delay: showRewards ? i * 0.12 : 0 }}
          >
            <r.icon className={`size-3.5 ${r.accent} ${r.icon === Zap ? 'fill-current' : ''}`} aria-hidden="true" />
            {r.label}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  )
}
