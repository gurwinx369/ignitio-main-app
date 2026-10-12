'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'

export function BrewCta({
  visible,
  onHoverStart,
  onHoverEnd,
  onStart,
  href,
}) {
  const router = useRouter()

  function handleClick() {
    onStart?.()
    if (href) {
      // Short delay so Kibo's "excited" animation plays before navigation
      setTimeout(() => router.push(href), 420)
    }
  }

  return (
    <motion.div
      className="flex w-full justify-center"
      initial={{ opacity: 0, y: 30 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <button
        type="button"
        onClick={handleClick}
        onPointerEnter={onHoverStart}
        onPointerLeave={onHoverEnd}
        onFocus={onHoverStart}
        onBlur={onHoverEnd}
        className="group relative flex h-12 w-full max-w-md items-center justify-center gap-3 overflow-hidden rounded-2xl bg-brew font-display text-base font-bold uppercase tracking-wide text-[#04121F] shadow-[0_4px_0_0_var(--brew-deep)] transition-[transform,box-shadow] duration-100 hover:brightness-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brew/40 active:translate-y-[4px] active:shadow-[0_0_0_0_var(--brew-deep)] md:h-14 md:text-lg"
      >
        <span
          aria-hidden="true"
          className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 animate-shine bg-white/35"
        />
        <span className="relative">Brew my first cup</span>
      </button>
    </motion.div>
  )
}