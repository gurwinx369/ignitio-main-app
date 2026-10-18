'use client'

import { useId } from 'react'
import Image from 'next/image'
import { motion, useTransform } from 'motion/react'
import { CryoBackdrop, FreezeBurst } from './freeze-particles'

export function FreezeCupStage({
  freezeProgress,
  holding,
  frozen,
  onPressStart,
  onPressEnd,
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const id = (name) => `${name}-${uid}`

  // Frost level creeping up the cup from bottom (y=100%) to top (y=0%)
  const frostHeight = useTransform(freezeProgress, [0, 1], ['0%', '100%'])
  const frostOpacity = useTransform(freezeProgress, [0, 0.4, 1], [0, 0.65, 0.95])
  const brewOpacity = useTransform(freezeProgress, [0.75, 1], [1, 0])
  const iceGlow = useTransform(freezeProgress, [0, 1], [0, 1])

  return (
    <div
      aria-hidden="true"
      className="relative aspect-[400/600] h-[clamp(220px,42dvh,380px)] touch-none select-none"
      onPointerDown={frozen ? undefined : onPressStart}
      onPointerUp={frozen ? undefined : onPressEnd}
      onPointerLeave={frozen ? undefined : onPressEnd}
      onPointerCancel={frozen ? undefined : onPressEnd}
      onContextMenu={(e) => e.preventDefault()}
    >
      <CryoBackdrop frozen={frozen} />

      {/* Cryo Frost Shaders */}
      <svg className="absolute h-0 w-0" aria-hidden="true">
        <defs>
          <filter id={id('ice-crystal-filter')} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04 0.08" numOctaves="3" result="frostNoise" />
            <feDisplacementMap in="SourceGraphic" in2="frostNoise" scale="12" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <linearGradient id={id('frost-sheen')} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#C8FCFF" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#7FEFFF" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>

      {/* Main Cup Presentation with Calm Antigravity Levitation */}
      <motion.div
        className="relative h-full w-full"
        animate={
          holding && !frozen
            ? { rotate: [-1, 1], x: [-1, 1], scale: 1.02 }
            : frozen
              ? { y: [0, -6, 0], scale: 1 }
              : { rotate: 0, x: 0, y: 0, scale: 1 }
        }
        transition={
          holding && !frozen
            ? { duration: 0.1, repeat: Infinity, repeatType: 'mirror' }
            : frozen
              ? {
                  y: { duration: 3.6, repeat: Infinity, ease: 'easeInOut' },
                }
              : { duration: 0.25 }
        }
      >
        {/* Layer 1: The Warm Brewed Cup */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: frozen ? 0 : brewOpacity }}
        >
          <Image
            src="/streak/streak_done.png"
            alt="Brewed cup"
            width={400}
            height={600}
            priority
            className="h-full w-full object-contain drop-shadow-[0_15px_30px_rgba(0,169,255,0.25)]"
          />

          {/* Creeping Frost Overlay as user charges */}
          <motion.div
            className="pointer-events-none absolute inset-x-8 bottom-6 overflow-hidden rounded-3xl"
            style={{
              height: frostHeight,
              opacity: frostOpacity,
              background: 'linear-gradient(180deg, rgba(200,252,255,0.7) 0%, rgba(127,239,255,0.9) 100%)',
              backdropFilter: 'blur(3px)',
              mixBlendMode: 'color-dodge',
              filter: `url(#${id('ice-crystal-filter')})`,
            }}
          />
        </motion.div>

        {/* Layer 2: The Crystal Ice Freeze Cup */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={false}
          animate={{
            opacity: frozen ? 1 : 0,
            scale: frozen ? [0.96, 1.05, 1] : 0.96,
          }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src="/streak/streak_freeze.png"
            alt="Freeze cup"
            width={400}
            height={600}
            priority
            className="h-full w-full object-contain drop-shadow-[0_18px_40px_rgba(127,239,255,0.35)]"
          />

          {/* Ice Crystal Sheen: Fires cleanly once upon freeze, not a perpetual clutter loop */}
          {frozen && (
            <motion.div
              className="pointer-events-none absolute inset-0 -skew-x-12"
              initial={{ x: '-120%', opacity: 0 }}
              animate={{ x: '160%', opacity: [0, 0.6, 0] }}
              transition={{
                duration: 1.1,
                ease: 'easeInOut',
                delay: 0.1,
              }}
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
                width: '60%',
              }}
            />
          )}
        </motion.div>
      </motion.div>

      {/* Frost Particle Explosion on Instant Freeze */}
      {frozen && <FreezeBurst />}
    </div>
  )
}
