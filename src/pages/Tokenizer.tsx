import { useMemo, useState } from 'react'
import { tokenize, type Token } from '../lib/tokenize'
import JourneyNav from '../components/JourneyNav'
import StorySteps, { type Beat } from '../components/StorySteps'

const EXAMPLES = [
  "The cat sat on the mat.",
  "Unbelievably, the transformer is reading subwords.",
  "I love eating sushi at midnight.",
  "Tokenization is preprocessing!",
]

const COLORS = ['bg-coral/80', 'bg-sun/80', 'bg-mint/80', 'bg-sky/80', 'bg-grape-soft/80']

function TokenChip({ token, index }: { token: Token; index: number }) {
  if (token.kind === 'space') {
    return <span className="inline-block w-1" />
  }
  const color = token.kind === 'punct'
    ? 'bg-white/15 text-paper/70'
    : `${COLORS[index % COLORS.length]} text-ink`
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 m-0.5 rounded-md font-mono text-sm ${color} shadow-sm anim-float-in`}
      title={`Token id ${token.id}`}
    >
      <span className="font-semibold">{token.text}</span>
      <span className="text-[10px] opacity-60 font-bold">#{token.id}</span>
    </span>
  )
}

const DEMO_TEXT = 'Unbelievably, the transformer is reading subwords.'

const BEATS: Beat[] = [
  {
    caption: 'A language model never sees the letters you typed.',
    llmNote: 'Computers do math on numbers, not on characters.',
    readingMs: 3000,
  },
  {
    caption: 'It splits your text into "tokens" — small reusable pieces.',
    llmNote: 'Common words stay whole. Rare or long words get broken into known sub-pieces.',
    readingMs: 3400,
  },
  {
    caption: 'Each token has a fixed ID number.',
    llmNote: 'From here on, the model only deals with these numbers.',
    readingMs: 3000,
  },
  {
    caption: '"Unbelievably" → un + believ + ably. Three tokens, three IDs.',
    llmNote: 'The model learned these pieces from billions of training examples.',
    readingMs: 3400,
  },
]

export default function Tokenizer() {
  const [text, setText] = useState(EXAMPLES[0])
  const [demoStep, setDemoStep] = useState(0)
  const tokens = useMemo(() => tokenize(text), [text])
  const demoTokens = useMemo(() => tokenize(DEMO_TEXT), [])
  const real = tokens.filter((t) => t.kind !== 'space')
  const words = text.trim().split(/\s+/).filter(Boolean).length

  // Reveal demo tokens progressively as the story advances.
  // step 0: show plain letters | step 1: show grouped chips (no IDs) | step ≥ 2: show chips with IDs
  const showGrouped = demoStep >= 1
  const showIds = demoStep >= 2
  const highlightUnbelievably = demoStep >= 3

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <header className="mb-6">
        <p className="text-coral text-sm uppercase tracking-widest mb-2">Game 1 of 5 · 60 seconds</p>
        <h1 className="text-4xl font-bold mb-3">Step 1: turn your text into numbers</h1>
        <p className="text-paper/70 max-w-2xl leading-relaxed">
          Before an LLM can do anything, it has to convert your sentence into something it can
          actually compute on. Watch what happens to a real sentence.
        </p>
      </header>

      {/* AUTO DEMO */}
      <div className="bg-ink-soft/60 border border-white/10 rounded-2xl p-6 mb-4">
        <p className="text-xs uppercase tracking-widest text-paper/50 mb-3">Live demo</p>
        <div className="min-h-[3.5rem] flex items-center flex-wrap gap-2 mb-3">
          {!showGrouped ? (
            // Plain letters phase
            <span className="font-mono text-lg text-paper/80">{DEMO_TEXT}</span>
          ) : (
            // Grouped chips phase
            demoTokens.map((t, i) => {
              if (t.kind === 'space') return <span key={i} className="w-1" />
              const isUnbelievablyPiece = highlightUnbelievably && (
                t.text.toLowerCase() === 'un' || t.text.toLowerCase() === 'believ' || t.text.toLowerCase() === 'ably'
              )
              return (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-sm anim-float-in shadow-sm transition-all
                    ${t.kind === 'punct' ? 'bg-white/15 text-paper/70' : 'bg-coral/80 text-ink'}
                    ${isUnbelievablyPiece ? 'ring-2 ring-sun scale-110' : ''}`}
                >
                  <span className="font-semibold">{t.text}</span>
                  {showIds && t.kind !== 'punct' && (
                    <span className="text-[10px] opacity-60 font-bold">#{t.id}</span>
                  )}
                </span>
              )
            })
          )}
        </div>
      </div>

      <StorySteps
        beats={BEATS}
        accent="text-coral"
        accentBorder="border-coral/40"
        accentBg="bg-coral/10"
        onStep={setDemoStep}
        className="mb-8"
      />

      <div className="bg-ink-soft/60 border border-white/10 rounded-2xl p-5 mb-6">
        <label className="block text-xs uppercase tracking-widest text-paper/50 mb-2">
          ✏️ Try your own (optional)
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          maxLength={500}
          className="w-full bg-ink/60 border border-white/10 rounded-lg p-3 text-paper font-mono text-sm focus:outline-none focus:ring-2 focus:ring-grape-soft resize-none"
        />
        <div className="flex flex-wrap gap-2 mt-3">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => setText(ex)}
              className="text-xs px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-paper/70 hover:text-paper transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-ink-soft/60 border border-white/10 rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm uppercase tracking-widest text-paper/50">Tokenized</h2>
          <div className="flex gap-4 text-sm text-paper/60">
            <span><b className="text-paper">{words}</b> words</span>
            <span><b className="text-coral">{real.length}</b> tokens</span>
          </div>
        </div>
        <div className="leading-loose">
          {tokens.map((t, i) => (
            <TokenChip key={i} token={t} index={i} />
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 text-sm">
        <div className="bg-ink-soft/40 border border-white/5 rounded-xl p-4">
          <div className="text-2xl mb-2">🧱</div>
          <h3 className="font-semibold mb-1">Words → pieces</h3>
          <p className="text-paper/60">
            "Unbelievably" becomes <code className="text-coral">un</code>+
            <code className="text-coral">believ</code>+<code className="text-coral">ably</code>.
            The model learned these pieces because they repeat.
          </p>
        </div>
        <div className="bg-ink-soft/40 border border-white/5 rounded-xl p-4">
          <div className="text-2xl mb-2">🔢</div>
          <h3 className="font-semibold mb-1">Each piece has an ID</h3>
          <p className="text-paper/60">
            "the" might be #1996. "▁sushi" might be #46782. From here on, the model only sees numbers.
          </p>
        </div>
        <div className="bg-ink-soft/40 border border-white/5 rounded-xl p-4">
          <div className="text-2xl mb-2">📏</div>
          <h3 className="font-semibold mb-1">Why it matters</h3>
          <p className="text-paper/60">
            Models charge per token. They have a token limit. One emoji can be 4 tokens. One long
            German word can be 12.
          </p>
        </div>
      </div>

      <p className="mt-8 text-center text-paper/50 text-sm">
        Numbers are boring on their own. Let's see how the model gives them <em>meaning</em>.
      </p>

      <JourneyNav current="/tokenizer" />
    </div>
  )
}
