import { useEffect, useMemo, useRef, useState } from 'react'
import JourneyNav from '../components/JourneyNav'

/**
 * Predict — the END of the pipeline.
 *
 * The visual story:
 *
 *   sentence so far → [tokens → embed → attention] → final vector → probabilities → pick → append.
 *
 * The "[tokens → embed → attention]" part is shown as a tiny pipeline strip
 * at the top so the user remembers this is the *same machine* from the
 * earlier games. The final-vector → probabilities → dice → appended-token
 * cycle plays continuously.
 *
 * No quiz. Move the temperature slider during a run to see the bars reshape.
 */

const COLORS = ['#fbbf24', '#fb7185', '#34d399', '#38bdf8', '#a78bfa', '#f97316', '#c084fc']

interface Choice { token: string; prob: number }

// Stages of one generation step (drives the timeline within each token cycle).
// Slowed down so each step is readable, since the user triggers cycles manually.
type Phase = 'idle' | 'reading' | 'vectoring' | 'attending' | 'scoring' | 'rolling' | 'appending'
const PHASES: { key: Exclude<Phase, 'idle'>; label: string; ms: number }[] = [
  { key: 'reading',    label: 'reading the sentence so far',    ms: 1400 },
  { key: 'vectoring',  label: 'turning last word into a vector', ms: 1400 },
  { key: 'attending',  label: 'attention mixes in context',     ms: 1600 },
  { key: 'scoring',    label: 'final vector → probabilities',   ms: 1800 },
  { key: 'rolling',    label: 'weighted dice roll',             ms: 1300 },
  { key: 'appending',  label: 'picked word added to the sentence', ms: 1100 },
]

// Hand-picked continuations for the demo.
const PROMPT = 'Once upon a'
const CONTINUATIONS: Record<string, Choice[]> = {
  '_start': [
    { token: 'time',      prob: 0.86 },
    { token: 'midnight',  prob: 0.04 },
    { token: 'dream',     prob: 0.04 },
    { token: 'star',      prob: 0.03 },
    { token: 'while',     prob: 0.03 },
  ],
  'time': [
    { token: ',',         prob: 0.55 },
    { token: ' there',    prob: 0.30 },
    { token: ' in',       prob: 0.10 },
    { token: ' a',        prob: 0.05 },
  ],
  'there': [
    { token: ' was',      prob: 0.62 },
    { token: ' lived',    prob: 0.22 },
    { token: ' were',     prob: 0.10 },
    { token: ' existed',  prob: 0.06 },
  ],
  'was': [
    { token: ' a',        prob: 0.58 },
    { token: ' once',     prob: 0.18 },
    { token: ' an',       prob: 0.14 },
    { token: ' no',       prob: 0.10 },
  ],
  'a': [
    { token: ' kingdom',  prob: 0.32 },
    { token: ' tiny',     prob: 0.18 },
    { token: ' clever',   prob: 0.18 },
    { token: ' dragon',   prob: 0.18 },
    { token: ' brave',    prob: 0.14 },
  ],
}

function nextChoicesFor(lastToken: string | null): Choice[] {
  if (!lastToken) return CONTINUATIONS._start
  const k = lastToken.trim().toLowerCase().replace(/[,.\s]+$/, '')
  return CONTINUATIONS[k] ?? []
}

function weightedPick(probs: number[]): number {
  const r = Math.random()
  let acc = 0
  for (let i = 0; i < probs.length; i++) {
    acc += probs[i]
    if (r < acc) return i
  }
  return probs.length - 1
}

function applyTemperature(probs: number[], temperature: number): number[] {
  if (Math.abs(temperature - 1) < 1e-6) return probs
  const logits = probs.map((p) => Math.log(Math.max(p, 1e-9)))
  const scaled = logits.map((l) => l / Math.max(temperature, 0.05))
  const max = Math.max(...scaled)
  const exps = scaled.map((s) => Math.exp(s - max))
  const sum = exps.reduce((a, b) => a + b, 0)
  return exps.map((e) => e / sum)
}

