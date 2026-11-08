import { useEffect, useRef } from 'react'
import { WORDS, useReducedMotion, useWordCycle } from '../words'
import { WordButton } from '../Word'

const GLYPHS = '#%&$@<>/{}[]01'
const PER_LETTER = 32 // ms between letters resolving, left to right
const LEAD = 60 // ms of pure noise before the first letter lands

/**
 * 3 · Decode. The vague word gets decrypted into what it hides: letters scramble through symbols and resolve
 * left to right, about 350ms for the longest word. Unresolved glyphs are muted so the eye reads the resolved
 * part. Written straight to the DOM from requestAnimationFrame, never through React state, so it costs no
 * re-renders. A new target restarts from whatever is on screen. Reduced motion swaps the word instantly.
 */
export function Decode() {
  const reduced = useReducedMotion()
  const { index, handlers } = useWordCycle()
  const out = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = out.current
    if (!el) return
    const target = WORDS[index]
    if (reduced) {
      el.textContent = target
      return
    }
    const start = performance.now()
    let raf = 0
    const frame = (now: number) => {
      const t = now - start
      el.replaceChildren()
      let done = true
      for (let i = 0; i < target.length; i++) {
        const settled = t >= LEAD + i * PER_LETTER
        if (!settled) done = false
        const s = document.createElement('span')
        if (settled) s.textContent = target[i]
        else {
          s.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          s.className = 'noise'
        }
        el.append(s)
      }
      if (!done) raf = requestAnimationFrame(frame)
      else el.textContent = target
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [index, reduced])

  return (
    <WordButton fit={WORDS[index]} handlers={handlers} className="decode">
      <span className="layer" ref={out}>
        something
      </span>
    </WordButton>
  )
}
