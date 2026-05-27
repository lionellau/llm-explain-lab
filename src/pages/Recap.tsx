import { Link } from 'react-router-dom'
import JourneyNav from '../components/JourneyNav'

const STEPS = [
  {
    n: '01',
    title: 'Tokens',
    accent: 'text-coral',
    border: 'border-coral/40',
    bg: 'bg-coral/10',
    line: 'The model breaks text into sub-word pieces, each with a numeric ID. From here on, text is just numbers.',
    revisit: '/tokenizer',
  },
  {
    n: '02',
    title: 'Embeddings',
    accent: 'text-grape-soft',
    border: 'border-grape-soft/40',
    bg: 'bg-grape/10',
    line: 'Each token becomes a point in high-dimensional space. Similar meanings cluster. Relationships are directions.',
    revisit: '/embeddings',
  },
  {
    n: '03',
    title: 'Attention',
    accent: 'text-mint',
    border: 'border-mint/40',
    bg: 'bg-mint/10',
    line: 'Every token looks at every other token and decides who matters. That mixing lets each word borrow context.',
    revisit: '/attention',
  },
  {
    n: '04',
    title: 'Encoder & Decoder',
    accent: 'text-sky',
    border: 'border-sky/40',
    bg: 'bg-sky/10',
    line: 'Stack attention layers. Encoder compresses input. Decoder generates output, one token at a time, peeking at both context and what it has already said.',
    revisit: '/encode-decode',
  },
  {
    n: '05',
    title: 'Predict',
    accent: 'text-sun',
    border: 'border-sun/40',
    bg: 'bg-sun/10',
    line: 'For every next token, the model outputs a probability distribution. Pick from it, append, repeat. That is the whole loop.',
    revisit: '/next-token',
  },
]

export default function Recap() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <header className="text-center max-w-2xl mx-auto mb-12">
        <p className="text-sm uppercase tracking-widest text-paper/50 mb-3">🏁 Recap</p>
        <h1 className="text-5xl md:text-6xl font-bold mb-5 leading-tight">
          You now know how an{' '}
          <span className="bg-gradient-to-r from-sun via-coral to-grape-soft bg-clip-text text-transparent">
            LLM
          </span>{' '}
          works.
        </h1>
        <p className="text-paper/70 text-lg leading-relaxed">
          Put together, the five pieces are the entire transformer architecture. Real models
          just multiply this by billions of parameters and stack the attention block dozens of times.
        </p>
      </header>

      {/* Pipeline diagram */}
      <div className="relative mb-12">
        <div className="hidden md:flex absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-coral/30 via-mint/30 to-sun/30 -z-10" />
        <div className="grid md:grid-cols-5 gap-3">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className={`relative ${s.bg} border ${s.border} rounded-xl p-3 text-center`}
            >
              <div className={`text-2xl font-bold ${s.accent} mb-1`}>{s.n}</div>
              <div className="text-sm font-semibold">{s.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Step recaps */}
      <ol className="space-y-4 mb-12">
        {STEPS.map((s) => (
          <li
            key={s.n}
            className={`group flex gap-5 p-5 rounded-2xl border border-white/10 bg-ink-soft/40 hover:border-white/30 transition-colors`}
          >
            <div className={`text-3xl font-bold ${s.accent} shrink-0 w-12`}>{s.n}</div>
            <div className="flex-1">
              <h2 className={`text-xl font-semibold mb-1 ${s.accent}`}>{s.title}</h2>
              <p className="text-paper/70 leading-relaxed">{s.line}</p>
            </div>
            <Link
              to={s.revisit}
              className="self-center shrink-0 text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-paper/70 hover:text-paper transition-colors whitespace-nowrap"
            >
              Replay →
            </Link>
          </li>
        ))}
      </ol>

      {/* The one-liner */}
      <div className="text-center bg-gradient-to-br from-grape/10 to-sun/5 border border-white/10 rounded-2xl p-8 mb-12">
        <p className="text-paper/60 text-sm uppercase tracking-widest mb-3">The whole story in one sentence</p>
        <p className="text-xl md:text-2xl leading-relaxed">
          <span className="text-coral">Break text into tokens</span>,{' '}
          <span className="text-grape-soft">turn each into a vector</span>,{' '}
          <span className="text-mint">let them all look at each other</span>,{' '}
          <span className="text-sky">stack that mixing many times</span>, then{' '}
          <span className="text-sun">predict the next token</span> over and over.
        </p>
      </div>

      {/* What's still hidden */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">What we glossed over</h2>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="bg-ink-soft/40 border border-white/5 rounded-xl p-4">
            <h3 className="font-semibold mb-1">📚 Training</h3>
            <p className="text-paper/60">
              How the model <em>learns</em> good embeddings and attention. Trillions of next-token
              guesses, with each wrong one nudging billions of numbers.
            </p>
          </div>
          <div className="bg-ink-soft/40 border border-white/5 rounded-xl p-4">
            <h3 className="font-semibold mb-1">🧱 Layer norm, FFN, residuals</h3>
            <p className="text-paper/60">
              Between attention blocks, models have feed-forward layers and normalization tricks
              that keep things stable. Same shape, more knobs.
            </p>
          </div>
          <div className="bg-ink-soft/40 border border-white/5 rounded-xl p-4">
            <h3 className="font-semibold mb-1">💬 RLHF</h3>
            <p className="text-paper/60">
              After pre-training on the internet, modern chatbots are tuned by humans rating answers.
              That's why ChatGPT sounds helpful, not like Reddit.
            </p>
          </div>
        </div>
      </div>

      {/* Outro */}
      <div className="text-center">
        <Link
          to="/"
          className="inline-block px-6 py-3 rounded-full bg-grape hover:bg-grape/80 font-semibold transition-colors"
        >
          ← Back to start
        </Link>
        <p className="mt-4 text-paper/40 text-sm">
          You went from "what's a token?" to understanding a transformer in 5 mini-games. That's
          the entire core of how every modern chatbot, translator, and code assistant works.
        </p>
      </div>

      <JourneyNav current="/recap" />
    </div>
  )
}
