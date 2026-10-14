'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Bell, BellOff } from 'lucide-react'
import { KiboEyes } from '@/components/streak/kibo-eyes'
import { SpeechBubble } from '@/components/streak/speech-bubble'

const MESSAGE = [
  { text: 'Want me to remind you ' },
  { text: 'tomorrow', highlight: true },
  { text: ' to brew cup #2? One nudge, that\u2019s it.' },
]
const MESSAGE_LENGTH = MESSAGE.reduce((n, s) => n + s.text.length, 0)

export function NotificationAsk({ onAllow, onSkip }) {
  const reduceMotion = useReducedMotion()
  const [typing, setTyping] = useState(true)
  const [typedChars, setTypedChars] = useState(0)
  const [visible, setVisible] = useState(false)
  const [isCtaHovered, setIsCtaHovered] = useState(false)

  // Stagger in — same pattern as KiboCheer in streak-sparked
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), reduceMotion ? 0 : 120)
    return () => clearTimeout(t)
  }, [reduceMotion])

  useEffect(() => {
    if (!visible) return
    if (reduceMotion) {
      setTyping(false)
      setTypedChars(MESSAGE_LENGTH)
      return
    }
    const t = setTimeout(() => setTyping(false), 650)
    return () => clearTimeout(t)
  }, [visible, reduceMotion])

  useEffect(() => {
    if (typing || typedChars >= MESSAGE_LENGTH) return
    const t = setTimeout(() => setTypedChars((c) => c + 1), 24)
    return () => clearTimeout(t)
  }, [typing, typedChars])

  // Context-aware Kibo expression: attentive gaze while waiting, glances at message while typing, perks up on CTA hover
  const kiboExpression = isCtaHovered
    ? 'curious'
    : typing
      ? 'look'
      : 'attentive'

  return (
    <main className="relative flex min-h-dvh flex-col items-center overflow-x-hidden bg-canvas px-4 pb-6 pt-4 text-ink md:px-8">
      {/* Background — same dot grid + blur orb as streak-sparked */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(rgba(125,150,180,0.12)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
        <motion.div
          className="absolute left-1/2 top-[18%] size-[520px] -translate-x-1/2 rounded-full bg-brew/20 blur-[130px]"
          initial={{ opacity: 0.35, scale: 0.8 }}
          animate={{ opacity: 0.7, scale: 1.0 }}
          transition={{ duration: 1.2 }}
        />
        <motion.div
          className="absolute -right-32 bottom-0 size-[420px] rounded-full bg-kibo/10 blur-[120px]"
          animate={{ opacity: visible ? 0.8 : 0 }}
          transition={{ duration: 1.2 }}
        />
      </div>

      <div className="relative z-10 flex w-full max-w-lg flex-1 flex-col items-center">
        {/* Header pill — same as streak-sparked "Lesson 1 complete" */}
        <header className="flex w-full items-center justify-between">
          <div className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs font-extrabold text-ink md:text-sm">
            <Bell className="size-4 text-brew" aria-hidden="true" />
            {'One last thing'}
          </div>
        </header>

        {/* Centre content — vertically centred like pre-reveal state in streak-sparked */}
        <section
          aria-label="Notification reminder"
          className="flex w-full flex-1 flex-col items-center justify-center gap-[clamp(20px,3dvh,32px)]"
        >
          {/* Heading */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: -12 }}
            animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <p className="font-display text-sm font-bold uppercase tracking-widest text-brew">
              {'Keep the streak alive'}
            </p>
            <h1 className="mt-1 text-balance font-display text-3xl font-bold leading-tight md:text-4xl">
              {'Can Kibo remind you tomorrow?'}
            </h1>
          </motion.div>

          {/* Kibo + SpeechBubble with proper right-facing tail alignment */}
          <div className="flex w-full items-center gap-3 md:gap-4">
            <div className="min-w-0 flex-1">
              <SpeechBubble
                visible={visible}
                typing={typing}
                segments={MESSAGE}
                typedChars={typedChars}
                tail="right"
              />
            </div>

            <motion.div
              className="relative aspect-[515/640] h-[clamp(88px,14dvh,128px)] shrink-0"
              initial={{ opacity: 0, y: 30, scale: 0.6 }}
              animate={visible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.6 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            >
              {/* Dynamic ground shadow synced to breathing buoyancy */}
              <motion.span
                aria-hidden="true"
                className="absolute inset-x-[10%] bottom-[-8%] h-[12%] rounded-[50%] bg-kibo/30 blur-lg"
                animate={
                  reduceMotion
                    ? { scale: 1, opacity: 0.28 }
                    : isCtaHovered
                      ? { scale: 0.82, opacity: 0.18 }
                      : { scale: [1, 0.82, 1], opacity: [0.32, 0.18, 0.32] }
                }
                transition={
                  reduceMotion
                    ? { duration: 0.1 }
                    : isCtaHovered
                      ? { type: 'spring', stiffness: 280, damping: 18 }
                      : { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }
                }
              />

              {/* Natural floating companion — weightless organic float instead of jumping */}
              <motion.div
                className="relative h-full w-full origin-bottom"
                animate={
                  reduceMotion
                    ? { y: 0, scale: 1, rotate: -2 }
                    : isCtaHovered
                      ? { y: -7, scale: 1.04, rotate: 1 }
                      : {
                          y: [0, -6, 0],
                          scaleY: [1, 1.025, 1],
                          scaleX: [1, 0.985, 1],
                          rotate: [-2.5, 0.5, -2.5],
                        }
                }
                transition={
                  reduceMotion
                    ? { duration: 0.1 }
                    : isCtaHovered
                      ? { type: 'spring', stiffness: 280, damping: 18 }
                      : { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }
                }
              >
                {/* Luminous aura */}
                <div
                  aria-hidden="true"
                  className="absolute -inset-2 -z-10 rounded-full bg-cyan-400/20 blur-xl transition-opacity duration-500"
                  style={{ opacity: isCtaHovered ? 0.9 : 0.4 }}
                />
                <img
                  src="/kibo/kibo_body.svg"
                  alt=""
                  draggable={false}
                  className="absolute inset-0 h-full w-full select-none object-contain drop-shadow-[0_0_24px_rgba(0,170,255,0.45)]"
                />
                <KiboEyes expression={kiboExpression} />
              </motion.div>
              <span className="sr-only">Kibo, your AI tutor, is asking about reminders.</span>
            </motion.div>
          </div>
        </section>

        {/* Footer CTAs — mirrors CelebrateCta structure exactly */}
        <footer className="mt-6 w-full">
          <motion.div
            className="flex w-full flex-col items-center gap-2.5"
            initial={{ opacity: 0, y: 30 }}
            animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.3 }}
          >
            {/* Primary — Allow (styled like CelebrateCta Continue) */}
            <button
              type="button"
              onClick={onAllow}
              onMouseEnter={() => setIsCtaHovered(true)}
              onMouseLeave={() => setIsCtaHovered(false)}
              onFocus={() => setIsCtaHovered(true)}
              onBlur={() => setIsCtaHovered(false)}
              className="group relative flex h-14 w-full max-w-md items-center justify-center gap-3 overflow-hidden rounded-2xl bg-brew font-display text-lg font-bold uppercase tracking-wide text-[#04121F] shadow-[0_4px_0_0_var(--brew-deep)] transition-[transform,box-shadow] duration-100 hover:brightness-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brew/40 active:translate-y-[4px] active:shadow-[0_0_0_0_var(--brew-deep)]"
            >
              <span aria-hidden="true" className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 animate-shine bg-white/35" />
              <Bell className="relative size-5" aria-hidden="true" />
              <span className="relative">Yes, remind me</span>
            </button>

            {/* Secondary — Skip (styled like CelebrateCta secondary) */}
            <button
              type="button"
              onClick={onSkip}
              className="flex h-11 w-full max-w-md items-center justify-center gap-2 rounded-2xl border-2 border-line text-sm font-extrabold text-muted-ink transition-colors hover:border-line-strong hover:text-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brew/40"
            >
              <BellOff className="size-4" aria-hidden="true" />
              {'No thanks'}
            </button>
          </motion.div>
        </footer>
      </div>
    </main>
  )
}
