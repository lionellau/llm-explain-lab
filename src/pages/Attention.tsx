import { useMemo, useState } from 'react'
import { ATTENTION_PUZZLES } from '../data/attention'
import JourneyNav from '../components/JourneyNav'
import StorySteps, { type Beat } from '../components/StorySteps'

function lerpColor(t: number): string {
  const r = Math.round(52  + (251 - 52)  * t)
  const g = Math.round(211 + (191 - 211) * t)
  const b = Math.round(153 + (36  - 153) * t)
  return `rgb(${r} ${g} ${b})`
}

// Beats for the demo:
//   0 - read the sentence
//   1 - the word "it" is the puzzle — focus on it
//   2 - the model "looks" at every word (fan beams, faint)
//   3 - the model decides: most attention lands on "animal"
//   4 - flip the sentence: change last word
//   5 - same model, attention now lands on "street"
//   6 - that's what attention does
//
const BEATS: Beat[] = [
  {
    caption: '"The animal didn\'t cross the street because it was too tired."',
    llmNote: 'A sentence with a tricky pronoun.',
    readingMs: 3200,
  },
  {
    caption: 'The model gets to the word "it" — and has to figure out what "it" means.',
    llmNote: 'Pronouns are ambiguous. The model can\'t move forward without resolving them.',
    readingMs: 3400,
  },
  {
    caption: 'It looks at every other word in the sentence at the same time.',
    llmNote: 'That\'s the "attention" mechanism. Every word looks at every word.',
    readingMs: 3200,
  },
  {
    caption: 'Most of its focus lands on "animal". Because "tired" only fits the animal.',
    llmNote: 'The model assigns each word a weight. Bigger = more important.',
    readingMs: 3600,
  },
  {
    caption: 'Now we change one word: "tired" → "wide".',
    llmNote: 'Same model. Same setup. One word flipped.',
    readingMs: 3000,
  },
  {
    caption: 'Now the focus moves to "street". Same word "it" — different context.',
    llmNote: 'Attention is context-sensitive. That\'s why LLMs understand meaning, not just grammar.',
    readingMs: 3800,
  },
  {
    caption: 'That\'s the whole idea of attention.',
    llmNote: 'A transformer is just dozens of these attention layers stacked on top of each other.',
    readingMs: 3000,
  },
]

const PRIMARY = ATTENTION_PUZZLES[0]  // animal + tired
const COUNTER = ATTENTION_PUZZLES[1]  // animal + wide

