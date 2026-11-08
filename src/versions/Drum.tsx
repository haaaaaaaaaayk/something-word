import { animate, motion, useMotionValue, useTransform, type MotionValue } from 'motion/react'
import { useEffect } from 'react'
import { SLOW, WORDS, useReducedMotion, useWordCycle } from '../words'
import { WordButton } from '../Word'
import { Focus } from './Focus'

/* The words sit on a cylinder, STEP degrees apart. RADIUS is set so neighbouring words sit one line (28px)
   apart where they cross the front: r = (28 / 2) / tan(STEP / 2). */
const STEP = 36
const RADIUS = 14 / Math.tan(((STEP / 2) * Math.PI) / 180) // ≈ 43px

export interface DrumConfig {
  /** a window exactly one line tall with soft edges, like the Ticker */
  clip?: boolean
  /** blur that grows as a word turns away from you, up to this many px */
  blur?: number
  /** spring bounce; 0 settles without overshoot */
  bounce?: number
}

/**
 * Drum. A cylinder seen head-on from a fixed point. Going forward it turns toward you: the next word comes over
 * the top, foreshortened as it tilts into view, while the current one tips down and away underneath. Going back
 * turns it the other way. One rotation on a spring (interruptible: it reverses mid-turn without a seam), the drum
 * pulled back by its radius so the front word is exactly its normal size, and each word's opacity follows its
 * angle so at rest only the front word shows. Reduced motion falls back to a crossfade.
 */
export function Drum(c: DrumConfig) {
  const reduced = useReducedMotion()
  if (reduced) return <Focus />
  return <DrumInner {...c} />
}

function DrumInner({ clip, blur = 0, bounce = 0 }: DrumConfig) {
  const { index, handlers } = useWordCycle()
  const rot = useMotionValue(0) // degrees the drum has turned; word i faces you at i * STEP
  useEffect(() => {
    const a = animate(rot, index * STEP, { type: 'spring', bounce, visualDuration: 0.42 * SLOW })
    return () => a.stop()
  }, [index, bounce, rot])
  const drum = useTransform(rot, (r) => `translateZ(${-RADIUS}px) rotateX(${-r}deg)`)

  return (
    <WordButton fit={WORDS[index]} handlers={handlers} className={`drum${clip ? ' clip' : ''}`}>
      <span className="stage">
        <motion.span className="cyl" style={{ transform: drum }}>
          {WORDS.map((w, i) => (
            <Face key={w} word={w} i={i} rot={rot} blur={blur} />
          ))}
        </motion.span>
      </span>
    </WordButton>
  )
}

function Face({ word, i, rot, blur }: { word: string; i: number; rot: MotionValue<number>; blur: number }) {
  // how far this word is from facing you, in steps: 0 in front, ±1 one word above or below
  const away = useTransform(rot, (r) => Math.abs(i * STEP - r) / STEP)
  const opacity = useTransform(away, (a) => Math.max(0, 1 - a))
  const filter = useTransform(away, (a) => (blur ? `blur(${Math.min(1, a) * blur}px)` : 'none'))
  return (
    <motion.span
      className="face"
      style={{ transform: `rotateX(${i * STEP}deg) translateZ(${RADIUS}px)`, opacity, filter }}
    >
      {word}
    </motion.span>
  )
}
