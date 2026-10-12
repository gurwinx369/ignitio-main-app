'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { KiboEyes } from '@/components/streak/kibo-eyes'
import { SpeechBubble } from '@/components/streak/speech-bubble'

const MESSAGE = [
  { text: 'You did it! ' },
  { text: 'Cup #1', highlight: true },
  { text: ' is brewed. Come back ' },
  { text: 'tomorrow', highlight: true },
  { text: ' and we brew #2 together.' },
]
const MESSAGE_LENGTH = MESSAGE.reduce((n, s) => n + s.text.length, 0)

export function KiboCheer({ visible }) {
  const reduceMotion = useReducedMotion()
  const [typing, setTyping] = useState(true)
  const [typedChars, setTypedChars] = useState(0)

  useEffect(() => {
    if (!visible) return
    if (reduceMotion) {
      const timer = setTimeout(() => {
        setTyping(false)
        setTypedChars(MESSAGE_LENGTH)
      }, 0)
      return () => clearTimeout(timer)
    }
    const t = setTimeout(() => setTyping(false), 650)
    return () => clearTimeout(t)
  }, [visible, reduceMotion])

  useEffect(() => {
    if (typing || typedChars >= MESSAGE_LENGTH) return
    const t = setTimeout(() => setTypedChars((c) => c + 1), 24)
    return () => clearTimeout(t)
  }, [typing, typedChars])

  return (
    <div className="flex w-full items-center gap-3">
      <div className="min-w-0 flex-1 pr-3">
        <SpeechBubble visible={visible} typing={typing} segments={MESSAGE} typedChars={typedChars} />
      </div>
      <motion.div
        className="relative aspect-[515/640] h-[clamp(88px,14dvh,128px)] shrink-0"
        initial={{ opacity: 0, y: 40, scale: 0.4 }}
        animate={visible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.4 }}
        transition={{ type: 'spring', stiffness: 260, damping: 12 }}
      >
        <span
          aria-hidden="true"
          className="absolute inset-x-[10%] bottom-[-8%] h-[12%] rounded-[50%] bg-kibo/30 blur-lg"
        />
        <motion.div
          className="relative h-full w-full origin-bottom"
          animate={{ y: [0, -16, 0], scaleY: [1, 1.06, 0.94, 1], rotate: [-4, 4, -4] }}
          transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
        >
          <img
            src="/kibo/kibo_body.svg"
            alt=""
            draggable={false}
            className="absolute inset-0 h-full w-full select-none object-contain drop-shadow-[0_0_24px_rgba(0,170,255,0.45)]"
          />
          <KiboEyes expression="excited" />
        </motion.div>
        <span className="sr-only">Kibo, your AI tutor, is bouncing with excitement.</span>
      </motion.div>
    </div>
  )
}
