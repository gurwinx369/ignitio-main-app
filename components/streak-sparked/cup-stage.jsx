'use client'

import { motion, useTransform } from 'motion/react'
import { EnergyCup } from './energy-cup'
import { BurstBackdrop, BurstForeground } from './burst'

const INFLOW = Array.from({ length: 10 }, (_, i) => {
  const angle = (i / 10) * Math.PI * 2
  return { x: Math.cos(angle) * 150, y: Math.sin(angle) * 150, delay: (i % 5) * 0.12 }
})

export function CupStage({
  charge,
  fill,
  holding,
  revealed,
  alive,
  onPressStart,
  onPressEnd,
}) {
  const chargeScale = useTransform(charge, [0, 1], [1, 1.1])
  const aura = useTransform(() => (revealed ? 0.6 : 0.12 + charge.get() * 0.7))

  return (
    <div
      aria-hidden="true"
      className="relative aspect-[400/640] h-[clamp(200px,40dvh,360px)] touch-none select-none"
      onPointerDown={revealed ? undefined : onPressStart}
      onPointerUp={revealed ? undefined : onPressEnd}
      onPointerLeave={revealed ? undefined : onPressEnd}
      onPointerCancel={revealed ? undefined : onPressEnd}
      onContextMenu={(e) => e.preventDefault()}
    >
      {revealed && <BurstBackdrop />}

      <motion.span
        className="pointer-events-none absolute left-1/2 top-[57%] size-[150%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(28,155,255,0.5)_0%,rgba(28,155,255,0)_62%)]"
        style={{ opacity: aura }}
      />

      {holding &&
        INFLOW.map((p, i) => (
          <motion.span
            key={i}
            className="pointer-events-none absolute left-1/2 top-[57%] size-2 rounded-full bg-kibo shadow-[0_0_10px_2px_rgba(25,198,255,0.8)]"
            initial={{ x: p.x, y: p.y, opacity: 0, scale: 1.2 }}
            animate={{ x: [p.x, 0], y: [p.y, 0], opacity: [0, 1, 0], scale: [1.2, 0.3] }}
            transition={{ duration: 0.6, delay: p.delay, repeat: Infinity, ease: 'easeIn' }}
          />
        ))}

      <motion.div className="relative h-full w-full" style={{ scale: chargeScale }}>
        <motion.div
          className="h-full w-full"
          animate={
            holding
              ? { rotate: [-2, 2], x: [-2, 2], y: 0 }
              : alive
                ? { rotate: 0, x: 0, y: [0, -10, 0] }
                : { rotate: 0, x: 0, y: 0 }
          }
          transition={
            holding
              ? { duration: 0.07, repeat: Infinity, repeatType: 'mirror' }
              : alive
                ? { y: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } }
                : { duration: 0.2 }
          }
        >
          <motion.div
            className="h-full w-full"
            initial={false}
            animate={revealed ? { scale: [1, 1.32, 0.9, 1.05, 1], rotate: [0, -6, 4, -1, 0] } : { scale: 1 }}
            transition={{ duration: 0.85, ease: 'easeOut' }}
          >
            <EnergyCup charge={charge} fill={fill} sealed={!revealed} alive={alive} />
          </motion.div>
        </motion.div>
      </motion.div>



      {revealed && <BurstForeground />}
    </div>
  )
}
