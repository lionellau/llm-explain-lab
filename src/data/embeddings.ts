// Hand-crafted 3D word vectors. Real models use 768+ dimensions.
// Positions are chosen so semantic relationships are visually obvious.

export interface WordVec {
  word: string
  pos: [number, number, number]
  group: 'royalty' | 'gender' | 'animal' | 'food' | 'tech' | 'city' | 'country'
}

export const WORDS: WordVec[] = [
  // Royalty cluster (top right)
  { word: 'king',     pos: [ 6.0,  4.0,  0.0], group: 'royalty' },
  { word: 'queen',    pos: [ 6.0,  4.0, -2.0], group: 'royalty' },
  { word: 'prince',   pos: [ 5.2,  3.4,  0.0], group: 'royalty' },
  { word: 'princess', pos: [ 5.2,  3.4, -2.0], group: 'royalty' },
  { word: 'crown',    pos: [ 6.8,  4.6, -1.0], group: 'royalty' },

  // Gender (lower-middle, parallel offset to royalty)
  { word: 'man',      pos: [ 3.0,  1.0,  0.0], group: 'gender' },
  { word: 'woman',    pos: [ 3.0,  1.0, -2.0], group: 'gender' },
  { word: 'boy',      pos: [ 2.4,  0.4,  0.0], group: 'gender' },
  { word: 'girl',     pos: [ 2.4,  0.4, -2.0], group: 'gender' },

  // Animals (far left)
  { word: 'cat',      pos: [-6.0,  0.0,  4.0], group: 'animal' },
  { word: 'dog',      pos: [-5.6, -0.4,  4.4], group: 'animal' },
  { word: 'horse',    pos: [-6.4,  0.8,  3.6], group: 'animal' },
  { word: 'tiger',    pos: [-6.8,  1.2,  4.8], group: 'animal' },
  { word: 'lion',     pos: [-6.0,  1.6,  4.4], group: 'animal' },

  // Food (bottom)
  { word: 'pizza',    pos: [ 0.0, -6.0, -2.0], group: 'food' },
  { word: 'sushi',    pos: [ 0.8, -6.6, -1.6], group: 'food' },
  { word: 'bread',    pos: [-0.4, -5.6, -2.4], group: 'food' },
  { word: 'cake',     pos: [ 1.2, -5.4, -2.8], group: 'food' },

  // Tech (right-back)
  { word: 'computer', pos: [ 5.0, -2.0,  6.0], group: 'tech' },
  { word: 'internet', pos: [ 5.6, -1.4,  5.6], group: 'tech' },
  { word: 'code',     pos: [ 4.4, -2.6,  6.4], group: 'tech' },
  { word: 'software', pos: [ 5.2, -1.8,  6.8], group: 'tech' },

  // Cities & countries (parallel offset analogy)
  { word: 'paris',    pos: [ 2.0,  6.0,  4.0], group: 'city' },
  { word: 'france',   pos: [ 0.0,  6.0,  4.0], group: 'country' },
  { word: 'tokyo',    pos: [ 2.0,  6.0,  1.0], group: 'city' },
  { word: 'japan',    pos: [ 0.0,  6.0,  1.0], group: 'country' },
  { word: 'rome',     pos: [ 2.0,  6.0,  6.0], group: 'city' },
  { word: 'italy',    pos: [ 0.0,  6.0,  6.0], group: 'country' },
]

export const GROUP_COLOR: Record<WordVec['group'], string> = {
  royalty: '#fbbf24',
  gender:  '#fb7185',
  animal:  '#34d399',
  food:    '#f97316',
  tech:    '#38bdf8',
  city:    '#a78bfa',
  country: '#c084fc',
}

export interface AnalogyPuzzle {
  prompt: string
  a: string // king
  b: string // man  (a - b = direction)
  c: string // woman
  answer: string // queen
  distractors: string[]
}

export const PUZZLES: AnalogyPuzzle[] = [
  {
    prompt: 'king is to man as woman is to ___',
    a: 'king', b: 'man', c: 'woman', answer: 'queen',
    distractors: ['princess', 'girl', 'crown'],
  },
  {
    prompt: 'paris is to france as ___ is to japan',
    a: 'paris', b: 'france', c: 'japan', answer: 'tokyo',
    distractors: ['rome', 'tiger', 'sushi'],
  },
  {
    prompt: 'prince is to boy as ___ is to girl',
    a: 'prince', b: 'boy', c: 'girl', answer: 'princess',
    distractors: ['queen', 'cat', 'cake'],
  },
]

export function vecAdd(a: [number, number, number], b: [number, number, number]): [number, number, number] {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
}
export function vecSub(a: [number, number, number], b: [number, number, number]): [number, number, number] {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}
export function dist(a: [number, number, number], b: [number, number, number]): number {
  const d = vecSub(a, b)
  return Math.hypot(d[0], d[1], d[2])
}
export function nearest(target: [number, number, number], pool: WordVec[]): WordVec {
  let best = pool[0]; let bestD = dist(target, pool[0].pos)
  for (const w of pool) {
    const d = dist(target, w.pos)
    if (d < bestD) { best = w; bestD = d }
  }
  return best
}
