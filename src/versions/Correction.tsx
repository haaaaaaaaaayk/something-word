import { ASKS, WORDS, useWordCycle } from '../words'
import { WordButton } from '../Word'

/**
 * 4 · Correction. An editor's mark on a euphemism: a line strikes through "something" (drawn left to right,
 * 200ms ease-out), the word steps back to muted, and the honest word is written right after it. The slot grows
 * to fit both, so the sentence makes room instead of the correction covering the line above. The asks
 * crossfade with a 4px rise as they change. Leaving wipes the line off to the right instead of rewinding it.
 * Reduced motion keeps only the fades.
 */
export function Correction() {
  const { index, handlers } = useWordCycle()
  const on = index > 0
  return (
    <WordButton
      fit={on ? `something ${WORDS[index]}` : 'something'}
      handlers={handlers}
      className="correction"
      data-on={on}
    >
      <span className="line">
        <span className="struck">
          something
          <span className="strike" />
        </span>
        <span className="asks">
          {ASKS.map((w, i) => (
            <span key={w} className="ask" data-on={index === i + 1}>
              {w}
            </span>
          ))}
        </span>
      </span>
    </WordButton>
  )
}
