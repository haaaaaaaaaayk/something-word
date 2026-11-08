import type { ComponentType } from 'react'
import { Ticker } from './versions/Ticker'
import { Focus } from './versions/Focus'
import { Decode } from './versions/Decode'
import { Correction } from './versions/Correction'
import { Scrub } from './versions/Scrub'

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
]

export function App() {
  return (
    <main>
      <header>
        <h1>Something</h1>
        <p>
          Five ways the word turns into what a product actually asks for. Hover the word with a mouse: it becomes
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
    </main>
  )
}
