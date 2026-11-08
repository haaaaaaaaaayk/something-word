import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import { ASKS, WORDS } from '../words'
import { WordButton } from '../Word'

/**
 * 5 · Scrub. The visitor sets the price: sliding across the word picks money, data or attention 1:1 with the
 * pointer, like scrubbing a dial with three stops. Three ticks under the word show the stops and a dot follows
 * on a critically damped spring. The words slide 4px in the direction you scrub (direction-aware), so going
 * back feels like going back. On touch, drag across it, or tap to step. Leaving returns to "something".
 */
export function Scrub() {
  const [stop, setStop] = useState(-1) // -1: "something"
  const ref = useRef<HTMLButtonElement>(null)
  const dragged = useRef(false)

  const pick = (clientX: number) => {
    const r = ref.current!.getBoundingClientRect()
    const f = Math.min(0.999, Math.max(0, (clientX - r.left) / r.width))
    setStop(Math.floor(f * ASKS.length))
  }
  const index = stop + 1

  return (
    <WordButton
      ref={ref}
      handlers={{
        onPointerEnter: (e: React.PointerEvent) => e.pointerType === 'mouse' && pick(e.clientX),
        onPointerMove: (e: React.PointerEvent) => {
          if (e.pointerType === 'mouse' || e.buttons) {
            if (e.pointerType !== 'mouse') dragged.current = true
            pick(e.clientX)
          }
        },
        onPointerLeave: (e: React.PointerEvent) => e.pointerType === 'mouse' && setStop(-1),
        onPointerDown: (e: React.PointerEvent) => {
          dragged.current = false
          if (e.pointerType !== 'mouse') (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
        },
        onClick: () => {
          if (dragged.current) return
          setStop((s) => (s + 1 > ASKS.length - 1 ? -1 : s + 1))
        },
      }}
      className="scrub"
      data-on={stop >= 0}
      extra={
        <span className="ticks" aria-hidden="true">
          {ASKS.map((w) => (
            <span key={w} className="tick" />
          ))}
          <motion.span
            className="dot"
            initial={false}
            animate={{ transform: `translateX(${Math.max(0, stop) * 100}%)`, opacity: stop >= 0 ? 1 : 0 }}
            transition={{ type: 'spring', bounce: 0, visualDuration: 0.2 }}
          />
        </span>
      }
    >
      {WORDS.map((w, i) => (
        <span key={w} className="layer" data-pos={i < index ? 'before' : i > index ? 'after' : 'on'}>
          {w}
        </span>
      ))}
    </WordButton>
  )
}
