import { motion } from 'motion/react'
import { WORDS, useReducedMotion, useWordCycle } from '../words'
import { WordButton } from '../Word'
import { Focus } from './Focus'

/**
 * 1 · Ticker. The words roll up through a one-line window like a price board: asking for something is a
 * transaction, and the ticker is how prices read. Forward rolls up, back to "something" rolls down
 * (direction-aware), on a critically damped spring so a mid-roll leave turns around without a seam.
 */
export function Ticker() {
  const reduced = useReducedMotion()
  const { index, handlers } = useWordCycle()
  if (reduced) return <Focus />
  return (
    <WordButton fit={WORDS[index]} handlers={handlers} className="ticker">
      <span className="window">
        <motion.span
          className="reel"
          initial={false}
          animate={{ transform: `translateY(${-index * 25}%)` }}
          transition={{ type: 'spring', bounce: 0, visualDuration: 0.4 }}
        >
          {WORDS.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </motion.span>
      </span>
    </WordButton>
  )
}
