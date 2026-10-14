'use client'

import { Fragment } from 'react'
import { motion } from 'motion/react'
import { Check } from 'lucide-react'

function CupOutline({ highlight = false }) {
  return (
    <svg viewBox="0 0 40 54" className="h-full w-full" aria-hidden="true">
      <g
        fill="none"
        stroke={highlight ? 'var(--brew)' : 'var(--line-strong)'}
        strokeWidth="2.2"
        strokeDasharray="4 3.2"
        strokeLinejoin="round"
        opacity={highlight ? 0.9 : 1}
      >
        <path d="M11 3 h18 a3 3 0 0 1 3 3 v4 h-24 v-4 a3 3 0 0 1 3 -3 z" />
        <rect x="5" y="12" width="30" height="7" rx="3" />
        <path d="M8 21 h24 l-3 27 a3 3 0 0 1 -3 2.6 h-12 a3 3 0 0 1 -3 -2.6 z" />
      </g>
    </svg>
  )
}

export function FirstWeek({ days = [], visible }) {
  return (
    <motion.section
      aria-labelledby="first-week-heading"
      className="w-full rounded-3xl border-2 border-line bg-surface/70 px-4 py-3 backdrop-blur md:px-6 md:py-4"
      initial={{ opacity: 0, y: 24 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 id="first-week-heading" className="font-display text-lg font-bold md:text-xl">
          {'Week 1'}
        </h2>
        <p className="text-xs font-extrabold text-brew md:text-sm">{'1 of 7 brewed'}</p>
      </div>

      <ol className="flex items-end justify-between" aria-label="Your streak this week">
        {days.map((day, i) => {
          const isToday = i === 0
          const isNext = i === 1
          return (
            <Fragment key={day + i}>
              {i > 0 && (
                <motion.li
                  aria-hidden="true"
                  className="mb-[37px] h-0.5 min-w-2 flex-1 origin-left md:mb-[39px]"
                  style={{
                    backgroundImage: isNext
                      ? 'linear-gradient(90deg, var(--brew) 0 50%, transparent 50% 100%)'
                      : 'linear-gradient(90deg, var(--line-strong) 0 50%, transparent 50% 100%)',
                    backgroundSize: '8px 2px',
                  }}
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={visible ? { scaleX: 1, opacity: isNext ? 0.9 : 0.5 } : {}}
                  transition={{ delay: 0.25 + i * 0.07, duration: 0.3 }}
                />
              )}
              <motion.li
                className="flex shrink-0 flex-col items-center gap-1.5"
                initial={{ opacity: 0, y: 16, scale: 0.6 }}
                animate={visible ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ type: 'spring', stiffness: 320, damping: 16, delay: i * 0.06 }}
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
                        className="absolute -inset-2.5 rounded-full bg-brew/25 blur-md"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                      <motion.img
                        src="/streak/streak_done.png"
                        alt=""
                        className="relative h-full w-full object-contain drop-shadow-[0_0_8px_rgba(28,155,255,0.7)]"
                        initial={{ scale: 0, rotate: -25, y: -30 }}
                        animate={visible ? { scale: 1, rotate: 0, y: 0 } : {}}
                        transition={{ type: 'spring', stiffness: 380, damping: 11, delay: 0.35 }}
                      />
                      <motion.span
                        aria-hidden="true"
                        className="absolute -bottom-1 -right-2 flex size-4 items-center justify-center rounded-full bg-brew ring-2 ring-surface md:size-[18px]"
                        initial={{ scale: 0 }}
                        animate={visible ? { scale: 1 } : {}}
                        transition={{ type: 'spring', stiffness: 500, damping: 14, delay: 0.65 }}
                      >
                        <Check className="size-3 text-[#04121F]" strokeWidth={4} />
                      </motion.span>
                    </>
                  ) : isNext ? (
                    <>
                      <motion.span
                        aria-hidden="true"
                        className="absolute -inset-2 rounded-full border-2 border-brew/50"
                        animate={{ scale: [0.85, 1.3], opacity: [0.8, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                      />
                      <CupOutline highlight />
                    </>
                  ) : (
                    <CupOutline />
                  )}
                </span>
                <span
                  className={
                    isToday || isNext
                      ? 'text-[10px] font-extrabold uppercase tracking-widest text-brew'
                      : 'text-[10px] font-extrabold uppercase tracking-widest text-transparent'
                  }
                >
                  {isToday ? 'Done' : isNext ? 'Next' : '\u00a0'}
                  <span className="sr-only">
                    {isToday ? ': first cup brewed' : isNext ? ': brew cup #2 here' : `${day}: empty`}
                  </span>
                </span>
              </motion.li>
            </Fragment>
          )
        })}
      </ol>
    </motion.section>
  )
}
