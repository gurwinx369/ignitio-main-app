'use client'

import { motion } from 'motion/react'
import { KiboEyes } from './kibo-eyes'

const bodyPose = {
  idle: { rotate: 0, x: 0, scaleY: 1 },
  look: { rotate: -7, x: -6, scaleY: 1 },
  tease: { rotate: -4, x: -2, scaleY: 1.02 },
  excited: { rotate: 3, x: 0, scaleY: 1.06 },
  busted: { rotate: 6, x: 6, scaleY: 1 },
}

export function Kibo({ expression = 'idle', visible = false }) {
  const pose = bodyPose[expression] || bodyPose.idle
  return (
    <motion.div
      className="relative w-full"
      initial={{ opacity: 0, y: 60, scale: 0.5 }}
      animate={visible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 60, scale: 0.5 }}
      transition={{ type: 'spring', stiffness: 220, damping: 14 }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-[10%] bottom-[-6%] h-[10%] rounded-[50%] bg-kibo/25 blur-xl"
      />
      <motion.div
        animate={{ y: expression === 'excited' ? [0, -14, 0] : [0, -8, 0] }}
        transition={{
          duration: expression === 'excited' ? 0.5 : 3.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <motion.div
          className="relative aspect-[515/640] w-full origin-bottom"
          animate={pose}
          transition={{ type: 'spring', stiffness: 200, damping: 12 }}
        >
          <img
            src="/kibo/kibo_body.svg"
            alt=""
            className="absolute inset-0 h-full w-full select-none object-contain drop-shadow-[0_0_32px_rgba(0,170,255,0.35)]"
            draggable={false}
          />
          <KiboEyes expression={expression} />
        </motion.div>
      </motion.div>
      <span className="sr-only">Kibo, your AI tutor, is giving you a playful, teasing look.</span>
    </motion.div>
  )
}