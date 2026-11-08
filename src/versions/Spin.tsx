import { animate, motion, useMotionValue, useMotionValueEvent, useTransform, useVelocity, type MotionValue } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { SLOW, useHoverZone, useReducedMotion } from '../words'
import { WordButton } from '../Word'

/** This one rests on "information" instead of "something". */
const SPIN_WORDS = ['information', 'money', 'data', 'attention'] as const

/* A full ring: 12 faces 30° apart, each word three times, so the drum can spin forever. RADIUS puts
   neighbouring words one line (28px) apart where they cross the front: r = (28 / 2) / tan(STEP / 2). */
const STEP = 30
const FACES = 360 / STEP
const RADIUS = 14 / Math.tan(((STEP / 2) * Math.PI) / 180) // ≈ 52px
const LOOP_EVERY = 1200 // ms per word in the loop: a 0.5s turn, then 0.7s at rest to read it
const wordAt = (angle: number) => SPIN_WORDS[(((Math.round(angle / STEP) % FACES) + FACES) % FACES) % SPIN_WORDS.length]

/* the fast spin: a big turn on a spring that doesn't bounce, so it starts quick and slows into place */
const SPIN = { type: 'spring' as const, bounce: 0, visualDuration: 0.9 * SLOW }
const TURN = { type: 'spring' as const, bounce: 0, visualDuration: 0.5 * SLOW }

/**
 * D4 · Spin. Hover and the drum whips round a full turn and slows onto "money", then loops on its own, one word
 * every 1.2s, for as long as you stay. Leave and it whips round again, at least a full turn, and lands back on
 * "information". It blurs in proportion to its speed, up to 3px, so the fast spins smear like real motion and
 * the slow loop stays sharp. Every turn starts from the drum's current angle and velocity, so leaving mid-spin
 * carries the momentum into the spin back. Touch: tap to start, tap again to stop.
 * Reduced motion: no spin, the words crossfade in the same loop.
 */
export function Spin() {
  const reduced = useReducedMotion()
  const rot = useMotionValue(0) // degrees turned; the face at angle a is in front when rot ≡ a
  const [target, setTarget] = useState<string>(SPIN_WORDS[0]) // the word it's heading for: the width fits this
  const [on, setOn] = useState(false)
  const active = useRef(false) // read synchronously by the loop, unlike state
  const timer = useRef(0)
  const anim = useRef<{ stop: () => void } | null>(null)

  const go = (to: number, t: typeof SPIN) => {
    anim.current?.stop()
    setTarget(wordAt(to))
    if (reduced) rot.set(to)
    else anim.current = animate(rot, to, t)
  }
  const nearest = () => Math.round(rot.get() / STEP) * STEP
  // the loop: a turn, a rest, the next turn; each step schedules the next and checks it's still wanted
  const tick = () => {
    if (!active.current) return
    go(nearest() + STEP, TURN)
    timer.current = window.setTimeout(tick, LOOP_EVERY * SLOW)
  }
  const start = () => {
    active.current = true
    setOn(true)
    clearTimeout(timer.current)
    go(nearest() + 360 + STEP, SPIN) // one full turn plus a step, onto the next word
    timer.current = window.setTimeout(tick, (900 + LOOP_EVERY - 500) * SLOW) // first loop turn once the spin has landed and rested
  }
  const stop = () => {
    active.current = false
    setOn(false)
    clearTimeout(timer.current)
    const cycle = STEP * SPIN_WORDS.length // at least a full turn, onto the next "information" face
    go(Math.ceil((rot.get() + 360) / cycle) * cycle, SPIN)
  }
  useEffect(() => () => (clearTimeout(timer.current), anim.current?.stop()), [])

  const onPointerEnter = useHoverZone({ onEnter: start, onLeave: stop })

  const drum = useTransform(rot, (r) => `translateZ(${-RADIUS}px) rotateX(${-r}deg)`)
  const speed = useVelocity(rot) // degrees per second
  const blur = useTransform(speed, (v) => (reduced ? 'none' : `blur(${Math.min(3, Math.abs(v) / 500).toFixed(2)}px)`))

  return (
    <WordButton
      fit={target}
      handlers={{ onPointerEnter, onClick: () => (on ? stop() : start()) }}
      className="drum spin"
      aria-label="information: money, data, attention"
    >
      <motion.span className="stage" style={{ filter: blur }}>
        <motion.span className="cyl" style={{ transform: drum }}>
          {Array.from({ length: FACES }, (_, k) => (
            <Face key={k} k={k} rot={rot} reduced={reduced} />
          ))}
        </motion.span>
      </motion.span>
    </WordButton>
  )
}

function Face({ k, rot, reduced }: { k: number; rot: MotionValue<number>; reduced: boolean }) {
  const angle = k * STEP
  // how far this face is from the front, in steps, the short way round
  const away = useTransform(rot, (r) => {
    const d = (((angle - r) % 360) + 540) % 360 - 180
    return Math.abs(d) / STEP
  })
  const opacity = useTransform(away, (a) => Math.max(0, 1 - a))
  const [, force] = useState(0)
  useMotionValueEvent(rot, 'change', () => reduced && force((n) => n + 1))
  return (
    <motion.span
      className="face"
      style={{
        transform: reduced ? 'none' : `rotateX(${angle}deg) translateZ(${RADIUS}px)`,
        opacity: reduced ? (Math.round(rot.get() / STEP) % FACES === k ? 1 : 0) : opacity,
        transition: reduced ? 'opacity 200ms ease' : undefined,
      }}
    >
      {SPIN_WORDS[k % SPIN_WORDS.length]}
    </motion.span>
  )
}