export default function NextToken() {
  const [generated, setGenerated] = useState<string[]>([])
  const [phase, setPhase] = useState<Phase>('idle')
  const [pickedIdx, setPickedIdx] = useState<number | null>(null)
  const [temperature, setTemperature] = useState(0.9)
  const [generating, setGenerating] = useState(false)
  const [glow, setGlow] = useState(false)
  const stopRef = useRef(false)
  const timer = useRef<number | null>(null)

  const lastToken = generated.length > 0 ? generated[generated.length - 1] : null
  const rawChoices = useMemo(() => nextChoicesFor(lastToken), [lastToken])
  const tempProbs = useMemo(
    () => applyTemperature(rawChoices.map((c) => c.prob), temperature),
    [rawChoices, temperature],
  )
  const choices = useMemo(
    () => rawChoices.map((c, i) => ({ ...c, prob: tempProbs[i] })),
    [rawChoices, tempProbs],
  )
  const sorted = useMemo(
    () => choices.map((c, i) => ({ ...c, origIdx: i })).sort((a, b) => b.prob - a.prob),
    [choices],
  )

  const sentenceSoFar = PROMPT + (generated.length ? ' ' + generated.join('') : '')
  const done = choices.length === 0
  const exhausted = done && generated.length > 0

  function clearTimers() { if (timer.current) { clearTimeout(timer.current); timer.current = null } }

  // Reveal the glow on the Generate button after a 3s reading delay,
  // whenever the user is *not* in the middle of generating.
  useEffect(() => {
    setGlow(false)
    if (generating) return
    const t = window.setTimeout(() => setGlow(true), 3000)
    return () => clearTimeout(t)
  }, [generating, generated.length, phase])

  async function generateOneWord() {
    if (generating || done) return
    stopRef.current = false
    setGenerating(true)
    setGlow(false)
    // Step through the 6 phases.
    for (let i = 0; i < PHASES.length; i++) {
      if (stopRef.current) { setGenerating(false); return }
      setPhase(PHASES[i].key)
      if (PHASES[i].key === 'rolling') {
        const idx = weightedPick(tempProbs)
        setPickedIdx(idx)
      }
      await new Promise<void>((res) => {
        timer.current = window.setTimeout(res, PHASES[i].ms) as unknown as number
      })
    }
    if (stopRef.current) { setGenerating(false); return }
    // Append the picked token.
    const idxNow = pickedIdx ?? weightedPick(tempProbs)
    const tok = choices[idxNow]?.token ?? choices[0].token
    setGenerated((g) => [...g, tok])
    setPickedIdx(null)
    setPhase('idle')
    setGenerating(false)
  }

  function reset() {
    stopRef.current = true
    clearTimers()
    setGenerated([])
    setPhase('idle')
    setPickedIdx(null)
    setGenerating(false)
  }

  useEffect(() => {
    return () => { stopRef.current = true; clearTimers() }
  }, [])

  const phaseLabel = phase === 'idle'
    ? (generated.length === 0 ? 'Ready when you are.' : 'Word added. Generate the next one?')
    : PHASES.find((p) => p.key === phase)?.label ?? ''

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <header className="mb-6">
        <p className="text-sun text-sm uppercase tracking-widest mb-2">Game 5 of 5 · 60 seconds</p>
        <h1 className="text-4xl font-bold mb-3">All of that, just to guess one word</h1>
        <p className="text-paper/70 max-w-3xl leading-relaxed">
          The entire pipeline you just saw (tokens, embeddings, attention, encoder) exists for
          <em> one purpose</em>: predicting the next word. Press the button to ask the model for
          one word at a time. ChatGPT does this thousands of times to write a single message.
        </p>
      </header>

      {/* PIPELINE BREADCRUMB — visually tied to the rest of the tour */}
      <PipelineStrip phase={phase} />

      {/* Growing sentence */}
      <div className="bg-ink-soft/60 border border-white/10 rounded-2xl p-6 mb-4 mt-4">
        <p className="text-xs uppercase tracking-widest text-paper/50 mb-3">
          The sentence the model is writing
        </p>
        <p className="text-2xl md:text-3xl font-serif leading-snug min-h-[3rem]">
          <span className="text-paper/80">{sentenceSoFar}</span>
          {phase === 'rolling' && (
            <span className="ml-1 inline-block align-middle text-2xl anim-pulse-glow">🎲</span>
          )}
          {generating && phase !== 'rolling' && phase !== 'appending' && (
            <span className="text-sun"> ▍</span>
          )}
        </p>
      </div>

      {/* Phase label — only visible while generating */}
      {generating && (
        <div className="bg-sun/10 border border-sun/30 rounded-xl p-3 mb-4 text-center anim-float-in" key={phase}>
          <p className="text-sun font-semibold text-sm">
            ↑ right now: <span className="text-paper">{phaseLabel}</span>
          </p>
        </div>
      )}

      {/* Big prominent Generate button with glow ring */}
      <div className="flex items-center gap-3 mb-4">
        {generated.length > 0 && (
          <button
            onClick={reset}
            disabled={generating}
            className="px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-sm font-semibold transition-colors"
          >
            ↻ Reset
          </button>
        )}
        <button
          onClick={generateOneWord}
          disabled={generating || exhausted}
          className={`ml-auto px-7 py-3 rounded-lg bg-gradient-to-r from-sun to-coral text-ink font-bold text-base transition-all hover:scale-[1.03] disabled:opacity-40 disabled:cursor-not-allowed ${
            glow && !generating && !exhausted ? 'glow-ring' : 'opacity-90'
          }`}
        >
          {exhausted
            ? '✓ sentence complete — Reset to try again'
            : generating
              ? '⏳ thinking…'
              : generated.length === 0
                ? '▶ Generate the first word'
                : '▶ Generate the next word'}
        </button>
      </div>

      {!glow && !generating && !exhausted && (
        <p className="-mt-2 mb-4 text-[11px] text-paper/35 text-right italic">
          {generated.length === 0 ? 'Read the pipeline above, then press Generate…' : 'Read the result, then continue…'}
        </p>
      )}

      <div className="grid md:grid-cols-[1fr_280px] gap-4 mb-4">
        {/* Probability bars */}
        <div className="bg-ink-soft/60 border border-white/10 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs uppercase tracking-widest text-paper/50">
              {exhausted ? 'Sentence finished' : 'Probability for the next word'}
            </p>
            <span className="text-xs text-paper/40 font-mono">{generated.length}/5 generated</span>
          </div>
          {sorted.length === 0 ? (
            <p className="text-paper/40 text-sm py-6 text-center">
              No more continuations for this demo — press Reset to try again.
            </p>
          ) : (
            <div className="space-y-2">
              {sorted.map((c, i) => {
                const isPick = pickedIdx === c.origIdx
                const isScoring = phase === 'scoring' || phase === 'rolling' || phase === 'appending'
                return (
                  <div
                    key={c.token + i}
                    className={`relative overflow-hidden rounded-lg border px-3 py-2 transition-all
                      ${isPick ? 'border-sun bg-sun/15 scale-[1.02] shadow-lg shadow-sun/20' : 'border-white/10 bg-white/5'}`}
                  >
                    <div
                      className="absolute inset-y-0 left-0 transition-all"
                      style={{
                        width: isScoring ? `${c.prob * 100}%` : '0%',
                        background: COLORS[i % COLORS.length],
                        opacity: 0.22,
                        transition: 'width 700ms cubic-bezier(0.22,1,0.36,1)',
                      }}
                    />
                    <div className="relative flex items-center justify-between">
                      <span className="font-mono">
                        {isPick && '🏆 '}
                        {c.token.trim() || '·'}
                      </span>
                      <span className="text-sm text-paper/70 font-mono">
                        {isScoring ? `${(c.prob * 100).toFixed(1)}%` : '—'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Temperature panel */}
        <aside className="bg-white/5 border border-white/10 rounded-2xl p-5 text-sm space-y-3">
          <div>
            <label className="text-xs uppercase tracking-widest text-paper/50 flex justify-between mb-2">
              <span>Temperature</span><span className="font-mono">{temperature.toFixed(2)}</span>
            </label>
            <input
              type="range" min={0.1} max={2.0} step={0.05}
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-sun"
            />
            <div className="flex justify-between text-[10px] text-paper/40 mt-1">
              <span>safe · boring</span>
              <span>wild · creative</span>
            </div>
          </div>
          <div className="text-paper/70 text-xs leading-relaxed border-t border-white/5 pt-3">
            <p className="font-semibold text-paper mb-1">Move the slider while it runs.</p>
            <p>Low temperature flattens the bars toward the top pick — same word every time. High
              temperature spreads them — the model takes risks.</p>
          </div>
          <p className="text-paper/55 text-xs italic border-t border-white/5 pt-3">
            ↳ This is the literal "temperature" setting in OpenAI's API.
          </p>
        </aside>
      </div>

      {/* What you just saw — explicit pipeline connection */}
      <div className="bg-ink/60 border border-white/10 rounded-2xl p-5 mb-4 leading-relaxed">
        <p className="text-sm uppercase tracking-widest text-paper/50 mb-2">How this connects back</p>
        <p className="text-paper/85 mb-2">
          <span className="text-coral font-semibold">Tokens</span> → the sentence enters as numbered pieces.{' '}
          <span className="text-grape-soft font-semibold">Embeddings</span> → each token becomes a vector.{' '}
          <span className="text-mint font-semibold">Attention</span> → every vector mixes in context from its neighbors.
          The <em>last</em> vector after all that mixing is what gets turned into the bars above.
        </p>
        <p className="text-paper/70">
          That last vector is a tiny summary of "given everything so far, here's the next word." A
          softmax turns it into the probabilities. The dice picks one. The picked token gets added
          to the sentence — and the whole pipeline runs again from the start. That's the loop ChatGPT
          runs to produce every message it sends you.
        </p>
      </div>

      <JourneyNav current="/next-token" />
    </div>
  )
}

// ====== PipelineStrip ========================================================
// A horizontal mini-diagram showing the 5 stages with a "you are here" pointer
// that follows the current phase. Reinforces that this whole page IS the pipeline.

const PIPELINE_STAGES = [
  { key: 'tok',  label: 'Tokens',    accent: 'text-coral',      bg: 'bg-coral/20',      border: 'border-coral/40' },
  { key: 'emb',  label: 'Embed',     accent: 'text-grape-soft', bg: 'bg-grape/20',      border: 'border-grape-soft/40' },
  { key: 'att',  label: 'Attention', accent: 'text-mint',       bg: 'bg-mint/20',       border: 'border-mint/40' },
  { key: 'pred', label: 'Predict',   accent: 'text-sun',        bg: 'bg-sun/20',        border: 'border-sun/40' },
]

function PipelineStrip({ phase }: { phase: Phase }) {
  // Map current phase to highlighted stage; idle highlights nothing strongly.
  const activeIdx =
    phase === 'idle'       ? -1 :
    phase === 'reading'    ? 0 :
    phase === 'vectoring'  ? 1 :
    phase === 'attending'  ? 2 : 3
  return (
    <div className="bg-ink-soft/40 border border-white/5 rounded-2xl p-3">
      <div className="flex items-center gap-1 text-xs">
        {PIPELINE_STAGES.map((s, i) => (
          <div key={s.key} className="flex items-center flex-1">
            <div
              className={`flex-1 flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all duration-500 ${
                i === activeIdx ? `${s.bg} ${s.border} ${s.accent} scale-[1.04]` : 'bg-white/5 border-white/5 text-paper/45'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${i === activeIdx ? s.accent.replace('text-', 'bg-') + ' anim-pulse-glow' : 'bg-white/20'}`} />
              <span className="font-semibold">{s.label}</span>
              {i === activeIdx && <span className="ml-auto text-[10px] uppercase tracking-widest opacity-60">running…</span>}
            </div>
            {i < PIPELINE_STAGES.length - 1 && <span className="text-paper/30 mx-1">→</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
