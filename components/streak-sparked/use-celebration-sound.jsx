'use client'

import { useCallback, useRef, useState } from 'react'

export function useCelebrationSound() {
  const ctxRef = useRef(null)
  const chargeRef = useRef(null)
  const mutedRef = useRef(false)
  const [muted, setMuted] = useState(false)

  const getCtx = useCallback(() => {
    if (mutedRef.current || typeof window === 'undefined') return null
    if (!ctxRef.current) {
      const AC = window.AudioContext ?? window.webkitAudioContext
      if (!AC) return null
      ctxRef.current = new AC()
    }
    if (ctxRef.current.state === 'suspended') void ctxRef.current.resume()
    return ctxRef.current
  }, [])

  const tone = useCallback(
    (ctx, freq, at, dur, type = 'triangle', peak = 0.1) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(freq, at)
      gain.gain.setValueAtTime(0.0001, at)
      gain.gain.exponentialRampToValueAtTime(peak, at + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.0001, at + dur)
      osc.connect(gain).connect(ctx.destination)
      osc.start(at)
      osc.stop(at + dur + 0.05)
    },
    [],
  )

  const stopCharge = useCallback(() => {
    const node = chargeRef.current
    const ctx = ctxRef.current
    if (!node || !ctx) return
    const now = ctx.currentTime
    node.gain.gain.cancelScheduledValues(now)
    node.gain.gain.setTargetAtTime(0.0001, now, 0.04)
    node.osc.stop(now + 0.2)
    chargeRef.current = null
  }, [])

  const startCharge = useCallback(
    (duration, progress) => {
      stopCharge()
      const ctx = getCtx()
      if (!ctx) return
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(180 + progress * 460, now)
      osc.frequency.exponentialRampToValueAtTime(640, now + duration)
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.05, now + 0.08)
      osc.connect(gain).connect(ctx.destination)
      osc.start(now)
      chargeRef.current = { osc, gain }
    },
    [getCtx, stopCharge],
  )

  const reveal = useCallback(() => {
    stopCharge()
    const ctx = getCtx()
    if (!ctx) return
    const now = ctx.currentTime
    ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(ctx, f, now + i * 0.085, 0.5, 'triangle', 0.12))
    ;[2093, 2637, 3136].forEach((f, i) => tone(ctx, f, now + 0.38 + i * 0.06, 0.35, 'sine', 0.03))
  }, [getCtx, stopCharge, tone])

  const pop = useCallback(() => {
    const ctx = getCtx()
    if (!ctx) return
    const now = ctx.currentTime
    tone(ctx, 784, now, 0.16, 'square', 0.04)
    tone(ctx, 1175, now + 0.08, 0.4, 'triangle', 0.1)
  }, [getCtx, tone])

  const toggleMute = useCallback(() => {
    mutedRef.current = !mutedRef.current
    if (mutedRef.current) stopCharge()
    setMuted(mutedRef.current)
  }, [stopCharge])

  return { muted, toggleMute, startCharge, stopCharge, reveal, pop }
}
