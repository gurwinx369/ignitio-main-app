'use client'

import { Fragment } from 'react'
import { motion } from 'motion/react'

function CupOutline() {
  return (
    <svg viewBox="0 0 40 54" className="h-full w-full" aria-hidden="true">
      <g
        fill="none"
        stroke="var(--line-strong)"
        strokeWidth="2.2"
        strokeDasharray="4 3.2"
        strokeLinejoin="round"
      >
        <path d="M11 3 h18 a3 3 0 0 1 3 3 v4 h-24 v-4 a3 3 0 0 1 3 -3 z" />
        <rect x="5" y="12" width="30" height="7" rx="3" />
        <path d="M8 21 h24 l-3 27 a3 3 0 0 1 -3 2.6 h-12 a3 3 0 0 1 -3 -2.6 z" />
      </g>
    </svg>
  )
}

export function WeekRow({ days = [], visible }) {
  return (
    <ol className="flex items-end justify-between" aria-label="Your streak this week">
      {days.map((day, i) => {
        const isToday = i === 0
        return (
          <Fragment key={day + i}>
            {i > 0 && (
              <motion.li
                aria-hidden="true"
                className="mb-[37px] h-0.5 min-w-2 flex-1 origin-left md:mb-[39px]"
                style={{
                  backgroundImage:
                    i === 1
                      ? 'linear-gradient(90deg, var(--brew) 0 50%, transparent 50% 100%)'
                      : 'linear-gradient(90deg, var(--line-strong) 0 50%, transparent 50% 100%)',
                  backgroundSize: '8px 2px',
                }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={visible ? { scaleX: 1, opacity: i === 1 ? 0.8 : 0.6 } : {}}
                transition={{ delay: 0.15 + i * 0.07, duration: 0.3 }}
              />
            )}
            <motion.li
              className="flex shrink-0 flex-col items-center gap-1.5"
              initial={{ opacity: 0, y: 16, scale: 0.6 }}
              animate={visible ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ type: 'spring', stiffness: 320, damping: 16, delay: i * 0.07 }}
            >
              <span
                className={
                  isToday
                    ? 'font-display text-xs font-bold text-brew md:text-sm'
                    : 'font-display text-xs font-semibold text-muted-ink/70 md:text-sm'
                }
              >
                {day}
              </span>
              <span className="relative block h-9 w-7 md:h-10 md:w-8">
                {isToday ? (
                  <>
                    <motion.span
                      aria-hidden="true"
                      className="absolute -inset-2 rounded-full border-2 border-brew/60"
                      animate={{ scale: [0.85, 1.35], opacity: [0.8, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                    />
                    <motion.img
                      src="/streak/streak_pending_or_skipped.png"
                      alt=""
                      className="relative h-full w-full object-contain"
                      style={{ filter: 'blur(0.8px) brightness(0.75) drop-shadow(0 0 8px rgba(28,155,255,0.55))' }}
                      animate={{ y: [0, -2, 0] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </>
                ) : (
                  <CupOutline />
                )}
              </span>
              <span
                className={
                  isToday
                    ? 'text-[10px] font-extrabold uppercase tracking-widest text-brew'
                    : 'text-[10px] font-extrabold uppercase tracking-widest text-transparent'
                }
              >
                {isToday ? 'Today' : '\u00a0'}
                <span className="sr-only">{isToday ? ': first cup ready to brew' : `${day}: empty`}</span>
              </span>
            </motion.li>
          </Fragment>
        )
      })}
    </ol>
  )
}