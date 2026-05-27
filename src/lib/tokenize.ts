// A toy tokenizer that gives a feel for sub-word splitting.
// Real BPE has a learned merge table; this is a hand-crafted mimic for the lab.

// Common short pieces a real BPE tokenizer would keep whole.
const COMMON = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'as', 'and',
  'or', 'but', 'not', 'no', 'yes', 'do', 'does', 'did', 'have', 'has', 'had',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'their', 'our', 'this', 'that', 'these', 'those',
  'if', 'then', 'when', 'where', 'why', 'how', 'what', 'who',
  'cat', 'dog', 'sun', 'run', 'go', 'see', 'eat', 'book', 'read',
])

// Common suffixes / prefixes BPE tends to keep as their own piece.
const SUFFIXES = ['ing', 'tion', 'ness', 'ment', 'able', 'ible', 'ed', 'ly', 'er', 'est', 'ize', 'ise', 's']
const PREFIXES = ['un', 'pre', 'over', 'under', 'sub', 're', 'mis', 'inter', 'trans']

function splitWord(w: string): string[] {
  const lower = w.toLowerCase()
  if (lower.length <= 3) return [w]
  if (COMMON.has(lower)) return [w]

  for (const pre of PREFIXES) {
    if (lower.startsWith(pre) && lower.length > pre.length + 2) {
      const rest = w.slice(pre.length)
      return [w.slice(0, pre.length), ...splitWord(rest)]
    }
  }
  for (const suf of SUFFIXES) {
    if (lower.endsWith(suf) && lower.length > suf.length + 2) {
      const stem = w.slice(0, w.length - suf.length)
      return [...splitWord(stem), w.slice(w.length - suf.length)]
    }
  }
  // Long unknown: cut in halves.
  if (lower.length > 7) {
    const cut = Math.floor(w.length / 2)
    return [w.slice(0, cut), w.slice(cut)]
  }
  return [w]
}

export interface Token {
  text: string
  id: number
  kind: 'word' | 'piece' | 'punct' | 'space'
}

// Deterministic pseudo-id for display.
function hashId(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) & 0xffff
  return h
}

export function tokenize(input: string): Token[] {
  const result: Token[] = []
  // Match words, punctuation, and whitespace separately.
  const parts = input.match(/[A-Za-z']+|[0-9]+|\s+|[^\sA-Za-z0-9]/g) ?? []
  for (const p of parts) {
    if (/^\s+$/.test(p)) {
      result.push({ text: p, id: 0, kind: 'space' })
    } else if (/^[A-Za-z']+$/.test(p)) {
      const pieces = splitWord(p)
      pieces.forEach((piece, i) => {
        result.push({
          text: piece,
          id: hashId(piece.toLowerCase()),
          kind: pieces.length === 1 ? 'word' : 'piece',
        })
        if (i < pieces.length - 1) {
          // Visual zero-width separator marker handled by renderer.
        }
      })
    } else {
      result.push({ text: p, id: hashId(p), kind: 'punct' })
    }
  }
  return result
}
