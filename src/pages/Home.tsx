import { Link } from 'react-router-dom'

const modes = [
  {
    to: '/tokenizer',
    title: 'Tokens',
    n: '01',
    tagline: 'Turn text into numbers.',
    blurb: 'Watch a sentence get sliced into "tokens" — the small pieces the model actually reads as numbers.',
    gradient: 'from-coral/20 to-sun/10',
    accent: 'text-coral',
    emoji: '🧩',
  },
  {
    to: '/embeddings',
    title: 'Meaning Space',
    n: '02',
    tagline: 'Meaning lives in space.',
    blurb: 'Watch the famous "king − man + woman = queen" play out in 3D. Then poke around the word galaxy.',
    gradient: 'from-grape/30 to-sky/10',
    accent: 'text-grape-soft',
    emoji: '🌌',
  },
  {
    to: '/attention',
    title: 'Attention',
    n: '03',
    tagline: 'Every word looks at every word.',
    blurb: 'Watch the model figure out what "it" refers to — and how a single word change shifts its focus.',
    gradient: 'from-mint/20 to-sky/10',
    accent: 'text-mint',
    emoji: '👀',
  },
  {
    to: '/encode-decode',
    title: 'Encode → Decode',
    n: '04',
    tagline: 'Stack everything up.',
    blurb: 'See games 1–3 fit together as one pipeline. A sentence goes in one side, the translation comes out the other.',
    gradient: 'from-sky/20 to-grape/20',
    accent: 'text-sky',
    emoji: '🔁',
  },
  {
    to: '/next-token',
    title: 'Predict',
    n: '05',
    tagline: 'An LLM is a next-word guesser.',
    blurb: 'Watch the model build a sentence one weighted dice roll at a time. Play with the temperature slider.',
    gradient: 'from-sun/20 to-coral/20',
    accent: 'text-sun',
    emoji: '🎲',
  },
]

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <section className="text-center max-w-3xl mx-auto mb-12">
        <p className="text-grape-soft text-sm uppercase tracking-widest mb-3">A 5-minute guided tour</p>
        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-5">
          How does an{' '}
          <span className="bg-gradient-to-r from-sun via-coral to-grape-soft bg-clip-text text-transparent">
            LLM
          </span>{' '}
          actually work?
        </h1>
        <p className="text-lg text-paper/70 leading-relaxed mb-8">
          Five short animations. No math. No code. Each one shows you a different piece of the
          machine inside ChatGPT and friends. Just press play and watch — interaction is optional.
        </p>
        <Link
          to="/tokenizer"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-grape hover:bg-grape/80 font-semibold text-lg transition-all anim-pulse-glow"
        >
          ▶ Begin tour
        </Link>
        <p className="mt-3 text-paper/40 text-sm">or jump to any chapter below</p>
      </section>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {modes.map((m) => (
          <Link
            key={m.to}
            to={m.to}
            className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${m.gradient} bg-ink-soft p-6 transition-all hover:border-white/30 hover:-translate-y-0.5`}
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-5xl group-hover:scale-110 transition-transform">{m.emoji}</span>
              <span className="text-xs font-mono text-paper/40">{m.n}</span>
            </div>
            <h2 className={`text-2xl font-bold mb-1 ${m.accent}`}>{m.title}</h2>
            <p className="text-paper/90 text-sm font-medium mb-2">{m.tagline}</p>
            <p className="text-paper/60 text-sm leading-relaxed">{m.blurb}</p>
            <div className="mt-5 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Play →
            </div>
          </Link>
        ))}
      </div>

      <section className="mt-16 max-w-2xl mx-auto text-center text-paper/50 text-sm leading-relaxed">
        <p>
          These games use small hand-crafted examples — not a real GPT — so you can see the moving
          parts clearly. The concepts are the same; real models just do this a few billion times.
        </p>
      </section>
    </div>
  )
}
