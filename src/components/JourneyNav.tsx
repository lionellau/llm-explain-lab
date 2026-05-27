import { Link } from 'react-router-dom'

const JOURNEY = [
  { path: '/tokenizer',     label: 'Tokens',         emoji: '🧩', accent: 'text-coral' },
  { path: '/embeddings',    label: 'Meaning Space',  emoji: '🌌', accent: 'text-grape-soft' },
  { path: '/attention',     label: 'Attention',      emoji: '👀', accent: 'text-mint' },
  { path: '/encode-decode', label: 'Encode→Decode',  emoji: '🔁', accent: 'text-sky' },
  { path: '/next-token',    label: 'Predict',        emoji: '🎲', accent: 'text-sun' },
  { path: '/recap',         label: 'Recap',          emoji: '🏁', accent: 'text-paper' },
]

export default function JourneyNav({ current }: { current: string }) {
  const i = JOURNEY.findIndex((j) => j.path === current)
  if (i < 0) return null
  const prev = i > 0 ? JOURNEY[i - 1] : null
  const next = i < JOURNEY.length - 1 ? JOURNEY[i + 1] : null
  return (
    <div className="max-w-5xl mx-auto px-4 mt-12 mb-6">
      <div className="flex flex-wrap gap-3 justify-between items-stretch">
        {prev ? (
          <Link
            to={prev.path}
            className="group flex-1 min-w-[180px] flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 transition-all"
          >
            <span className="text-2xl group-hover:-translate-x-1 transition-transform">←</span>
            <div className="text-left">
              <p className="text-xs text-paper/40">Previous</p>
              <p className={`font-semibold ${prev.accent}`}>{prev.emoji} {prev.label}</p>
            </div>
          </Link>
        ) : <div className="flex-1" />}

        {next ? (
          <Link
            to={next.path}
            className="group flex-1 min-w-[180px] flex items-center gap-3 px-4 py-3 rounded-xl bg-grape/10 hover:bg-grape/20 border border-grape-soft/30 hover:border-grape-soft transition-all justify-end"
          >
            <div className="text-right">
              <p className="text-xs text-paper/40">Next up</p>
              <p className={`font-semibold ${next.accent}`}>{next.emoji} {next.label}</p>
            </div>
            <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        ) : <div className="flex-1" />}
      </div>

      {/* Tiny progress dots */}
      <div className="mt-6 flex gap-1.5 justify-center">
        {JOURNEY.slice(0, 5).map((j, idx) => (
          <Link
            key={j.path}
            to={j.path}
            title={j.label}
            className={`h-1.5 rounded-full transition-all ${
              idx === i
                ? `w-8 ${j.accent.replace('text-', 'bg-')}`
                : idx < i
                ? 'w-3 bg-white/30 hover:bg-white/50'
                : 'w-3 bg-white/10 hover:bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
