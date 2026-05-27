import { useEffect, useMemo, useRef, useState } from 'react'
import JourneyNav from '../components/JourneyNav'

/**
 * The whole pipeline shown as ONE continuous animation, not 6 isolated graphs.
 *
 * The visual is an SVG flowing left → right:
 *
 *   Tokens →  Embed → Attention → Context → Decode → Output
 *
 * Things actually move:
 *   • Input tokens slide in from the left, one after another.
 *   • Each token morphs into a vertical color-bar (its "vector").
 *   • In the attention stage, particles travel along edges between every pair
 *     of vectors — actual moving dots, not static lines.
 *   • Vectors merge into a pulsing context orb.
 *   • Output tokens emerge from the orb one at a time and exit to the right.
 *
 * A single stage label highlights at any moment. A short narration sits below.
 */

interface Pair {
  source: string[]
  target: string[]
}

const PAIRS: Pair[] = [
  { source: ['The', 'cat', 'sat', 'on', 'the', 'mat'], target: ['Le', 'chat', 's\'est', 'assis', 'sur', 'le', 'tapis'] },
  { source: ['I', 'love', 'sushi'],                    target: ['J\'adore', 'les', 'sushis'] },
  { source: ['Where', 'is', 'the', 'station'],         target: ['Où', 'est', 'la', 'gare'] },
]

const STAGES = [
  { key: 'input',   label: 'Tokens',    emoji: '🧩', color: '#fb7185',
    narration: 'Your sentence comes in as tokens — small numbered pieces. (Game 1)' },
  { key: 'embed',   label: 'Embed',     emoji: '🎨', color: '#a78bfa',
    narration: 'Each token becomes a vector — a column of numbers in meaning-space. (Game 2)' },
  { key: 'attend',  label: 'Attention', emoji: '👀', color: '#34d399',
    narration: 'Every vector looks at every other vector and absorbs context. (Game 3)' },
  { key: 'context', label: 'Context',   emoji: '💭', color: '#38bdf8',
    narration: 'After many attention layers, the sentence is one rich bundle of meaning.' },
  { key: 'decode',  label: 'Decode',    emoji: '🔁', color: '#fbbf24',
    narration: 'The decoder generates output tokens one at a time, looking at the context and what it has written.' },
  { key: 'output',  label: 'Output',    emoji: '✨', color: '#fb7185',
    narration: 'A finished translation. Modern chatbots use just the decoder half — same machine, half the box.' },
] as const
type StageKey = typeof STAGES[number]['key']

const STAGE_DUR = 2400 // ms each stage holds

// === SVG geometry ===
const W = 920
const H = 360
// 6 stage columns
const COLS = STAGES.map((_, i) => ((i + 0.5) * W) / STAGES.length)

// deterministic color per token
function colorFor(word: string): string {
  const palette = ['#fbbf24', '#fb7185', '#34d399', '#38bdf8', '#a78bfa', '#f97316', '#c084fc']
  let h = 0
  for (let i = 0; i < word.length; i++) h = (h * 31 + word.charCodeAt(i)) & 0xff
  return palette[h % palette.length]
}

