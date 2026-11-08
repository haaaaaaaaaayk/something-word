import type { ComponentType } from 'react'
import { Ticker } from './versions/Ticker'
import { Focus } from './versions/Focus'
import { Decode } from './versions/Decode'
import { Correction } from './versions/Correction'
import { Scrub } from './versions/Scrub'
import { Drop } from './versions/Drop'
import { Swap, type SwapConfig } from './versions/Swap'
import { Drum, type DrumConfig } from './versions/Drum'
import { Spin } from './versions/Spin'

const VERSIONS: { n: number; name: string; idea: string; recipe: string; Demo: ComponentType }[] = [
  {
    n: 1,
    name: 'Ticker',
    idea: 'Asking is a transaction, so the words roll past like a price board.',
    recipe: 'Motion spring, no bounce, 0.4s · translateY in a one-line window · rolls back down on leave',
    Demo: Ticker,
  },
  {
    n: 2,
    name: 'Focus',
    idea: '“Something” is soft focus. Hover pulls the real ask sharp.',
    recipe: 'CSS crossfade in one cell · 4px blur + 0.98 scale · 240ms in, 160ms out',
    Demo: Focus,
  },
  {
    n: 3,
    name: 'Decode',
    idea: 'The vague word is decrypted into what it hides.',
    recipe: 'Text morph · letters resolve left to right, 32ms apart · rAF writes to the DOM, no re-renders',
    Demo: Decode,
  },
  {
    n: 4,
    name: 'Correction',
    idea: 'An editor strikes the euphemism and writes the honest word after it.',
    recipe: 'Line drawing, 200ms ease-out · wipes off to the right · slot grows to fit both, the ask rises in 4px',
    Demo: Correction,
  },
  {
    n: 5,
    name: 'Scrub',
    idea: 'The visitor sets the price: slide across the word to pick what is asked.',
    recipe: 'Direct manipulation, 1:1 with the pointer · three stops · dot on a 0.2s spring · direction-aware slide',
    Demo: Scrub,
  },
  {
    n: 6,
    name: 'Drop',
    idea: 'Each ask falls into the slot from above while the last one falls out the bottom.',
    recipe: 'AnimatePresence popLayout · 60% travel + 4px blur · 240ms in, 160ms out · rises back on leave',
    Demo: Drop,
  },
]

/* Variations on Drop: each changes one thing you can see */
/* The Ticker, turned into a drum seen from a fixed point: new words come over the top, old ones tip down */
const DRUMS: { name: string; tag: string; idea: string; recipe: string; config: DrumConfig }[] = [
  { name: 'Drum', tag: 'clipped', idea: 'The Ticker as a real cylinder: the next word turns over the top toward you, the last tips down and away, all inside one line.',
    recipe: '36° apart on a 43px radius · spring, no bounce, 0.42s · one-line window with soft edges', config: { clip: true } },
  { name: 'Drum, open', tag: 'open', idea: 'No window: you watch the word come over the top of the drum while the old one rolls under.',
    recipe: 'same drum · opacity follows the angle, so only the front word shows at rest', config: {} },
  { name: 'Drum, blur', tag: 'open + blur', idea: 'Open, and words soften as they turn away, like a lens focused on the front of the drum.',
    recipe: 'same drum · blur grows with the angle, up to 3px', config: { blur: 3 } },
]

