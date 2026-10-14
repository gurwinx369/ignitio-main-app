'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from 'motion/react'
import { CircleCheck, Volume2, VolumeX } from 'lucide-react'
import { CupStage } from './cup-stage'
import { HoldToBrew } from './hold-to-brew'
import { StreakCount } from './streak-count'
import { KiboCheer } from './kibo-cheer'
import { FirstWeek } from './first-week'
import { CelebrateCta } from './celebrate-cta'
import { useCelebrationSound } from './use-celebration-sound'

const CHARGE_SECONDS = 1.4

function buzz(pattern) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern)
}

export function StreakSparked({ days = [] }) {
  const reduceMotion = useReducedMotion()
  const charge = useMotionValue(0)
  const fill = useMotionValue(0)
  const [stage, setStage] = useState('sealed')
  const [holding, setHolding] = useState(false)
  const [nudge, setNudge] = useState(false)
  const [step, setStep] = useState(0)
  const chargeAnim = useRef(null)
  const stageRef = useRef('sealed')
  const sound = useCelebrationSound()

  const revealed = stage !== 'sealed'

  const reveal = useCallback(() => {
    if (stageRef.current !== 'sealed') return
    stageRef.current = 'pouring'
    setHolding(false)
    setStage('pouring')
    sound.reveal()
    buzz([25, 40, 70])
    animate(fill, 1, {
      duration: reduceMotion ? 0 : 1.7,
      delay: reduceMotion ? 0 : 0.5,
      ease: [0.33, 0, 0.2, 1],
      onComplete: () => {
        stageRef.current = 'sparked'
        setStage('sparked')
      },
    })
  }, [fill, reduceMotion, sound])

  const startHold = () => {
    if (stageRef.current !== 'sealed') return
    setNudge(false)
    setHolding(true)
    if (reduceMotion) {
      charge.set(1)
      reveal()
      return
    }
    const remaining = CHARGE_SECONDS * (1 - charge.get())
    sound.startCharge(remaining, charge.get())
    chargeAnim.current?.stop()
    chargeAnim.current = animate(charge, 1, { duration: remaining, ease: 'linear', onComplete: reveal })
  }

  const endHold = () => {
    if (stageRef.current !== 'sealed' || !holding) return
    setHolding(false)
    if (charge.get() >= 1) return
    chargeAnim.current?.stop()
    sound.stopCharge()
    chargeAnim.current = animate(charge, 0, { duration: 0.45, ease: 'easeOut' })
    if (charge.get() > 0.05) setNudge(true)
  }

  useEffect(() => {
    if (stage !== 'sparked') return
    sound.pop()
    buzz([15, 30, 15])
    const delays = reduceMotion ? [0, 0, 0, 0] : [250, 800, 1500, 2100]
    const timers = delays.map((d, i) => setTimeout(() => setStep(i + 1), d))
    return () => timers.forEach(clearTimeout)
    // sound callbacks are stable; only re-run when the stage flips
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, reduceMotion])

  useEffect(() => () => chargeAnim.current?.stop(), [])

  return (
    <main className="relative flex min-h-dvh flex-col items-center overflow-x-hidden bg-canvas px-4 pb-6 pt-4 text-ink md:px-8">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(rgba(125,150,180,0.12)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
        <motion.div
          className="absolute left-1/2 top-[18%] size-[520px] -translate-x-1/2 rounded-full bg-brew/20 blur-[130px]"
          animate={{ opacity: revealed ? 1 : 0.35, scale: revealed ? 1.2 : 0.8 }}
          transition={{ duration: 1.2 }}
        />
        <motion.div
          className="absolute -right-32 bottom-0 size-[420px] rounded-full bg-kibo/10 blur-[120px]"
          animate={{ opacity: step >= 2 ? 1 : 0 }}
          transition={{ duration: 1.2 }}
        />
      </div>

      <AnimatePresence>
        {revealed && (
          <motion.div
            key="flash"
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-50 bg-[radial-gradient(circle_at_50%_35%,#ffffff_0%,#7FEFFF_30%,rgba(28,155,255,0)_75%)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.95, 0] }}
            transition={{ duration: reduceMotion ? 0.01 : 0.7, times: [0, 0.15, 1], ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="relative z-10 flex w-full max-w-lg flex-1 flex-col items-center"
        animate={revealed && !reduceMotion ? { x: [0, -9, 8, -6, 4, -2, 0] } : { x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <header className="flex w-full items-center justify-between">
          <div className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs font-extrabold text-ink md:text-sm">
            <CircleCheck className="size-4 text-brew" aria-hidden="true" />
            {'Lesson 1 complete'}
          </div>
          <button
            type="button"
            onClick={sound.toggleMute}
            aria-label={sound.muted ? 'Turn sound on' : 'Turn sound off'}
            className="flex size-9 items-center justify-center rounded-full border border-line bg-surface text-muted-ink transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brew/40"
          >
            {sound.muted ? <VolumeX className="size-4" aria-hidden="true" /> : <Volume2 className="size-4" aria-hidden="true" />}
          </button>
        </header>

        <section
          aria-label="Your first streak"
          className={`flex w-full flex-1 flex-col items-center ${revealed ? 'justify-start pt-2' : 'justify-center'}`}
        >
          <AnimatePresence mode="wait">
            {!revealed && (
              <motion.div
                key="sealed-copy"
                className="mb-6 text-center"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <p className="font-display text-sm font-bold uppercase tracking-widest text-brew">{'You earned it'}</p>
                <h1 className="mt-1 text-balance font-display text-3xl font-bold leading-tight md:text-4xl">
                  {'Your first cup is ready to brew'}
                </h1>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div layout="position" transition={{ type: 'spring', stiffness: 160, damping: 22 }}>
            <CupStage
              charge={charge}
              fill={fill}
              holding={holding}
              revealed={revealed}
              alive={stage === 'sparked'}
              onPressStart={startHold}
              onPressEnd={endHold}
            />
          </motion.div>

          {revealed && (
            <div className="mt-4 flex w-full flex-col items-center gap-[clamp(14px,2.6dvh,24px)]">
              <StreakCount value={stage === 'sparked' ? 1 : 0} showRewards={step >= 1} />
              <KiboCheer visible={step >= 2} />
              <FirstWeek days={days} visible={step >= 3} />
            </div>
          )}
        </section>

        <p className="sr-only" aria-live="assertive">
          {stage === 'sparked' ? 'Streak sparked! You started a 1 day streak and brewed your first cup.' : ''}
        </p>

        <footer className="mt-6 w-full">
          <AnimatePresence mode="wait">
            {!revealed ? (
              <HoldToBrew
                key="hold"
                charge={charge}
                holding={holding}
                nudge={nudge}
                onStart={startHold}
                onEnd={endHold}
              />
            ) : (
              <CelebrateCta key="cta" visible={step >= 4} />
            )}
          </AnimatePresence>
        </footer>
      </motion.div>
    </main>
  )
}
