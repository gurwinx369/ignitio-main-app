'use client'

import { motion } from 'motion/react'

const EYES_ORIGIN = '54.4% 73.3%'

const motions = {
  idle: {
    animate: { x: '0%', y: '0%', rotate: 0, scaleX: 1, scaleY: [1, 1, 0.15, 1, 1] },
    transition: { duration: 4, repeat: Infinity, times: [0, 0.9, 0.94, 0.98, 1] },
  },
  look: {
    animate: { x: '-6%', y: '-1%', rotate: -4, scaleX: 1, scaleY: 1 },
    transition: { type: 'spring', stiffness: 260, damping: 16 },
  },
  tease: {
    animate: {
      x: ['-2%', '2%', '-2%'],
      y: '0%',
      rotate: [-7, 7, -7],
      scaleX: [1, 1.06, 1],
      scaleY: [1, 0.8, 1],
    },
    transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' },
  },
  excited: {
    animate: { x: '0%', y: ['0%', '-4%', '0%'], rotate: 0, scaleX: [1, 1.18, 1], scaleY: [1, 1.18, 1] },
    transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' },
  },
  busted: {
    animate: { x: ['0%', '-5%', '5%', '-3%', '0%'], y: '0%', rotate: 0, scaleX: 1.05, scaleY: 0.7 },
    transition: { duration: 0.45 },
  },
}

export function KiboEyes({ expression = 'idle' }) {
  const motionConfig = motions[expression] || motions.idle
  const { animate, transition } = motionConfig
  return (
    <motion.img
      src="/kibo/kibo_eyes.svg"
      alt=""
      aria-hidden="true"
      draggable={false}
      className="absolute inset-0 h-full w-full select-none object-contain drop-shadow-[0_0_10px_rgba(0,190,255,0.85)]"
      style={{ transformOrigin: EYES_ORIGIN }}
      animate={animate}
      transition={transition}
    />
  )
}