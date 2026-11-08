import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { WORDS, useReducedMotion, useWordCycle } from '../words'
import { WordButton } from '../Word'

const EASE_OUT = [0.23, 1, 0.32, 1] as const

/**
 * 6 · Drop. Each ask falls into the slot from above while the one before falls out the bottom, both at once
 * (popLayout takes the leaving word out of the layout so the two overlap in one cell). A 4px blur on the way
 * in and out reads as speed, the way motion blur would, and keeps the two words from looking like a stack.
 * Fast: 240ms in, 160ms out, so the arriving word wins the eye. Going back to "something" reverses the
 * direction (it rises back up), so the path is retraced instead of the cycle continuing downward.
 * Reduced motion keeps a plain crossfade.
 */
export function Drop() {
  const reduced = useReducedMotion()
  const { index, handlers } = useWordCycle()
  // direction of the last change, derived during render (React's pattern for state from the previous value)
  const [seen, setSeen] = useState({ index, dir: 1 })
  if (seen.index !== index) setSeen({ index, dir: index > seen.index ? 1 : -1 })
  const dir = seen.index !== index ? (index > seen.index ? 1 : -1) : seen.dir // 1: falling forward, -1: rising back

  const away = (d: number) =>
    reduced ? { opacity: 0 } : { opacity: 0, transform: `translateY(${d * 60}%)`, filter: 'blur(4px)' }

  return (
    <WordButton fit={WORDS[index]} handlers={handlers} className="drop">
      <AnimatePresence mode="popLayout" initial={false} custom={dir}>
        <motion.span
          key={WORDS[index]}
          className="layer"
          custom={dir}
          variants={{
            enter: (d: number) => away(-d), // comes from above when falling, from below when rising
            center: reduced
              ? { opacity: 1, transition: { duration: 0.2 } }
              : { opacity: 1, transform: 'translateY(0%)', filter: 'blur(0px)', transition: { duration: 0.24, ease: EASE_OUT } },
            exit: (d: number) => ({ ...away(d), transition: { duration: reduced ? 0.16 : 0.16, ease: EASE_OUT } }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
        >
          {WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </WordButton>
  )
}
