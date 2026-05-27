import { lazy, Suspense } from 'react'
import { Routes, Route, NavLink, Link, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Tokenizer from './pages/Tokenizer'
import Attention from './pages/Attention'
import EncodeDecode from './pages/EncodeDecode'
import NextToken from './pages/NextToken'
import Recap from './pages/Recap'
const Embeddings = lazy(() => import('./pages/Embeddings'))

function LoadingScreen() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center text-paper/50 text-sm">
      Loading 3D scene…
    </div>
  )
}

const navItems = [
  { to: '/', label: 'Home', emoji: '🏠' },
  { to: '/tokenizer', label: '1. Tokens', emoji: '🧩' },
  { to: '/embeddings', label: '2. Meaning Space', emoji: '🌌' },
  { to: '/attention', label: '3. Attention', emoji: '👀' },
  { to: '/encode-decode', label: '4. Encode→Decode', emoji: '🔁' },
  { to: '/next-token', label: '5. Predict', emoji: '🎲' },
  { to: '/recap', label: 'Recap', emoji: '🏁' },
]

export default function App() {
  const loc = useLocation()
  return (
    <div className="min-h-full flex flex-col">
      <header className="sticky top-0 z-30 backdrop-blur bg-ink/70 border-b border-white/5">
        <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
          <Link to="/" className="font-bold text-lg tracking-tight flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            <span className="bg-gradient-to-r from-grape-soft to-sun bg-clip-text text-transparent">LLM Lab</span>
          </Link>
          <div className="flex gap-1 flex-wrap">
            {navItems.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-full text-sm transition-colors ${
                    isActive
                      ? 'bg-grape text-white shadow-sm'
                      : 'text-paper/70 hover:text-paper hover:bg-white/5'
                  }`
                }
              >
                <span className="mr-1">{n.emoji}</span>
                {n.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>

      <main key={loc.pathname} className="flex-1 anim-float-in">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tokenizer" element={<Tokenizer />} />
          <Route
            path="/embeddings"
            element={
              <Suspense fallback={<LoadingScreen />}>
                <Embeddings />
              </Suspense>
            }
          />
          <Route path="/attention" element={<Attention />} />
          <Route path="/encode-decode" element={<EncodeDecode />} />
          <Route path="/next-token" element={<NextToken />} />
          <Route path="/recap" element={<Recap />} />
        </Routes>
      </main>

      <footer className="border-t border-white/5 py-4 text-center text-xs text-paper/40">
        Built for curious humans. No data leaves your browser.
      </footer>
    </div>
  )
}
