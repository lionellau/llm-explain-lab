import { useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Html, Line, Stars } from '@react-three/drei'
import {
  WORDS, GROUP_COLOR, vecAdd, vecSub, dist,
  type WordVec,
} from '../data/embeddings'
import JourneyNav from '../components/JourneyNav'
import StorySteps, { type Beat } from '../components/StorySteps'

// Note: we use drei's <Html> for labels instead of <Text>. <Text> needs
// to load a font file via fetch; even bundled locally that fetch failed
// reliably enough to take the scene down. <Html> renders ordinary DOM
// nodes positioned in 3D space and uses the browser's native fonts — no
// suspense, no remote dependency, no CSP edge cases.

type Vec3 = [number, number, number]

function WordPoint({
  v, highlight, dim, onClick,
}: {
  v: WordVec
  highlight: boolean
  dim: boolean
  onClick: (v: WordVec) => void
}) {
  const color = GROUP_COLOR[v.group]
  return (
    <group position={v.pos}>
      <mesh
        onClick={(e) => { e.stopPropagation(); onClick(v) }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = '' }}
      >
        <sphereGeometry args={[highlight ? 0.32 : 0.18, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={highlight ? 0.9 : 0.35}
          transparent
          opacity={dim ? 0.2 : 1}
        />
      </mesh>
      <Html position={[0, 0.55, 0]} center distanceFactor={10} zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
        <div
          style={{
            color: dim ? '#666' : '#fdf6f0',
            fontWeight: highlight ? 700 : 500,
            fontSize: highlight ? '14px' : '11px',
            textShadow: '0 0 6px #0f0f1e, 0 0 2px #0f0f1e',
            whiteSpace: 'nowrap',
            userSelect: 'none',
            opacity: dim ? 0.55 : 1,
            transition: 'all 200ms',
          }}
        >
          {v.word}
        </div>
      </Html>
    </group>
  )
}

function VectorArrow({ from, to, color }: { from: Vec3; to: Vec3; color: string }) {
  return <Line points={[from, to]} color={color} lineWidth={3} />
}

function GhostPoint({ pos, label = '?' }: { pos: Vec3; label?: string }) {
  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[0.26, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} wireframe />
      </mesh>
      <Html position={[0, 0.55, 0]} center distanceFactor={10} zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
        <div
          style={{
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '14px',
            textShadow: '0 0 6px #0f0f1e, 0 0 2px #0f0f1e',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </div>
      </Html>
    </group>
  )
}

// === Demo: king − man + woman = queen ===========================
//
// Beats:
//   0 - introduce space
//   1 - highlight king
//   2 - highlight man, show king-man direction (royal arrow)
//   3 - highlight woman, apply same arrow from woman
//   4 - ghost point lands on queen
//   5 - reveal queen as nearest word
//
const DEMO_BEATS: Beat[] = [
  {
    caption: "Every word lives somewhere in this 3D space.",
    llmNote: "Real models use hundreds or thousands of dimensions instead of 3.",
    readingMs: 3000,
  },
  {
    caption: "Here is the word king.",
    llmNote: "Each word is just a list of numbers — coordinates.",
    readingMs: 2400,
  },
  {
    caption: "Look at the arrow from man to king. That's the 'royal' direction.",
    llmNote: "Models discover these directions on their own during training.",
    readingMs: 3400,
  },
  {
    caption: "Now apply that same 'royal' arrow, starting from woman.",
    llmNote: "Same math, different starting word.",
    readingMs: 3200,
  },
  {
    caption: "It lands right on queen.",
    llmNote: "That's how the model 'knows' king→queen is like man→woman.",
    readingMs: 3000,
  },
  {
    caption: "Meaning has direction. That's the whole trick.",
    llmNote: "Embeddings turn words into geometry — now math can answer language questions.",
    readingMs: 3400,
  },
]

function DemoScene({ step, exploreSel }: { step: number; exploreSel: { word: string; neighbors: string[] } | null }) {
  const wordsByName = useMemo(() => new Map(WORDS.map((w) => [w.word, w])), [])
  const king = wordsByName.get('king')!
  const man = wordsByName.get('man')!
  const woman = wordsByName.get('woman')!
  const ghostPos: Vec3 = vecAdd(woman.pos, vecSub(king.pos, man.pos))

  // What to highlight at each beat (and in explore mode, the user's pick)
  const highlight = new Set<string>()
  if (exploreSel) {
    highlight.add(exploreSel.word)
    exploreSel.neighbors.forEach((n) => highlight.add(n))
  } else {
    if (step >= 1) highlight.add('king')
    if (step >= 2) highlight.add('man')
    if (step >= 3) highlight.add('woman')
    if (step >= 5) highlight.add('queen')
  }
  const anyHi = highlight.size > 0

  const showRoyalArrow = !exploreSel && step >= 2
  const showApplyArrow = !exploreSel && step >= 3
  const showGhost = !exploreSel && step >= 4
  const showQueenGlow = !exploreSel && step >= 5

  return (
    <>
      <pointLight position={[-10, -10, -10]} intensity={0.6} color="#7c3aed" />

      {WORDS.map((w) => (
        <WordPoint
          key={w.word}
          v={w}
          highlight={highlight.has(w.word) || (showQueenGlow && w.word === 'queen')}
          dim={anyHi && !highlight.has(w.word)}
          onClick={() => {}}
        />
      ))}

      {exploreSel && exploreSel.neighbors.map((n) => {
        const from = wordsByName.get(exploreSel.word)!.pos
        const to = wordsByName.get(n)!.pos
        return <Line key={`nb-${n}`} points={[from, to]} color="#a78bfa" lineWidth={1} transparent opacity={0.5} />
      })}

      {showRoyalArrow && <VectorArrow from={man.pos} to={king.pos} color="#fbbf24" />}
      {showApplyArrow && <VectorArrow from={woman.pos} to={ghostPos} color="#fbbf24" />}
      {showGhost && !showQueenGlow && <GhostPoint pos={ghostPos} />}
    </>
  )
}

function ExploreScene({ exploreSel, onPick }: {
  exploreSel: { word: string; neighbors: string[] } | null
  onPick: (v: WordVec) => void
}) {
  const wordsByName = useMemo(() => new Map(WORDS.map((w) => [w.word, w])), [])
  const highlight = new Set<string>()
  if (exploreSel) {
    highlight.add(exploreSel.word)
    exploreSel.neighbors.forEach((n) => highlight.add(n))
  }
  const anyHi = highlight.size > 0
  return (
    <>
      <pointLight position={[-10, -10, -10]} intensity={0.6} color="#7c3aed" />

      {WORDS.map((w) => (
        <WordPoint
          key={w.word}
          v={w}
          highlight={highlight.has(w.word)}
          dim={anyHi && !highlight.has(w.word)}
          onClick={onPick}
        />
      ))}
      {exploreSel && exploreSel.neighbors.map((n) => {
        const from = wordsByName.get(exploreSel.word)!.pos
        const to = wordsByName.get(n)!.pos
        return <Line key={`nb-${n}`} points={[from, to]} color="#a78bfa" lineWidth={1} transparent opacity={0.5} />
      })}
    </>
  )
}

export default function Embeddings() {
  const [step, setStep] = useState(0)
  const [mode, setMode] = useState<'watch' | 'explore'>('watch')
  const [exploreSel, setExploreSel] = useState<{ word: string; neighbors: string[] } | null>(null)

  function exploreWord(v: WordVec) {
    const others = WORDS.filter((w) => w.word !== v.word)
    const sorted = others
      .map((w) => ({ w, d: dist(v.pos, w.pos) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 3)
      .map((x) => x.w.word)
    setExploreSel({ word: v.word, neighbors: sorted })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <header className="mb-6">
        <p className="text-grape-soft text-sm uppercase tracking-widest mb-2">Game 2 of 5 · 90 seconds</p>
        <h1 className="text-4xl font-bold mb-3">Meaning lives in space</h1>
        <p className="text-paper/70 max-w-3xl leading-relaxed">
          After tokens get their numbers, the model puts every word at a point in space. Similar
          meanings end up near each other. Even cooler: <b>directions in this space mean things</b>.
          Press play and watch the most famous example.
        </p>
      </header>

      <div className="flex gap-2 mb-3">
        <button
          onClick={() => { setMode('watch'); setExploreSel(null) }}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            mode === 'watch' ? 'bg-grape text-white' : 'bg-white/5 text-paper/70 hover:bg-white/10'
          }`}
        >
          ▶ Watch the demo
        </button>
        <button
          onClick={() => { setMode('explore'); setExploreSel(null) }}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            mode === 'explore' ? 'bg-grape text-white' : 'bg-white/5 text-paper/70 hover:bg-white/10'
          }`}
        >
          🛰 Explore freely
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-4">
        <div className="relative bg-ink-soft/60 border border-white/10 rounded-2xl overflow-hidden h-[520px]">
          {/* Fallback shown if WebGL fails to start. Canvas mounts on top of it. */}
          <div className="absolute inset-0 flex items-center justify-center text-paper/40 text-sm text-center px-6">
            Your browser couldn't start WebGL. The rest of the tour still works — open this page
            on a desktop browser with hardware acceleration on.
          </div>
          <Canvas camera={{ position: [10, 6, 12], fov: 55 }} className="relative z-10">
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} intensity={1.2} />
            <Stars radius={50} depth={30} count={1500} factor={3} fade speed={0.4} />
            {mode === 'watch'
              ? <DemoScene step={step} exploreSel={null} />
              : <ExploreScene exploreSel={exploreSel} onPick={exploreWord} />}
            <OrbitControls enablePan={false} minDistance={5} maxDistance={28} />
          </Canvas>
          {mode === 'explore' && exploreSel && (
            <div className="absolute top-3 left-3 bg-ink/85 backdrop-blur border border-white/10 rounded-xl p-3 text-sm max-w-xs anim-float-in">
              <div className="flex justify-between items-start gap-2 mb-1">
                <p className="font-bold text-grape-soft text-lg">{exploreSel.word}</p>
                <button
                  onClick={() => setExploreSel(null)}
                  className="text-paper/50 hover:text-paper text-xs px-1.5"
                >✕</button>
              </div>
              <p className="text-xs text-paper/50 mb-2">3 nearest in meaning</p>
              <div className="flex flex-wrap gap-1">
                {exploreSel.neighbors.map((n) => (
                  <span key={n} className="px-2 py-0.5 rounded-md bg-white/10 text-xs font-mono">{n}</span>
                ))}
              </div>
            </div>
          )}
          <div className="absolute bottom-3 left-3 text-[11px] text-paper/40 pointer-events-none">
            {mode === 'watch' ? 'Drag to rotate · scroll to zoom' : 'Click any word to see its meaning-neighbors'}
          </div>
        </div>

        <aside className="flex flex-col gap-3">
          {mode === 'watch' ? (
            <StorySteps
              beats={DEMO_BEATS}
              accent="text-grape-soft"
              accentBorder="border-grape-soft/40"
              accentBg="bg-grape/10"
              onStep={setStep}
            />
          ) : (
            <div className="bg-ink/60 border border-white/10 rounded-2xl p-4 text-sm leading-relaxed text-paper/80">
              <p className="font-semibold text-grape-soft mb-1">Free exploration</p>
              <p>Click any word in the 3D space. You'll see its three nearest neighbors — words the
                model considers closest in meaning. Try <b>king</b>, then try <b>cat</b>, then try
                <b> pizza</b>. Notice how clusters form.</p>
            </div>
          )}
          <div className="bg-ink-soft/40 border border-white/5 rounded-xl p-3 text-xs text-paper/60 leading-relaxed">
            <p className="font-semibold text-paper mb-1">Why this matters</p>
            <p>Once meaning is geometry, the model can do <em>math on language</em>. Every clever
              thing an LLM does — translate, summarize, find similar concepts — starts from this
              idea. The rest of the tour shows how the model uses these vectors to actually <em>read</em>.</p>
          </div>
        </aside>
      </div>

      <JourneyNav current="/embeddings" />
    </div>
  )
}
