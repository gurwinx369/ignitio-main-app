'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from 'motion/react'
import { CheckCircle2, Shield, Volume2, VolumeX, X } from 'lucide-react'
import { FreezeCupStage } from './freeze-cup-stage'
import { HoldToFreeze } from './hold-to-freeze'
import { useFreezeSound } from './use-freeze-sound'

const FREEZE_HOLD_SECONDS = 1.4

function buzz(pattern) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern)
    } catch {}
  }
}

export function FreezeCeremonyModal({
  isOpen,
  onClose,
  onFreezeBanked,
  targetSlotId = 'streak-freeze-bank-slot',
}) {
  const reduceMotion = useReducedMotion()
  const freezeProgress = useMotionValue(0)
  const [stage, setStage] = useState('incubating') // 'incubating' | 'freezing' | 'frozen' | 'flying' | 'docked'
  const [holding, setHolding] = useState(false)
  const [nudge, setNudge] = useState(false)
  const [flyDestination, setFlyDestination] = useState({ x: 0, y: 0 })

  const chargeAnim = useRef(null)
  const stageRef = useRef('incubating')
  const centerCupRef = useRef(null)
  const sound = useFreezeSound()

  // Cleanup animation and audio when unmounting
  useEffect(() => {
    return () => {
      chargeAnim.current?.stop()
      sound.stopFreeze()
    }
  }, [sound])

  const handleClose = useCallback(() => {
    chargeAnim.current?.stop()
    sound.stopFreeze()
    setStage('incubating')
    stageRef.current = 'incubating'
    setHolding(false)
    setNudge(false)
    freezeProgress.set(0)
    onClose()
  }, [onClose, freezeProgress, sound])

  // Triggered when hold charge reaches 100%
  const completeFreeze = useCallback(() => {
    if (stageRef.current === 'frozen' || stageRef.current === 'flying') return
    stageRef.current = 'frozen'
    setHolding(false)
    setStage('frozen')
    sound.freezeShatter()
    buzz([30, 50, 80])
  }, [sound])

  const startHold = () => {
    if (stageRef.current !== 'incubating') return
    setNudge(false)
    setHolding(true)
    if (reduceMotion) {
      freezeProgress.set(1)
      completeFreeze()
      return
    }
    const currentProg = freezeProgress.get()
    const remaining = FREEZE_HOLD_SECONDS * (1 - currentProg)
    sound.startFreeze(remaining, currentProg)
    chargeAnim.current?.stop()
    chargeAnim.current = animate(freezeProgress, 1, {
      duration: remaining,
      ease: 'linear',
      onComplete: completeFreeze,
    })
  }

  const endHold = () => {
    if (stageRef.current !== 'incubating' || !holding) return
    setHolding(false)
    if (freezeProgress.get() >= 1) return
    chargeAnim.current?.stop()
    sound.stopFreeze()
    chargeAnim.current = animate(freezeProgress, 0, {
      duration: 0.35,
      ease: 'easeOut',
    })
    if (freezeProgress.get() > 0.08) setNudge(true)
  }

  // Calculate coordinates to fly into the StreakStatusCard on the dashboard
  const triggerFlight = useCallback(() => {
    if (stageRef.current === 'flying' || stageRef.current === 'docked') return
    stageRef.current = 'flying'
    setStage('flying')

    const targetEl = document.getElementById(targetSlotId)
    const centerEl = centerCupRef.current

    if (targetEl && centerEl) {
      const targetRect = targetEl.getBoundingClientRect()
      const centerRect = centerEl.getBoundingClientRect()

      const deltaX = targetRect.left + targetRect.width / 2 - (centerRect.left + centerRect.width / 2)
      const deltaY = targetRect.top + targetRect.height / 2 - (centerRect.top + centerRect.height / 2)
      setFlyDestination({ x: deltaX, y: deltaY })
    } else {
      // Default trajectory to top-right if target is offscreen
      setFlyDestination({ x: 260, y: -280 })
    }
  }, [targetSlotId])

  // Handle docking arrival on the Streak Card
  const handleDocked = useCallback(() => {
    if (stageRef.current === 'docked') return
    stageRef.current = 'docked'
    setStage('docked')
    sound.shieldImpact()
    buzz([20, 40, 20])

    if (typeof onFreezeBanked === 'function') {
      onFreezeBanked()
    }

    setTimeout(() => {
      handleClose()
    }, 450)
  }, [sound, onFreezeBanked, handleClose])

  if (!isOpen) return null

  const isFrozen = stage === 'frozen' || stage === 'flying' || stage === 'docked'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Dark Ambient Backdrop */}
      <motion.div
        className="fixed inset-0 bg-[#060D18]/85 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={stage === 'incubating' || isFrozen ? handleClose : undefined}
      />

      {/* Soft Cryo Glint */}
      <AnimatePresence>
        {isFrozen && stage === 'frozen' && (
          <motion.div
            key="cryo-flash"
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-50 bg-[radial-gradient(circle_at_50%_45%,#FFFFFF_0%,#C8FCFF_25%,transparent_70%)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.35, 0] }}
            transition={{
              duration: reduceMotion ? 0.05 : 0.45,
              times: [0, 0.2, 1],
              ease: 'easeOut',
            }}
          />
        )}
      </AnimatePresence>

      {/* Modal Surface */}
      <motion.div
        className="relative z-10 flex w-full max-w-md flex-col items-center rounded-3xl border border-[#00A9FF]/30 bg-gradient-to-b from-[#0F1E36] via-[#0A1526] to-[#060C17] p-6 text-white shadow-[0_25px_60px_rgba(0,169,255,0.25)]"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{
          scale: stage === 'flying' || stage === 'docked' ? 0.96 : 1,
          opacity: stage === 'flying' || stage === 'docked' ? 0 : 1,
          y: 0,
        }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* Header Controls */}
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-1.5 rounded-full border border-[#00A9FF]/30 bg-[#00A9FF]/10 px-3 py-1 text-xs font-bold text-[#7FEFFF]">
            <Shield className="size-3.5 fill-[#7FEFFF]" />
            <span>Streak Defense System</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={sound.toggleMute}
              className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 hover:text-white"
              aria-label={sound.muted ? 'Unmute' : 'Mute'}
            >
              {sound.muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 hover:text-white"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Title Copy */}
        <div className="mt-4 text-center">
          <h3 className="font-pixelify text-2xl sm:text-3xl font-black tracking-tight text-white">
            {isFrozen ? 'Streak Freeze Forged!' : 'Forge Your Streak Shield'}
          </h3>
          <p className="mt-1 text-xs sm:text-sm font-medium text-slate-300">
            {isFrozen
              ? 'Your brewed cup has been locked into cryo-stasis. Bank it into your streak card!'
              : 'Hold to freeze your brewed cup into an unbreakable backup shield.'}
          </p>
        </div>

        {/* Central Cup Stage & Flight Container */}
        <div ref={centerCupRef} className="relative my-3 flex items-center justify-center">
          {stage === 'flying' ? (
            /* Flying Cup Component along Smooth Aerodynamic Arc */
            <motion.div
              className="pointer-events-none fixed z-[120]"
              initial={{ x: 0, y: 0, scale: 1, rotate: 0 }}
              animate={{
                x: [0, flyDestination.x * 0.5, flyDestination.x],
                y: [0, flyDestination.y - 90, flyDestination.y],
                scale: [1, 0.7, 0.36],
                rotate: [0, -6, 0],
              }}
              transition={{
                duration: reduceMotion ? 0.05 : 0.85,
                ease: [0.22, 1, 0.36, 1],
              }}
              onAnimationComplete={handleDocked}
            >
              <Image
                src="/streak/streak_freeze.png"
                alt="Flying freeze cup"
                width={200}
                height={300}
                className="h-32 w-auto object-contain drop-shadow-[0_0_20px_#7FEFFF]"
              />
            </motion.div>
          ) : (
            <FreezeCupStage
              freezeProgress={freezeProgress}
              holding={holding}
              frozen={isFrozen}
              onPressStart={startHold}
              onPressEnd={endHold}
            />
          )}
        </div>

        {/* Footer CTAs */}
        <div className="mt-2 w-full">
          {!isFrozen ? (
            <HoldToFreeze
              freezeProgress={freezeProgress}
              holding={holding}
              nudge={nudge}
              onStart={startHold}
              onEnd={endHold}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex w-full flex-col gap-2.5"
            >
              <button
                type="button"
                onClick={triggerFlight}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#00A9FF] via-[#45DDFF] to-[#00A9FF] font-pixelify text-base sm:text-lg font-bold uppercase tracking-wider text-black shadow-[0_6px_0_0_#0077B6,0_10px_25px_rgba(0,169,255,0.4)] transition-all hover:scale-[1.02] active:translate-y-[4px] active:shadow-[0_2px_0_0_#0077B6]"
              >
                <Shield className="size-5 fill-black" />
                <span>Bank Shield into Streak Card</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="text-center text-xs font-semibold text-slate-400 transition hover:text-slate-200"
              >
                Keep in reserves & close
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
