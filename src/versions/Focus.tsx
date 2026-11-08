import { WORDS, useWordCycle } from '../words'
import { WordButton } from '../Word'

/**
 * 2 · Focus. "Something" is a soft-focus word; hovering pulls the real ask into focus. Each word is mounted in
 * the same cell and crossfades with a touch of blur (4px) and scale (0.98), so you never see two words
 * overlapping, only one sharpening out of the other. Entering eases out over 240ms, leaving is quicker (160ms).
 * Reduced motion keeps the fade and drops blur and scale (CSS).
 */
export function Focus() {
  const { index, handlers } = useWordCycle()
  return (
    <WordButton fit={WORDS[index]} handlers={handlers} className="focus">
      {WORDS.map((w, i) => (
        <span key={w} className="layer" data-on={i === index}>
          {w}
        </span>
      ))}
    </WordButton>
  )
}
