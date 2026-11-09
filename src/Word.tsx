import { forwardRef, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { ASKS, WORDS } from './words'

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
 * The slot is fixed at the widest word it will show, so the sentence never reflows or wraps mid-animation.
 * Screen readers get the full meaning once, as the label, instead of hearing every change.
 */
export const WordButton = forwardRef<HTMLButtonElement, Props>(function WordButton(
  { children, handlers, className = '', extra, fit, ...rest },
  ref,
) {
  /* The slot is as wide as the widest thing it will ever show, measured once, so the sentence around it never
     reflows or wraps while the word changes. Correction shows "rest + ask" side by side, so it measures those. */
  const measure = useRef<HTMLSpanElement>(null)
  const [width, setWidth] = useState<number | null>(null)
  const candidates = className.includes('correction') ? ASKS.map((a) => `${WORDS[0]} ${a}`).concat(WORDS[0]) : WORDS
  useLayoutEffect(() => {
    if (fit === undefined || !measure.current) return
    setWidth(Math.max(...Array.from(measure.current.children, (c) => (c as HTMLElement).offsetWidth)))
  }, [fit === undefined])

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
        style={width === null ? undefined : { width }}
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
          {candidates.map((c) => (
            <span key={c} style={{ display: 'block' }}>{c}</span>
          ))}
        </span>
      )}
      {extra}
    </button>
  )
})
