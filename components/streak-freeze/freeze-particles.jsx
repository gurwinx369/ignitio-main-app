'use client'

import { motion } from 'motion/react'

const ICE_COLORS = ['#C8FCFF', '#7FEFFF', '#E9FDFF', '#00A9FF', '#FFFFFF']

function makeCrystals(count = 16) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2
    const distance = 55 + (i * 11) % 45
    return {
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance * 0.75 - 10,
      rotate: (i % 2 === 0 ? 1 : -1) * 90,
      color: ICE_COLORS[i % ICE_COLORS.length],
      size: 3.5 + (i % 3) * 1.5,
      duration: 0.85 + (i % 3) * 0.15,
      delay: (i % 4) * 0.02,
    }
  })
}

const CRYSTAL_ITEMS = makeCrystals(16)

function SnowflakeIcon({ size = 14, color = '#7FEFFF' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
      <path
        d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="2" fill={color} />
    </svg>
  )
}

export function FreezeBurst() {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-visible" aria-hidden="true">
      {CRYSTAL_ITEMS.map((c, i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 rounded-full"
          initial={{ x: 0, y: 0, scale: 0, opacity: 0.9 }}
          animate={{
            x: c.dx,
            y: c.dy,
            scale: [0, 1.1, 0],
            opacity: [0.9, 0.8, 0],
          }}
          transition={{
            duration: c.duration,
            delay: c.delay,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{
            width: c.size,
            height: c.size,
            backgroundColor: c.color,
            boxShadow: `0 0 8px ${c.color}`,
          }}
        />
      ))}

      {/* 3 subtle, clean snowflake glints */}
      {[
        { x: -55, y: -45, delay: 0.05, size: 14 },
        { x: 60, y: -35, delay: 0.1, size: 16 },
        { x: 0, y: -70, delay: 0.08, size: 14 },
      ].map((s, i) => (
        <motion.div
          key={`sf-${i}`}
          className="absolute left-1/2 top-[50%] -translate-x-1/2 -translate-y-1/2"
          initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
          animate={{
            x: s.x,
            y: s.y,
            opacity: [0, 0.85, 0],
            scale: [0, 1, 0.8],
          }}
          transition={{
            duration: 1.1,
            delay: s.delay,
            ease: 'easeOut',
          }}
        >
          <SnowflakeIcon size={s.size} />
        </motion.div>
      ))}
    </div>
  )
}

export function CryoBackdrop({ frozen }) {
  return (
    <>
      {/* Calm, ethereal cryogenic glow halo without busy spinning patterns */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[52%] size-[140%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        initial={{ opacity: 0.2, scale: 0.85 }}
        animate={{
          opacity: frozen ? 0.65 : 0.2,
          scale: frozen ? 1.05 : 0.85,
        }}
        transition={{
          opacity: { duration: 0.6, ease: 'easeOut' },
          scale: { duration: 0.8, ease: 'easeOut' },
        }}
        style={{
          background:
            'radial-gradient(circle, rgba(0,169,255,0.22) 0%, rgba(127,239,255,0.10) 42%, transparent 70%)',
          filter: 'blur(24px)',
        }}
      />
    </>
  )
}
