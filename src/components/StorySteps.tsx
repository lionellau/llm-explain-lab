import { useEffect, useRef, useState } from 'react'

export interface Beat {
  caption: string
  llmNote?: string
  /** how long before the "Next step" button gets its glow (ms). Default 3000. */
  readingMs?: number
}

interface Props {
  beats: Beat[]
  defaultReadingMs?: number
  accent?: string // tailwind color class for caption text, e.g. "text-grape-soft"
  accentBorder?: string // border class, e.g. "border-grape-soft/40"
  accentBg?: string // background tint class, e.g. "bg-grape/10"
  onStep?: (i: number) => void
  className?: string
}

/**
 * StorySteps: user-driven, step-by-step concept walkthrough.
 *
 * Each beat is one piece of the explanation. The user reads, then presses
 * "Next step" to advance. A glow ring appears around Next after a reading
 * delay (default 3s) so the user has time to absorb before being prompted.
 *
 * Optional ▶ auto-play toggle for users who prefer hands-off pacing.
 */
export default function StorySteps({
  beats,
  defaultReadingMs = 3000,
  accent = 'text-grape-soft',
  accentBorder = 'border-grape-soft/40',
  accentBg = 'bg-grape/10',
  onStep,
  className = '',
}: Props) {
  const [step, setStep] = useState(0)
  const [glow, setGlow] = useState(false)
  const [autoplay, setAutoplay] = useState(false)
  const timer = useRef<number | null>(null)

  // Notify parent of step changes (so visuals can sync).
  useEffect(() => {
    onStep?.(step)
  }, [step, onStep])

  // Reset glow on step change; reveal it after the reading delay; if autoplay,
  // also auto-advance after a longer delay.
  useEffect(() => {
    setGlow(false)
    const readMs = beats[step]?.readingMs ?? defaultReadingMs
    const glowTimer = window.setTimeout(() => setGlow(true), readMs)
    let autoTimer: number | undefined
    if (autoplay) {
      autoTimer = window.setTimeout(() => {
        setStep((s) => (s + 1 < beats.length ? s + 1 : 0))
      }, readMs + 1800) // 1.8s after glow appears, advance
    }
    timer.current = glowTimer as unknown as number
    return () => {
      clearTimeout(glowTimer)
      if (autoTimer) clearTimeout(autoTimer)
    }
  }, [step, autoplay, beats, defaultReadingMs])

  const beat = beats[step]
  const isLast = step === beats.length - 1
  const isFirst = step === 0

  function next() {
    setStep((s) => (s + 1 < beats.length ? s + 1 : 0))
  }
  function prev() {
    setStep((s) => Math.max(0, s - 1))
  }

  return (
    <section className={`${className}`}>
      {/* Explanation card with a prominent "Concept" badge */}
      <div className={`relative rounded-2xl border ${accentBorder} ${accentBg} p-5 mb-3`}>
        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border ${accentBorder} text-[11px] uppercase tracking-widest font-bold ${accent} badge-shimmer`}>
            <span>📖</span>
            <span>Explanation</span>
          </span>
          <span className="text-paper/40 text-xs font-mono ml-auto">
            Step {step + 1} of {beats.length}
          </span>
        </div>

        <p key={`cap-${step}`} className={`anim-float-in text-xl md:text-[22px] leading-snug font-semibold ${accent}`}>
          {beat?.caption}
        </p>
        {beat?.llmNote && (
          <p key={`note-${step}`} className="anim-float-in mt-3 text-sm text-paper/75 leading-relaxed border-l-2 border-white/15 pl-3">
            <span className="text-paper/40 uppercase tracking-widest text-[10px] block mb-0.5">↳ In an LLM</span>
            {beat.llmNote}
          </p>
        )}
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 mb-3 px-1">
        {beats.map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              i === step
                ? 'bg-grape-soft'
                : i < step
                  ? 'bg-white/30 hover:bg-white/50'
                  : 'bg-white/10 hover:bg-white/20'
            }`}
            aria-label={`Jump to step ${i + 1}`}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={prev}
          disabled={isFirst}
          className="px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-semibold transition-colors"
        >
          ← Back
        </button>

        <button
          onClick={() => setAutoplay((a) => !a)}
          className={`px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            autoplay ? 'bg-grape-soft/20 text-grape-soft' : 'bg-white/5 hover:bg-white/10 text-paper/70'
          }`}
          aria-label={autoplay ? 'Pause autoplay' : 'Enable autoplay'}
          title={autoplay ? 'Autoplay on — click to pause' : 'Optional autoplay'}
        >
          {autoplay ? '⏸ auto' : '▶ auto'}
        </button>

        <button
          onClick={next}
          className={`ml-auto px-6 py-2.5 rounded-lg bg-gradient-to-r from-grape to-grape-soft text-white font-bold text-base transition-all hover:scale-[1.03] ${
            glow ? 'glow-ring' : 'opacity-80'
          }`}
        >
          {isLast ? '↻ Replay from start' : 'Next step →'}
        </button>
      </div>

      {!glow && (
        <p className="mt-2 text-[11px] text-paper/35 text-right pr-1 italic">
          Read the explanation above, then advance when ready…
        </p>
      )}
    </section>
  )
}
