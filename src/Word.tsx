import { forwardRef, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { ASKS, WORDS, useReducedMotion } from './words'

type Props = {
  children: ReactNode
  handlers: Record<string, unknown>
  className?: string
  extra?: ReactNode
  /** the text currently showing; the slot springs to its width so the rest of the sentence follows.
      Leave it out to keep the slot as wide as the longest word (Scrub, whose stops must not move). */
  fit?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement> & { [k: `data-${string}`]: unknown }

/**
 * The word as a button inside the sentence. Every word is mounted in one grid cell, so swaps never stack.
 * The slot's width follows the word on a critically damped spring: the period and whatever comes after slide
 * along instead of jumping, and no gap is left behind a short word. Animating width is a layout property,
 * accepted here because it's one inline box on a once-a-visit interaction; reduced motion snaps it.
 * Screen readers get the full meaning once, as the label, instead of hearing every change.
 */
export const WordButton = forwardRef<HTMLButtonElement, Props>(function WordButton(
  { children, handlers, className = '', extra, fit, ...rest },
  ref,
) {
  const reduced = useReducedMotion()
  const measure = useRef<HTMLSpanElement>(null)
  const [width, setWidth] = useState<number | null>(null)
  useLayoutEffect(() => {
    if (fit !== undefined && measure.current) setWidth(measure.current.offsetWidth)
  }, [fit])

  return (
    <button
      ref={ref}
      type="button"
      className={`word ${className}`}
      aria-label={`${WORDS[0]}: ${ASKS.join(', ')}`}
      {...handlers}
      {...rest}
    >
      <motion.span
        className="cell"
        aria-hidden="true"
        initial={false}
        animate={width === null ? undefined : { width }}
        transition={reduced ? { duration: 0 } : { type: 'spring', bounce: 0, visualDuration: 0.3 }}
      >
        {fit === undefined &&
          WORDS.map((w) => (
            <span key={w} className="sizer">
              {w}
            </span>
          ))}
        {children}
      </motion.span>
      {fit !== undefined && (
        <span ref={measure} className="measure" aria-hidden="true">
          {fit}
        </span>
      )}
      {extra}
    </button>
  )
})
