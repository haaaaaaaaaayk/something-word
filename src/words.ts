import { useCallback, useEffect, useRef, useState } from 'react'

/** "something" is what the sentence says; the other three are what it means. */
export const WORDS = ['something', 'money', 'data', 'attention'] as const
export const ASKS = WORDS.slice(1)

/** ?slow=5 plays motion five times slower, to check it frame by frame (Emil: review at 2–5× duration). */
export const SLOW = Math.max(1, Number(new URLSearchParams(location.search).get('slow')) || 1)

/** Long enough to read a short word, short enough that three feel like one gesture. */
export const HOLD_MS = 720 * SLOW

/**
 * Shared behaviour for every version.
 * - Mouse hover: turns into money at once (no delay on the input path), then data, then attention, and holds.
 *   Moving away goes back to "something" from wherever it is, so it can be interrupted at any point.
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

  /* Hovering the word starts it; only real pointer movement ends it. The word resizes as it changes and the
     sentence reflows around it, so it can slide out from under a still cursor, or the line the cursor was on can
     disappear. Element boundary events would read that as leaving, flip the word back and loop. Instead, while
     active, each pointer move checks whether the cursor is still within 8px of where the word started or where
     it is now; reflow and scroll never move the mouse, so they can't end the hover. */
  const active = useRef<(() => void) | null>(null)
  const reset = useCallback(() => {
    clear()
    active.current?.()
    active.current = null
    setIndex(0)
  }, [])
  const onPointerEnter = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType !== 'mouse' || active.current) return
      const word = e.currentTarget as HTMLElement
      let start = word.getBoundingClientRect()
      const near = (r: DOMRect, x: number, y: number) =>
        x >= r.left - 8 && x <= r.right + 8 && y >= r.top - 8 && y <= r.bottom + 8
      const move = (ev: PointerEvent) => {
        if (ev.pointerType !== 'mouse') return
        if (!near(start, ev.clientX, ev.clientY) && !near(word.getBoundingClientRect(), ev.clientX, ev.clientY)) reset()
      }
      // leaving the window: pointerleave on the root fires only then (pointerout also fires when the node under
      // the cursor is removed, which Decode does every frame)
      const root = document.documentElement
      addEventListener('pointermove', move)
      // scrolling (including the nudge when the page gets shorter as the word shrinks) isn't leaving: keep the
      // start area where it was on the page, shifted by the scroll
      let sx = scrollX, sy = scrollY
      const scrolled = () => {
        start = new DOMRect(start.x - (scrollX - sx), start.y - (scrollY - sy), start.width, start.height)
        sx = scrollX
        sy = scrollY
      }
      addEventListener('scroll', scrolled, { passive: true })
      root.addEventListener('pointerleave', reset)
      active.current = () => {
        removeEventListener('pointermove', move)
        removeEventListener('scroll', scrolled)
        root.removeEventListener('pointerleave', reset)
      }
      clear()
      setIndex(1)
      timers.current = [2, 3].map((n, k) => window.setTimeout(() => setIndex(n), HOLD_MS * (k + 1)))
    },
    [reset],
  )
  useEffect(() => () => active.current?.(), [])
  const onClick = useCallback(() => {
    clear()
    setIndex((i) => (i + 1) % WORDS.length)
  }, [])

  return { index, setIndex, clear, handlers: { onPointerEnter, onClick } }
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