export default function Attention() {
  const [step, setStep] = useState(0)
  const [otherIdx, setOtherIdx] = useState<number | null>(null)

  // Pick which puzzle the visual currently shows based on beat.
  const showCounter = step >= 4
  const puzzle = otherIdx !== null
    ? ATTENTION_PUZZLES[otherIdx]
    : (showCounter ? COUNTER : PRIMARY)

  // Visual phase decides whether to dim everything, fan beams, or reveal heatmap.
  // For "watch" mode, beat drives the phase.
  // For "try another", we reveal immediately.
  type Phase = 'plain' | 'focus' | 'fan' | 'reveal'
  let phase: Phase
  if (otherIdx !== null) {
    phase = 'reveal'
  } else if (step === 0) phase = 'plain'
  else if (step === 1 || step === 4) phase = 'focus'
  else if (step === 2) phase = 'fan'
  else phase = 'reveal'

  const maxWeight = useMemo(() => Math.max(...puzzle.weights), [puzzle])

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <header className="mb-6">
        <p className="text-mint text-sm uppercase tracking-widest mb-2">Game 3 of 5 · 90 seconds</p>
        <h1 className="text-4xl font-bold mb-3">Every word looks at every word</h1>
        <p className="text-paper/70 max-w-3xl leading-relaxed">
          The trick of a transformer is something called <b>attention</b>. When the model reads a
          word, it decides which other words in the sentence to pay attention to. Watch.
        </p>
      </header>

      <div className="bg-ink-soft/60 border border-white/10 rounded-2xl p-6 mb-4">
        <div className="flex flex-wrap gap-2 mb-3 min-h-[5rem] items-center justify-center">
          {puzzle.sentence.map((w, i) => {
            const isFocus = i === puzzle.focusIdx
            const t = puzzle.weights[i] / maxWeight
            const cls = 'relative px-3 py-2 rounded-lg font-medium border transition-all duration-500'
            let style: React.CSSProperties = {}
            let extra = ''

            if (isFocus) {
              extra = ' bg-grape/30 border-grape-soft text-paper anim-pulse-glow'
            } else if (phase === 'plain') {
              extra = ' bg-white/5 border-white/10 text-paper/80'
            } else if (phase === 'focus') {
              extra = ' bg-white/5 border-white/10 text-paper/40'
            } else if (phase === 'fan') {
              extra = ' border-transparent'
              style.backgroundColor = `rgba(167, 139, 250, ${0.15 + 0.25 * t})`
              style.color = '#fdf6f0'
            } else { // reveal
              extra = ' border-transparent'
              style.backgroundColor = lerpColor(t)
              style.color = t > 0.4 ? '#0f0f1e' : '#fdf6f0'
              style.opacity = 0.45 + 0.55 * t
            }

            return (
              <div key={i} className={cls + extra} style={style}>
                {w}
                {phase === 'reveal' && !isFocus && (
                  <span className="ml-1.5 text-[10px] font-bold opacity-80">
                    {(puzzle.weights[i] * 100).toFixed(0)}%
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Beam overlay during fan phase */}
        {phase === 'fan' && (
          <div className="text-center text-xs text-paper/50 mb-2">
            ↑ scanning all words…
          </div>
        )}
      </div>

      <StorySteps
        beats={BEATS}
        accent="text-mint"
        accentBorder="border-mint/40"
        accentBg="bg-mint/10"
        onStep={setStep}
        className="mb-4"
      />

      {/* Optional: try other sentences */}
      <div className="bg-ink-soft/40 border border-white/5 rounded-xl p-4 mb-4">
        <p className="text-xs uppercase tracking-widest text-paper/50 mb-2">Try another sentence</p>
        <div className="flex flex-wrap gap-2">
          {ATTENTION_PUZZLES.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setOtherIdx(otherIdx === i ? null : i)}
              className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                otherIdx === i ? 'bg-mint text-ink' : 'bg-white/5 text-paper/70 hover:bg-white/10'
              }`}
            >
              {p.sentence.join(' ')}
            </button>
          ))}
          {otherIdx !== null && (
            <button
              onClick={() => setOtherIdx(null)}
              className="text-xs px-3 py-1.5 rounded-full bg-white/10 text-paper/60 hover:bg-white/20"
            >↩ back to demo</button>
          )}
        </div>
        {otherIdx !== null && (
          <p className="mt-3 text-sm text-paper/70 italic">
            ↳ {ATTENTION_PUZZLES[otherIdx].explanation}
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4 text-sm">
        <div className="bg-ink-soft/40 border border-white/5 rounded-xl p-4">
          <div className="text-2xl mb-2">🧠</div>
          <h3 className="font-semibold mb-1">Every word looks at every word</h3>
          <p className="text-paper/60">Attention is just a weighted average. Each word borrows context from the others.</p>
        </div>
        <div className="bg-ink-soft/40 border border-white/5 rounded-xl p-4">
          <div className="text-2xl mb-2">🎚️</div>
          <h3 className="font-semibold mb-1">Weights sum to 1</h3>
          <p className="text-paper/60">A word's attention is split across all positions like a budget — and the budget is fixed.</p>
        </div>
        <div className="bg-ink-soft/40 border border-white/5 rounded-xl p-4">
          <div className="text-2xl mb-2">🔀</div>
          <h3 className="font-semibold mb-1">Many heads, in parallel</h3>
          <p className="text-paper/60">Real models run dozens of these "attention heads" at once. One tracks pronouns, one tracks syntax, etc.</p>
        </div>
      </div>

      <JourneyNav current="/attention" />
    </div>
  )
}
