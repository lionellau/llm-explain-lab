// Hand-crafted attention puzzles. The "weights" array represents
// where the focus token's attention lands across the whole sentence,
// like a real attention head would output (softmax → sums to ~1).

export interface AttentionPuzzle {
  id: string
  sentence: string[]
  focusIdx: number // the word that's "looking" (e.g. a pronoun)
  answerIdx: number // the word it really refers to
  weights: number[] // model's attention from focus over the whole sentence
  explanation: string
}

export const ATTENTION_PUZZLES: AttentionPuzzle[] = [
  {
    id: 'animal-tired',
    sentence: ['The', 'animal', "didn't", 'cross', 'the', 'street', 'because', 'it', 'was', 'too', 'tired'],
    focusIdx: 7, // it
    answerIdx: 1, // animal
    weights: [0.04, 0.55, 0.02, 0.02, 0.04, 0.18, 0.02, 0.05, 0.02, 0.02, 0.04],
    explanation: '"Tired" only makes sense for the animal, not the street. The model leans heavily on "animal".',
  },
  {
    id: 'animal-wide',
    sentence: ['The', 'animal', "didn't", 'cross', 'the', 'street', 'because', 'it', 'was', 'too', 'wide'],
    focusIdx: 7, // it
    answerIdx: 5, // street
    weights: [0.04, 0.18, 0.02, 0.02, 0.04, 0.55, 0.02, 0.05, 0.02, 0.02, 0.04],
    explanation: 'Same sentence, different last word. "Wide" fits the street. Same model, different attention.',
  },
  {
    id: 'trophy-bag',
    sentence: ['The', 'trophy', "didn't", 'fit', 'in', 'the', 'bag', 'because', 'it', 'was', 'too', 'big'],
    focusIdx: 8, // it
    answerIdx: 1, // trophy
    weights: [0.03, 0.52, 0.02, 0.02, 0.02, 0.04, 0.20, 0.02, 0.05, 0.02, 0.02, 0.04],
    explanation: 'Trophy too big to fit. The model latches onto "trophy".',
  },
  {
    id: 'trophy-bag-small',
    sentence: ['The', 'trophy', "didn't", 'fit', 'in', 'the', 'bag', 'because', 'it', 'was', 'too', 'small'],
    focusIdx: 8, // it
    answerIdx: 6, // bag
    weights: [0.03, 0.20, 0.02, 0.02, 0.02, 0.04, 0.52, 0.02, 0.05, 0.02, 0.02, 0.04],
    explanation: 'Now the bag is the small one. Attention shifts.',
  },
]
