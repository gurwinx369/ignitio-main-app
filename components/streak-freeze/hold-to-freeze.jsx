'use client'

import { motion, useTransform } from 'motion/react'
import { Shield, Sparkles } from 'lucide-react'

export function HoldToFreeze({
  freezeProgress,
  holding,
  nudge,
  onStart,
  onEnd,
}) {
  const width = useTransform(freezeProgress, (v) => `${v * 100}%`)

  return (
    <motion.div
      className="flex w-full flex-col items-center gap-2.5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 220, damping: 20, delay: 0.2 }}
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
        transition={holding ? { duration: 0.1 } : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        className="relative h-14 w-full max-w-md touch-none select-none overflow-hidden rounded-2xl border-2 border-[#00A9FF] bg-[#0E1B2A] font-pixelify text-lg font-bold uppercase tracking-wider text-white shadow-[0_6px_0_0_#0077B6,0_10px_25px_rgba(0,169,255,0.25)] transition-[transform,box-shadow] duration-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7FEFFF]/40 active:translate-y-[4px] active:shadow-[0_2px_0_0_#0077B6]"
      >
        {/* Ice Charge Bar */}
        <motion.span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#00A9FF] via-[#45DDFF] to-[#C8FCFF]"
          style={{ width }}
        />

        {/* Shimmer overlay */}
        <span
          aria-hidden="true"
          className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 animate-pulse bg-white/25"
        />

        <span className="relative flex items-center justify-center gap-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {holding ? (
            <>
              <Sparkles className="size-5 text-[#C8FCFF] animate-spin" aria-hidden="true" />
              <span>Cryo-Freezing…</span>
            </>
          ) : (
            <>
              <Shield className="size-5 fill-[#7FEFFF] text-[#7FEFFF]" aria-hidden="true" />
              <span>Hold to Freeze Shield</span>
            </>
          )}
        </span>
      </motion.button>

      <p className="min-h-5 text-center text-xs sm:text-sm font-semibold text-slate-400" aria-live="polite">
        {nudge ? (
          <span className="text-[#45DDFF]">Almost frozen! Keep holding to seal the ice shield.</span>
        ) : (
          'Press and hold to lock your streak into an ice shield'
        )}
      </p>
    </motion.div>
  )
}
