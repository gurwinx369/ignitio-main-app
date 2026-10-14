'use client'

import { motion } from 'motion/react'
import { Lock } from 'lucide-react'

const STEAM = [
  { d: 'M20 60 C8 46 32 36 20 20 C12 10 22 4 20 0', delay: 0, x: '34%' },
  { d: 'M20 60 C32 46 8 36 20 20 C28 10 18 4 20 0', delay: 1.1, x: '50%' },
  { d: 'M20 60 C8 46 32 36 20 20 C12 10 22 4 20 0', delay: 2.2, x: '64%' },
]

export function PendingCup({
  visible,
  peeking,
  eager,
  onPeekStart,
  onPeekEnd,
}) {
  const blur = peeking ? 1.2 : eager ? 2 : 3.2
  const leak = peeking ? 0.55 : eager ? 0.28 : 0.12

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, y: 50, filter: 'blur(18px)' }}
      animate={
        visible
          ? { opacity: 1, y: 0, filter: 'blur(0px)' }
          : { opacity: 0, y: 50, filter: 'blur(18px)' }
      }
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.button
        type="button"
        aria-label="Your first coffee cup is locked. Press and hold to try peeking."
        onPointerDown={onPeekStart}
        onPointerUp={onPeekEnd}
        onPointerLeave={onPeekEnd}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault()
            onPeekStart()
          }
        }}
        onKeyUp={(e) => {
          if (e.key === ' ' || e.key === 'Enter') onPeekEnd()
        }}
        className="group relative aspect-[697/960] h-[clamp(140px,22dvh,200px)] cursor-grab touch-none select-none rounded-3xl outline-none focus-visible:ring-4 focus-visible:ring-brew/50 active:cursor-grabbing"
        animate={peeking ? { scale: 1.06, rotate: [0, -3, 3, -2, 0] } : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.4 }}
        whileHover={{ scale: 1.03 }}
      >
        {/* aura */}
        <motion.span
          aria-hidden="true"
          className="absolute -inset-[35%] rounded-full bg-[radial-gradient(circle,rgba(28,155,255,0.45)_0%,rgba(28,155,255,0)_65%)]"
          animate={{ opacity: [leak * 1.4, leak * 2.6, leak * 1.4], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* steam: proves something hot is in there */}
        {STEAM.map((s, i) => (
          <motion.svg
            key={i}
            aria-hidden="true"
            viewBox="0 0 40 60"
            className="absolute -top-[30%] h-[34%] w-[22%] -translate-x-1/2"
            style={{ left: s.x }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: [0, 0.55, 0], y: [10, -14] }}
            transition={{ duration: 3.3, repeat: Infinity, delay: s.delay, ease: 'easeOut' }}
          >
            <path
              d={s.d}
              fill="none"
              stroke="#BFD8F2"
              strokeWidth="5"
              strokeLinecap="round"
              style={{ filter: 'blur(1.5px)' }}
            />
          </motion.svg>
        ))}

        {/* the real cup, leaking through as a color only */}
        <motion.img
          src="/streak/big_cup_7_days.png"
          alt=""
          aria-hidden="true"
          draggable={false}
          className="absolute inset-0 h-full w-full object-contain"
          animate={{ opacity: leak, filter: `blur(${peeking ? 7 : 14}px) saturate(1.6)` }}
          transition={{ duration: 0.35 }}
        />

        {/* silhouette */}
        <motion.img
          src="/streak/streak_pending_or_skipped.png"
          alt=""
          aria-hidden="true"
          draggable={false}
          className="absolute inset-0 h-full w-full object-contain"
          animate={{
            filter: `blur(${blur}px) brightness(${peeking ? 0.9 : 0.62})`,
            opacity: peeking ? 0.7 : 0.95,
          }}
          transition={{ duration: 0.35 }}
        />

        {/* glint sweep, masked to the cup shape */}
        <span
          aria-hidden="true"
          className="absolute inset-0 overflow-hidden"
          style={{
            maskImage: 'url(/streak/streak_pending_or_skipped.png)',
            WebkitMaskImage: 'url(/streak/streak_pending_or_skipped.png)',
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskPosition: 'center',
          }}
        >
          <span className="absolute inset-y-0 -left-full w-1/2 animate-glint bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        </span>

        {/* mystery mark */}
        <motion.span
          aria-hidden="true"
          className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 font-display text-4xl font-bold text-ink/80 md:text-5xl"
          animate={{ opacity: peeking ? 0 : [0.55, 0.9, 0.55], scale: peeking ? 0.5 : 1 }}
          transition={{ duration: peeking ? 0.2 : 2.4, repeat: peeking ? 0 : Infinity }}
          style={{ textShadow: '0 0 18px rgba(28,155,255,0.8)' }}
        >
          ?
        </motion.span>
      </motion.button>

      <div className="mt-2 flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] font-bold text-muted-ink md:text-xs">
        <Lock className="size-3 text-brew" aria-hidden="true" />
        <span>{'Brew #1 · locked'}</span>
      </div>
    </motion.div>
  )
}