const DROPS: { name: string; tag: string; idea: string; recipe: string; config: SwapConfig }[] = [
  { name: 'Drop, no blur', tag: 'no blur', idea: 'Drop exactly, minus the blur: crisper, more mechanical.',
    recipe: '60% travel · 240ms in, 160ms out', config: { from: 'top', travel: 60, blur: 0 } },
  { name: 'Slot', tag: 'blur', idea: 'A full line of travel through a one-line window, so words never cross the text around them.',
    recipe: 'clipped window, soft edges · 100% travel · 4px blur', config: { from: 'top', travel: 100, blur: 4, clip: true } },
  { name: 'Slot, crisp', tag: 'no blur', idea: 'The slot without blur: a split-second slot machine.',
    recipe: 'clipped window · 100% travel', config: { from: 'top', travel: 100, blur: 0, clip: true } },
  { name: 'Rise', tag: 'blur', idea: 'The reference’s direction: asks come up from below, the old one leaves upward.',
    recipe: 'from below · 60% travel · 4px blur', config: { from: 'bottom', travel: 60, blur: 4 } },
  { name: 'Rise, crisp', tag: 'no blur', idea: 'Rising, without blur.',
    recipe: 'from below · 60% travel', config: { from: 'bottom', travel: 60, blur: 0 } },
  { name: 'Rain', tag: 'blur', idea: 'Letters fall in one after another, left to right, and fall out the same way.',
    recipe: 'per-letter stagger 20ms · 80% travel · 3px blur', config: { from: 'top', travel: 80, blur: 3, stagger: 0.02 } },
  { name: 'Rain, crisp', tag: 'no blur', idea: 'Letter by letter, without blur: reads as typed rather than poured.',
    recipe: 'per-letter stagger 20ms · 80% travel', config: { from: 'top', travel: 80, blur: 0, stagger: 0.02 } },
  { name: 'Land', tag: 'no blur', idea: 'Each ask lands with a little weight: a spring that dips past the line and settles.',
    recipe: 'spring, bounce 0.3, 0.32s · 70% travel', config: { from: 'top', travel: 70, blur: 0, bounce: 0.3, enter: 0.32 } },
  { name: 'Depth', tag: 'blur', idea: 'No falling: the new word comes toward you out of focus, the old one sinks back.',
    recipe: 'scale 1.2 → 1, old to 0.85 · 6px blur · 280ms', config: { from: 'top', travel: 0, blur: 6, depth: true, enter: 0.28 } },
]

export function App() {
  return (
    <main>
      <header>
        <h1>Something</h1>
        <p>
          Ways the word turns into what a product actually asks for. Hover the word with a mouse: it becomes
          money, then data, then attention. Click or tap it to step through.
        </p>
      </header>
      {VERSIONS.map(({ n, name, idea, recipe, Demo }) => (
        <section key={n} className="card">
          <div className="meta">
            <span className="n">{n}</span>
            <h2>{name}</h2>
          </div>
          <p className="sentence">
            I design the moments where a product asks people for{' '}
            <span className="nowrap">
              <Demo />.
            </span>
          </p>
          <p className="idea">{idea}</p>
          <p className="recipe">{recipe}</p>
        </section>
      ))}
      <header className="group">
        <h1>Drum</h1>
        <p>The Ticker, turned into a cylinder seen from a fixed point: new words come over the top, old ones tip down.</p>
      </header>
      {DRUMS.map(({ name, tag, idea, recipe, config }, i) => (
        <section key={name} className="card">
          <div className="meta">
            <span className="n">{'D' + (i + 1)}</span>
            <h2>{name}</h2>
            <span className="tag">{tag}</span>
          </div>
          <p className="sentence">
            I design the moments where a product asks people for{' '}
            <span className="nowrap">
              <Drum {...config} />.
            </span>
          </p>
          <p className="idea">{idea}</p>
          <p className="recipe">{recipe}</p>
        </section>
      ))}
      <section className="card">
        <div className="meta">
          <span className="n">D4</span>
          <h2>Spin</h2>
          <span className="tag">open + speed blur</span>
        </div>
        <p className="sentence">
          I design the moments where a product asks people for{' '}
          <span className="nowrap">
            <Spin />.
          </span>
        </p>
        <p className="idea">Hover: the drum whips round and slows onto money, then loops for as long as you stay. Leave: it whips round again and lands on information.</p>
        <p className="recipe">12 faces, 30° apart, 52px radius · spin = full turn on a 0.9s spring · loop = 0.5s turn + 0.7s rest · blur follows speed, up to 3px</p>
      </section>
      <header className="group">
        <h1>Drop, nine ways</h1>
        <p>Variations on 6. Each one changes a single thing, so the difference is what you see.</p>
      </header>
      {DROPS.map(({ name, tag, idea, recipe, config }, i) => (
        <section key={name} className="card">
          <div className="meta">
            <span className="n">{7 + i}</span>
            <h2>{name}</h2>
            <span className="tag">{tag}</span>
          </div>
          <p className="sentence">
            I design the moments where a product asks people for{' '}
            <span className="nowrap">
              <Swap {...config} />.
            </span>
          </p>
          <p className="idea">{idea}</p>
          <p className="recipe">{recipe}</p>
        </section>
      ))}
    </main>
  )
}
