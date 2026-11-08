import { AnimatePresence, motion, type Transition } from 'motion/react'
import { useState } from 'react'
import { WORDS, useReducedMotion, useWordCycle } from '../words'
import { WordButton } from '../Word'

const EASE_OUT = [0.23, 1, 0.32, 1] as const

/** What a variation changes. Everything else (hover, tap, width fitting, reduced motion) is shared. */
export interface SwapConfig {
  /** where the new word comes from going forward; going back reverses it */
  from: 'top' | 'bottom'
  /** distance travelled, % of the word's own height */
  travel: number
  /** px of blur at the start and end of the trip; 0 for none */
  blur: number
  /** a window exactly one line tall, with soft edges, so words pass through a slot instead of over the text */
  clip?: boolean
  /** each letter moves on its own, this many seconds apart */
  stagger?: number
  /** enter on a spring with this bounce instead of a tween */
  bounce?: number
  /** scale instead of travel: the new word comes from in front (1.2), the old one sinks behind (0.85) */
  depth?: boolean
  /** a 3D flip around the horizontal axis, like a split-flap drum */
  flip?: boolean
  /** seconds */
  enter?: number
  exit?: number
}

export function Swap(c: SwapConfig) {
  const reduced = useReducedMotion()
  const { index, handlers } = useWordCycle()
  // direction of the last change, derived during render (React's pattern for state from the previous value)
  const [seen, setSeen] = useState({ index, dir: 1 })
  if (seen.index !== index) setSeen({ index, dir: index > seen.index ? 1 : -1 })
  const dir = seen.index !== index ? (index > seen.index ? 1 : -1) : seen.dir
  const sign = c.from === 'top' ? 1 : -1 // forward motion is downward when words come from the top

  const enterT: Transition = c.bounce
    ? { type: 'spring', bounce: c.bounce, visualDuration: c.enter ?? 0.32 }
    : { duration: c.enter ?? 0.24, ease: EASE_OUT }
  const exitT: Transition = { duration: c.exit ?? 0.16, ease: EASE_OUT }
  const blur = (px: number) => (px ? { filter: `blur(${px}px)` } : {})

  // the off-stage pose; d = +1 below the line, -1 above it
  const off = (d: number) => {
    if (reduced) return { opacity: 0 }
    if (c.depth) return { opacity: 0, transform: `scale(${d > 0 ? 0.85 : 1.2})`, ...blur(c.blur) }
    if (c.flip)
      return { opacity: 0, transform: `perspective(240px) rotateX(${-d * 80}deg) translateY(${d * 30}%)`, ...blur(c.blur) }
    return { opacity: 0, transform: `translateY(${d * c.travel}%)`, ...blur(c.blur) }
  }
  const on = reduced
    ? { opacity: 1 }
    : {
        opacity: 1,
        transform: c.depth ? 'scale(1)' : c.flip ? 'perspective(240px) rotateX(0deg) translateY(0%)' : 'translateY(0%)',
        ...(c.blur ? { filter: 'blur(0px)' } : {}),
      }
  // depth: the new word comes from in front (-1 side), the old sinks behind (+1 side), whichever the direction
  const enterFrom = (d: number) => (c.depth ? -1 : -d * sign)
  const exitTo = (d: number) => (c.depth ? 1 : d * sign)

  const word = WORDS[index]
  const letters = !!c.stagger && !reduced
  const item = {
    enter: (d: number) => off(enterFrom(d)),
    center: { ...on, transition: reduced ? { duration: 0.2 } : enterT },
    exit: (d: number) => ({ ...off(exitTo(d)), transition: reduced ? { duration: 0.16 } : exitT }),
  }

  return (
    <WordButton fit={word} handlers={handlers} className={`swap${c.clip ? ' clip' : ''}${c.flip ? ' flip' : ''}`}>
      <span className="track">
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          {letters ? (
            <motion.span
              key={word}
              className="layer letters"
              custom={dir}
              initial="enter"
              animate="center"
              exit="exit"
              variants={{
                enter: {},
                center: { transition: { staggerChildren: c.stagger } },
                exit: { transition: { staggerChildren: c.stagger } },
              }}
            >
              {[...word].map((ch, i) => (
                <motion.span key={i} className="letter" custom={dir} variants={item}>
                  {ch}
                </motion.span>
              ))}
            </motion.span>
          ) : (
            <motion.span key={word} className="layer" custom={dir} variants={item} initial="enter" animate="center" exit="exit">
              {word}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </WordButton>
  )
}
