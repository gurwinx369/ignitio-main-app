'use client'

import { useState } from 'react'
import { motion } from 'motion/react'

const COLORS = ['#1C9BFF', '#19C6FF', '#EAF1F9', '#FFC83D', '#7FEFFF']

function makePieces(count = 64) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4
    const distance = 130 + Math.random() * 230
    const shapes = ['rect', 'dot', 'ribbon']
    return {
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance * 0.8 - 60,
      fall: 180 + Math.random() * 220,
      rotate: (Math.random() - 0.5) * 900,
      color: COLORS[i % COLORS.length],
      shape: shapes[i % 3],
      size: 6 + Math.random() * 6,
      duration: 1.8 + Math.random() * 0.9,
      delay: Math.random() * 0.12,
    }
  })
}

const STARS = [
  { left: '-8%', top: '18%', size: 18, delay: 0.7 },
  { left: '102%', top: '30%', size: 22, delay: 1.1 },
  { left: '-14%', top: '62%', size: 14, delay: 1.6 },
  { left: '106%', top: '74%', size: 16, delay: 0.9 },
  { left: '82%', top: '-6%', size: 12, delay: 1.9 },
]

function Star({ size = 24 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0 Z" fill="#EAF1F9" />
    </svg>
  )
}

export function BurstBackdrop() {
  return (
    <>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[58%] size-[300%] -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0, scale: 0.2 }}
        animate={{ opacity: 1, scale: 1, rotate: 360 }}
        transition={{
          opacity: { duration: 0.5 },
          scale: { type: 'spring', stiffness: 120, damping: 14 },
          rotate: { duration: 40, repeat: Infinity, ease: 'linear' },
        }}
        style={{
          background:
            'repeating-conic-gradient(from 0deg, rgba(28,155,255,0.22) 0deg 9deg, transparent 9deg 22deg)',
          maskImage: 'radial-gradient(circle, black 8%, transparent 58%)',
          WebkitMaskImage: 'radial-gradient(circle, black 8%, transparent 58%)',
        }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[60%] size-[170%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(25,198,255,0.4)_0%,rgba(28,155,255,0)_62%)]"
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: [0, 1, 0.7], scale: [0.4, 1.15, 1] }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
      />
    </>
  )
}

export function BurstForeground() {
  const [pieces] = useState(() => makePieces(64))

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {[0, 0.16].map((delay) => (
        <motion.span
          key={delay}
          className="absolute left-1/2 top-[58%] size-[110%] -translate-x-1/2 -translate-y-1/2 rounded-full border-[6px] border-kibo"
          initial={{ scale: 0.2, opacity: 1 }}
          animate={{ scale: 2.6, opacity: 0 }}
          transition={{ duration: 0.95, delay, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}

      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 top-[55%] block"
          style={{
            width: p.shape === 'ribbon' ? p.size * 0.5 : p.size,
            height: p.shape === 'rect' ? p.size * 1.6 : p.shape === 'ribbon' ? p.size * 2.4 : p.size,
            background: p.color,
            borderRadius: p.shape === 'dot' ? '9999px' : '2px',
          }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.4 }}
          animate={{
            x: [0, p.dx, p.dx * 1.15],
            y: [0, p.dy, p.dy + p.fall],
            rotate: [0, p.rotate * 0.6, p.rotate],
            opacity: [1, 1, 0],
            scale: [0.4, 1, 0.9],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            times: [0, 0.32, 1],
            ease: ['easeOut', 'easeIn'],
          }}
        />
      ))}

      {STARS.map((s, i) => (
        <motion.span
          key={i}
          className="absolute block drop-shadow-[0_0_8px_rgba(25,198,255,0.9)]"
          style={{ left: s.left, top: s.top }}
          initial={{ scale: 0, opacity: 0, rotate: 0 }}
          animate={{ scale: [0, 1, 0], opacity: [0, 1, 0], rotate: [0, 90] }}
          transition={{ duration: 1.4, delay: s.delay, repeat: Infinity, repeatDelay: 1.6, ease: 'easeInOut' }}
        >
          <Star size={s.size} />
        </motion.span>
      ))}
    </div>
  )
}
