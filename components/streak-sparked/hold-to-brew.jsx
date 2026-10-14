'use client'

import { motion, useTransform } from 'motion/react'
import { Zap } from 'lucide-react'

export function HoldToBrew({
  charge,
  holding,
  nudge,
  onStart,
  onEnd,
}) {
  const width = useTransform(charge, (v) => `${v * 100}%`)

  return (
    <motion.div
      className="flex w-full flex-col items-center gap-2.5"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 220, damping: 20, delay: 0.5 }}
    >
      <motion.button
        type="button"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          onStart()
        }}
        onPointerUp={onEnd}
        onPointerCancel={onEnd}
        onLostPointerCapture={onEnd}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            e.preventDefault()
            onStart()
          }
        }}
        onKeyUp={(e) => {
          if (e.key === ' ' || e.key === 'Enter') onEnd()
        }}
        onContextMenu={(e) => e.preventDefault()}
        animate={holding ? { scale: 0.98 } : { scale: [1, 1.025, 1] }}
        transition={holding ? { duration: 0.1 } : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        className="relative h-14 w-full max-w-md touch-none select-none overflow-hidden rounded-2xl border-2 border-brew bg-surface font-display text-lg font-bold uppercase tracking-wide text-ink shadow-[0_4px_0_0_var(--brew-deep)] transition-[transform,box-shadow] duration-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brew/40 active:translate-y-[4px] active:shadow-[0_0_0_0_var(--brew-deep)]"
      >
        <motion.span aria-hidden="true" className="absolute inset-y-0 left-0 bg-brew" style={{ width }} />
        <span
          aria-hidden="true"
          className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 animate-shine bg-white/20"
        />
        <span className="relative flex items-center justify-center gap-2">
          <Zap className="size-5 fill-current" aria-hidden="true" />
          {holding ? 'Brewing\u2026' : 'Hold to brew'}
        </span>
      </motion.button>
      <p className="min-h-5 text-center text-sm font-bold text-muted-ink" aria-live="polite">
        {nudge ? (
          <span className="text-kibo">{"So close! Keep holding until it's full."}</span>
        ) : (
          'Press and hold to brew your first cup'
        )}
      </p>
    </motion.div>
  )
}
