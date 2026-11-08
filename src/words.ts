import { useCallback, useEffect, useRef, useState } from 'react'

/** "something" is what the sentence says; the other three are what it means. */
export const WORDS = ['something', 'money', 'data', 'attention'] as const
export const ASKS = WORDS.slice(1)

/** Long enough to read a short word, short enough that three feel like one gesture. */
export const HOLD_MS = 720

/**
 * Shared behaviour for every version.
 * - Mouse hover: turns into money at once (no delay on the input path), then data, then attention, and holds.
 *   Leaving goes back to "something" from wherever it is, so it can be interrupted at any point.
 * - Click / tap / Enter: steps to the next word and stops the autoplay; it's how touch screens get it.
 * Touch never triggers the hover path, so a tap doesn't start a sequence and immediately end it.
 */
export function useWordCycle() {
  const [index, setIndex] = useState(0)
  const timers = useRef<number[]>([])
  const clear = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }
  useEffect(() => clear, [])

  const onPointerEnter = useCallback((e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    clear()
    setIndex(1)
    timers.current = [2, 3].map((n, k) => window.setTimeout(() => setIndex(n), HOLD_MS * (k + 1)))
  }, [])
  const onPointerLeave = useCallback((e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    clear()
    setIndex(0)
  }, [])
  const onClick = useCallback(() => {
    clear()
    setIndex((i) => (i + 1) % WORDS.length)
  }, [])

  return { index, setIndex, clear, handlers: { onPointerEnter, onPointerLeave, onClick } }
}

/** prefers-reduced-motion, live */
export function useReducedMotion() {
  const q = '(prefers-reduced-motion: reduce)'
  const [reduced, setReduced] = useState(() => matchMedia(q).matches)
  useEffect(() => {
    const m = matchMedia(q)
    const on = () => setReduced(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return reduced
}
