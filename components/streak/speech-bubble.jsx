'use client'

import { AnimatePresence, motion } from 'motion/react'

function TypingDots() {
  return (
    <span className="flex h-7 items-center gap-1.5" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-2 rounded-full bg-brew"
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.14 }}
        />
      ))}
    </span>
  )
}

export function SpeechBubble({
  visible,
  typing,
  segments = [],
  typedChars = 0,
}) {
  const fullText = segments.map((s) => s.text).join('')
  const done = typedChars >= fullText.length

  let charOffset = 0
  const renderedSegments = []
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    const start = charOffset
    charOffset += seg.text.length
    if (typedChars <= start) continue
    const count = Math.min(seg.text.length, typedChars - start)
    const shown = seg.text.slice(0, count)
    if (shown) {
      renderedSegments.push({
        key: i,
        highlight: seg.highlight,
        text: shown,
      })
    }
  }

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, scale: 0.88, x: -6 }}
      animate={visible ? { opacity: 1, scale: 1, x: 0 } : { opacity: 0, scale: 0.88, x: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    >
      {/* Tail — matches roadmap-result: rotated div at top-left pointing toward Kibo */}
      <div
        aria-hidden="true"
        className="absolute -left-3 top-8 w-6 h-6 border-l border-t border-ig-text/10 -rotate-45"
        style={{
          background: 'rgba(252,245,238,0.05)',
          backdropFilter: 'blur(12px)',
          zIndex: -1,
        }}
      />

      {/* Bubble — matches roadmap-result header bubble exactly */}
      <div
        className="relative rounded-3xl rounded-tl-sm border border-ig-text/10 px-5 py-4 backdrop-blur-md md:px-6 md:py-5"
        style={{
          background: 'rgba(252,245,238,0.05)',
          boxShadow: '0 8px 32px -12px rgba(0,0,0,0.2)',
        }}
        role="status"
        aria-live="polite"
      >
        <p className="sr-only">{fullText}</p>
        <div
          aria-hidden="true"
          className="min-h-[3.75rem] text-pretty font-display text-[15px] font-medium leading-relaxed text-ig-text md:min-h-[3.5rem] md:text-base lg:text-lg"
        >
          <AnimatePresence mode="wait" initial={false}>
            {typing ? (
              <motion.div key="dots" exit={{ opacity: 0, transition: { duration: 0.1 } }}>
                <TypingDots />
              </motion.div>
            ) : (
              <motion.span key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {renderedSegments.map((seg) =>
                  seg.highlight ? (
                    <strong key={seg.key} className="text-ig-cyan-soft font-bold">
                      {seg.text}
                    </strong>
                  ) : (
                    <span key={seg.key}>{seg.text}</span>
                  )
                )}
                {!done && (
                  <span className="ml-0.5 inline-block h-[1em] w-[3px] translate-y-[3px] animate-pulse rounded-full bg-ig-cyan" />
                )}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}