'use client'

import { useCallback, useRef, useState } from 'react'

export function useFreezeSound() {
  const ctxRef = useRef(null)
  const freezeNodesRef = useRef(null)
  const crackleIntervalRef = useRef(null)
  const noiseBufferRef = useRef(null)
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

  // Create or retrieve 2-second white-noise audio buffer
  const getNoiseBuffer = useCallback((ctx) => {
    if (noiseBufferRef.current) return noiseBufferRef.current
    const bufferSize = ctx.sampleRate * 2
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }
    noiseBufferRef.current = buffer
    return buffer
  }, [])

  const tone = useCallback(
    (ctx, freq, at, dur, type = 'sine', peak = 0.25) => {
      try {
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
      } catch {}
    },
    [],
  )

  const stopFreeze = useCallback(() => {
    if (crackleIntervalRef.current) {
      clearInterval(crackleIntervalRef.current)
      crackleIntervalRef.current = null
    }

    const nodes = freezeNodesRef.current
    const ctx = ctxRef.current
    if (!nodes || !ctx) return
    const now = ctx.currentTime
    try {
      nodes.forEach((n) => {
        if (n.gain) {
          n.gain.gain.cancelScheduledValues(now)
          n.gain.gain.setTargetAtTime(0.0001, now, 0.03)
        }
        if (n.source) {
          n.source.stop(now + 0.12)
        }
      })
    } catch {}
    freezeNodesRef.current = null
  }, [])

  // Procedural micro-crackle: sharp little ice snap
  const fireIceCrackle = useCallback(() => {
    const ctx = getCtx()
    if (!ctx) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const filter = ctx.createBiquadFilter()
    const gain = ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(1800 + Math.random() * 2400, now)
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(2600 + Math.random() * 1800, now)
    filter.Q.setValueAtTime(6, now)

    const peak = 0.07 + Math.random() * 0.04
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045)

    osc.connect(filter).connect(gain).connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.05)
  }, [getCtx])

  const startFreeze = useCallback(
    (duration, progress = 0) => {
      stopFreeze()
      const ctx = getCtx()
      if (!ctx) return
      const now = ctx.currentTime
      const activeNodes = []

      // 1. Cryo Wind Sweeping Noise (Soft ambient sweep)
      try {
        const noiseSource = ctx.createBufferSource()
        noiseSource.buffer = getNoiseBuffer(ctx)
        noiseSource.loop = true

        const noiseFilter = ctx.createBiquadFilter()
        noiseFilter.type = 'bandpass'
        noiseFilter.frequency.setValueAtTime(320 + progress * 800, now)
        noiseFilter.frequency.exponentialRampToValueAtTime(2600, now + duration)
        noiseFilter.Q.setValueAtTime(3.4, now)

        const noiseGain = ctx.createGain()
        noiseGain.gain.setValueAtTime(0.0001, now)
        noiseGain.gain.exponentialRampToValueAtTime(0.13, now + 0.08)

        noiseSource.connect(noiseFilter).connect(noiseGain).connect(ctx.destination)
        noiseSource.start(now)
        activeNodes.push({ source: noiseSource, gain: noiseGain })
      } catch {}

      // 2. Dual Crystalline Resonator Tones (Gentle harmonic slide)
      try {
        const osc1 = ctx.createOscillator()
        const osc2 = ctx.createOscillator()
        const oscGain = ctx.createGain()

        osc1.type = 'triangle'
        osc2.type = 'sawtooth'

        osc1.frequency.setValueAtTime(240 + progress * 400, now)
        osc1.frequency.exponentialRampToValueAtTime(880, now + duration)

        osc2.frequency.setValueAtTime(482 + progress * 800, now)
        osc2.frequency.exponentialRampToValueAtTime(1764, now + duration)

        const toneFilter = ctx.createBiquadFilter()
        toneFilter.type = 'lowpass'
        toneFilter.frequency.setValueAtTime(1200, now)
        toneFilter.frequency.exponentialRampToValueAtTime(3000, now + duration)

        oscGain.gain.setValueAtTime(0.0001, now)
        oscGain.gain.exponentialRampToValueAtTime(0.11, now + 0.06)

        osc1.connect(toneFilter)
        osc2.connect(toneFilter)
        toneFilter.connect(oscGain).connect(ctx.destination)

        osc1.start(now)
        osc2.start(now)
        activeNodes.push({ source: osc1, gain: oscGain })
        activeNodes.push({ source: osc2, gain: null })
      } catch {}

      freezeNodesRef.current = activeNodes

      // 3. Periodic procedural ice crackle clicks
      crackleIntervalRef.current = setInterval(() => {
        fireIceCrackle()
      }, 190)
    },
    [getCtx, getNoiseBuffer, stopFreeze, fireIceCrackle],
  )

  const freezeShatter = useCallback(() => {
    stopFreeze()
    const ctx = getCtx()
    if (!ctx) return
    const now = ctx.currentTime

    // 1. Ice Snap Impact (Gentle highpass noise transient)
    try {
      const snapSource = ctx.createBufferSource()
      snapSource.buffer = getNoiseBuffer(ctx)
      const snapFilter = ctx.createBiquadFilter()
      snapFilter.type = 'highpass'
      snapFilter.frequency.setValueAtTime(2200, now)
      const snapGain = ctx.createGain()
      snapGain.gain.setValueAtTime(0.0001, now)
      snapGain.gain.exponentialRampToValueAtTime(0.18, now + 0.01)
      snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25)
      snapSource.connect(snapFilter).connect(snapGain).connect(ctx.destination)
      snapSource.start(now)
      snapSource.stop(now + 0.26)
    } catch {}

    // 2. Solidification Sub-Punch (Warm base, no harsh spike)
    try {
      const sub = ctx.createOscillator()
      const subGain = ctx.createGain()
      sub.type = 'sine'
      sub.frequency.setValueAtTime(150, now)
      sub.frequency.exponentialRampToValueAtTime(50, now + 0.35)
      subGain.gain.setValueAtTime(0.0001, now)
      subGain.gain.exponentialRampToValueAtTime(0.16, now + 0.02)
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38)
      sub.connect(subGain).connect(ctx.destination)
      sub.start(now)
      sub.stop(now + 0.4)
    } catch {}

    // 3. Crystal Ice Bell Chords (Delicate, sparkling chime)
    ;[1318.5, 1661.2, 1975.5, 2637.0, 3951.0].forEach((f, i) => {
      tone(ctx, f, now + i * 0.035, 0.55, 'sine', 0.12)
    })
    tone(ctx, 4400, now + 0.12, 0.35, 'triangle', 0.07)
  }, [getCtx, getNoiseBuffer, stopFreeze, tone])

  const shieldImpact = useCallback(() => {
    const ctx = getCtx()
    if (!ctx) return
    const now = ctx.currentTime

    // Resonant Metallic Shield Lock Thud (Clean, non-jarring impact)
    tone(ctx, 95, now, 0.35, 'triangle', 0.18)
    tone(ctx, 580, now + 0.015, 0.45, 'sine', 0.12)
    tone(ctx, 1160, now + 0.04, 0.5, 'sine', 0.09)
    tone(ctx, 2320, now + 0.08, 0.35, 'sine', 0.05)
  }, [getCtx, tone])

  const toggleMute = useCallback(() => {
    mutedRef.current = !mutedRef.current
    if (mutedRef.current) stopFreeze()
    setMuted(mutedRef.current)
  }, [stopFreeze])

  return { muted, toggleMute, startFreeze, stopFreeze, freezeShatter, shieldImpact }
}