export default function EncodeDecode() {
  const [pairIdx, setPairIdx] = useState(0)
  const [stageIdx, setStageIdx] = useState(0)
  const [auto, setAuto] = useState(false) // manual by default
  const [glow, setGlow] = useState(false)
  const pair = PAIRS[pairIdx]
  const stage = STAGES[stageIdx]
  const isLast = stageIdx === STAGES.length - 1
  const glowDelay = useRef(3000)

  // Reveal the Next button's glow after a reading delay; advance automatically if auto.
  useEffect(() => {
    setGlow(false)
    const g = setTimeout(() => setGlow(true), glowDelay.current)
    let a: number | undefined
    if (auto) {
      a = window.setTimeout(() => {
        setStageIdx((i) => (i + 1) % STAGES.length)
      }, glowDelay.current + STAGE_DUR)
    }
    return () => { clearTimeout(g); if (a) clearTimeout(a) }
  }, [stageIdx, auto])

  function nextStage() { setStageIdx((i) => (i + 1 < STAGES.length ? i + 1 : 0)) }
  function prevStage() { setStageIdx((i) => Math.max(0, i - 1)) }
  function jump(i: number) { setAuto(false); setStageIdx(i) }
  function pickPair(i: number) { setPairIdx(i); setStageIdx(0); setAuto(false) }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <header className="mb-6">
        <p className="text-sky text-sm uppercase tracking-widest mb-2">Game 4 of 5 · 90 seconds</p>
        <h1 className="text-4xl font-bold mb-3">Watch the whole machine run</h1>
        <p className="text-paper/70 max-w-3xl leading-relaxed">
          Tokens (Game 1), embeddings (Game 2), and attention (Game 3) are all pieces of the same
          pipeline. Walk through it stage by stage — read each explanation, then press Next.
        </p>
      </header>

      <div className="flex flex-wrap gap-2 mb-3 items-center">
        <span className="text-xs uppercase tracking-widest text-paper/50">Sentence:</span>
        {PAIRS.map((p, i) => (
          <button
            key={i}
            onClick={() => pickPair(i)}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
              i === pairIdx ? 'bg-sky text-ink' : 'bg-white/5 text-paper/70 hover:bg-white/10'
            }`}
          >
            {p.source.join(' ')}
          </button>
        ))}
      </div>

      {/* Stage chips that highlight as the user walks through */}
      <div className="grid grid-cols-6 gap-1 mb-3">
        {STAGES.map((s, i) => (
          <button
            key={s.key}
            onClick={() => jump(i)}
            className={`group flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs transition-all
              ${i === stageIdx ? 'bg-white/10 ring-2 ring-sky' : i < stageIdx ? 'bg-white/5' : 'bg-white/[0.02] opacity-50'}
            `}
          >
            <span className="text-lg">{s.emoji}</span>
            <span className="text-paper/80">{s.label}</span>
          </button>
        ))}
      </div>

      {/* THE MAIN ANIMATION */}
      <div className="bg-ink-soft/60 border border-white/10 rounded-2xl p-4 mb-4 overflow-hidden">
        <PipelineSvg pair={pair} stage={stage.key} />
      </div>

      {/* PROMINENT EXPLANATION CARD */}
      <div className="rounded-2xl border border-sky/40 bg-sky/10 p-5 mb-3 anim-float-in" key={stage.key}>
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-sky/40 text-[11px] uppercase tracking-widest font-bold text-sky badge-shimmer">
            <span>📖</span><span>Explanation</span>
          </span>
          <span className="text-paper/40 text-xs font-mono ml-auto">
            Stage {stageIdx + 1} of {STAGES.length}
          </span>
        </div>
        <p className="text-xl md:text-[22px] leading-snug font-semibold text-sky">
          <span className="text-2xl mr-2">{stage.emoji}</span>
          {stage.narration}
        </p>
      </div>

      {/* Stage controls — Next button glows after the reading delay */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={prevStage}
          disabled={stageIdx === 0}
          className="px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-semibold transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={() => setAuto((a) => !a)}
          className={`px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            auto ? 'bg-sky/20 text-sky' : 'bg-white/5 hover:bg-white/10 text-paper/70'
          }`}
        >
          {auto ? '⏸ auto' : '▶ auto'}
        </button>
        <button
          onClick={nextStage}
          className={`ml-auto px-6 py-2.5 rounded-lg bg-gradient-to-r from-sky to-grape-soft text-white font-bold text-base transition-all hover:scale-[1.03] ${
            glow ? 'glow-ring' : 'opacity-80'
          }`}
        >
          {isLast ? '↻ Replay from start' : 'Next stage →'}
        </button>
      </div>

      {!glow && (
        <p className="-mt-4 mb-4 text-[11px] text-paper/35 text-right italic">
          Read the explanation above, then advance when ready…
        </p>
      )}

      <div className="grid md:grid-cols-2 gap-4 text-sm">
        <div className="bg-ink-soft/40 border border-white/5 rounded-xl p-4">
          <h3 className="font-semibold mb-1">📥 Encoder</h3>
          <p className="text-paper/60">Reads the whole input at once. Builds rich vectors where each one "knows" its neighbors.</p>
        </div>
        <div className="bg-ink-soft/40 border border-white/5 rounded-xl p-4">
          <h3 className="font-semibold mb-1">📤 Decoder</h3>
          <p className="text-paper/60">Generates one token at a time, looking at both the context and what it has already written.</p>
        </div>
      </div>

      <p className="mt-6 text-paper/50 text-sm">
        Modern chatbots like ChatGPT are <em>decoder-only</em> — they skip the encoder and just keep
        predicting the next word from the prompt. Same machine, half the box. Game 5 zooms into that
        final prediction step.
      </p>

      <JourneyNav current="/encode-decode" />
    </div>
  )
}

// ===== PipelineSvg ==========================================================

function PipelineSvg({ pair, stage }: { pair: Pair; stage: StageKey }) {
  // SVG positions are calibrated against W × H so animations are deterministic.
  const N = pair.source.length
  const M = pair.target.length

  // Y positions for input tokens (evenly spaced inside the canvas, padded vertically)
  const inputYs = useMemo(() => Array.from({ length: N }, (_, i) => ((i + 0.5) * H) / N), [N])
  const outputYs = useMemo(() => Array.from({ length: M }, (_, i) => ((i + 0.5) * H) / M), [M])

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[360px]" preserveAspectRatio="xMidYMid meet">
      {/* faint stage columns */}
      {COLS.map((cx, i) => (
        <g key={i}>
          <line x1={cx} y1={0} x2={cx} y2={H} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
          <text x={cx} y={H - 6} fill="rgba(255,255,255,0.25)" fontSize={10} textAnchor="middle">
            {STAGES[i].label}
          </text>
        </g>
      ))}

      {/* === Stage: INPUT (tokens slide in from the left) === */}
      {pair.source.map((tok, i) => {
        const targetX = COLS[0]
        const y = inputYs[i]
        const visible = stage === 'input' || stage === 'embed' || stage === 'attend'
        return (
          <g key={`in-${i}`} className={visible ? 'opacity-100' : 'opacity-0'} style={{ transition: 'opacity 600ms' }}>
            <g style={{
              transform: stage === 'input'
                ? `translate(${targetX}px, ${y}px)`
                : `translate(${targetX}px, ${y}px)`,
              transition: 'transform 800ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}>
              {/* sliding-in animation when this stage is active */}
              <g className="token-slide-in" style={{ animationDelay: `${i * 120}ms` }}>
                <rect x={-32} y={-12} width={64} height={24} rx={6} fill={colorFor(tok)} opacity={0.92} />
                <text x={0} y={4} fill="#0f0f1e" fontSize={11} fontWeight={700} textAnchor="middle">{tok}</text>
              </g>
            </g>
          </g>
        )
      })}

      {/* === Stage: EMBED (tokens morph into vertical color-bar vectors) === */}
      {pair.source.map((tok, i) => {
        const cx = COLS[1]
        const cy = inputYs[i]
        const visible = stage === 'embed' || stage === 'attend' || stage === 'context'
        if (!visible) return null
        const c = colorFor(tok)
        // Each "vector" = 5 stacked rectangles of varying opacity, growing in.
        return (
          <g key={`emb-${i}`} style={{ transform: `translate(${cx}px, ${cy}px)` }}>
            {[0, 1, 2, 3, 4].map((j) => (
              <rect
                key={j}
                x={-20 + j * 8}
                y={-16}
                width={6}
                height={32}
                rx={1.5}
                fill={c}
                opacity={0.35 + j * 0.13}
                className="vector-grow"
                style={{ animationDelay: `${j * 80 + i * 50}ms` }}
              />
            ))}
            <text x={0} y={28} fill="rgba(255,255,255,0.45)" fontSize={9} textAnchor="middle">{tok}</text>
          </g>
        )
      })}

      {/* === Stage: ATTEND (particles travel between every pair of vectors) === */}
      {stage === 'attend' && (
        <g>
          {pair.source.map((_, i) =>
            pair.source.map((_, j) => {
              if (i === j) return null
              const x1 = COLS[2] - 18
              const y1 = inputYs[i]
              const x2 = COLS[2] + 18
              const y2 = inputYs[j]
              const mx = (x1 + x2) / 2
              const my = (y1 + y2) / 2 + (i < j ? -30 : 30)
              const path = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`
              const delay = ((i * N + j) * 100) % 1800
              return (
                <g key={`att-${i}-${j}`}>
                  <path d={path} stroke="rgba(52,211,153,0.18)" strokeWidth={1} fill="none" />
                  <circle r={2.5} fill="#34d399">
                    <animateMotion dur="1.8s" repeatCount="indefinite" begin={`${delay}ms`} path={path} />
                  </circle>
                </g>
              )
            })
          )}
          {/* Vectors at this stage = same as embed visually, but pulsing */}
          {pair.source.map((tok, i) => {
            const cx = COLS[2]
            const cy = inputYs[i]
            const c = colorFor(tok)
            return (
              <g key={`av-${i}`} style={{ transform: `translate(${cx}px, ${cy}px)` }}>
                {[0, 1, 2, 3, 4].map((j) => (
                  <rect key={j} x={-20 + j * 8} y={-16} width={6} height={32} rx={1.5}
                    fill={c} opacity={0.45 + j * 0.13} className="vector-pulse" style={{ animationDelay: `${j * 80}ms` }} />
                ))}
              </g>
            )
          })}
        </g>
      )}

      {/* === Stage: CONTEXT (vectors collapse into glowing orb) === */}
      {(stage === 'context' || stage === 'decode' || stage === 'output') && (
        <g>
          {/* Glow halo around the orb */}
          <circle cx={COLS[3]} cy={H / 2} r={56} fill="rgba(56,189,248,0.08)" className="orb-pulse" />
          <circle cx={COLS[3]} cy={H / 2} r={36} fill="rgba(56,189,248,0.18)" />
          <circle cx={COLS[3]} cy={H / 2} r={22} fill="#38bdf8" opacity={0.85} className="orb-pulse" />
          <text x={COLS[3]} y={H / 2 + 4} fill="#0f0f1e" fontSize={11} fontWeight={700} textAnchor="middle">meaning</text>
        </g>
      )}

      {/* Lines collapsing into the orb (during context stage) */}
      {stage === 'context' && pair.source.map((tok, i) => {
        const c = colorFor(tok)
        return (
          <line key={`cl-${i}`}
            x1={COLS[2] + 20} y1={inputYs[i]}
            x2={COLS[3]} y2={H / 2}
            stroke={c} strokeOpacity={0.5} strokeWidth={1.5} className="line-fade-in" />
        )
      })}

      {/* === Stage: DECODE (output tokens emerging from the orb, one by one) === */}
      {(stage === 'decode' || stage === 'output') && pair.target.map((tok, i) => {
        const c = colorFor(tok)
        const finalX = COLS[5]
        const finalY = outputYs[i]
        return (
          <g key={`out-${i}`} className="token-emerge" style={{ animationDelay: `${i * 200}ms` }}>
            {/* path from orb to its final spot */}
            <line x1={COLS[3]} y1={H / 2} x2={finalX} y2={finalY} stroke="rgba(251,191,36,0.18)" strokeWidth={1} />
            <g style={{ transform: `translate(${finalX}px, ${finalY}px)` }}>
              <rect x={-34} y={-12} width={68} height={24} rx={6} fill={c} opacity={0.92} />
              <text x={0} y={4} fill="#0f0f1e" fontSize={11} fontWeight={700} textAnchor="middle">{tok}</text>
            </g>
          </g>
        )
      })}

      {/* keyframes (inline so CSP-friendly) */}
      <style>{`
        @keyframes tokenSlide { from { opacity:0; transform: translate(-60px, 0) } to { opacity:1; transform: translate(0, 0) } }
        .token-slide-in { animation: tokenSlide 700ms cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes vectorGrow { from { transform: scaleY(0); transform-origin: center; } to { transform: scaleY(1); } }
        .vector-grow { animation: vectorGrow 500ms cubic-bezier(0.22,1,0.36,1) both; transform-origin: center; transform-box: fill-box; }
        @keyframes vectorPulse { 0%,100% { opacity: var(--o, .6) } 50% { opacity: 1 } }
        .vector-pulse { animation: vectorPulse 1.4s ease-in-out infinite; }
        @keyframes orbPulse { 0%,100% { transform: scale(1) } 50% { transform: scale(1.08) } }
        .orb-pulse { animation: orbPulse 1.6s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
        @keyframes lineFadeIn { from { stroke-dasharray: 4 4; stroke-dashoffset: 60; opacity: 0; } to { stroke-dashoffset: 0; opacity: 0.6; } }
        .line-fade-in { animation: lineFadeIn 800ms ease-out both; }
        @keyframes tokenEmerge { from { opacity:0; transform: scale(0.3); } to { opacity:1; transform: scale(1); } }
        .token-emerge { animation: tokenEmerge 600ms cubic-bezier(0.22,1,0.36,1) both; transform-origin: center; transform-box: fill-box; }
      `}</style>
    </svg>
  )
}
