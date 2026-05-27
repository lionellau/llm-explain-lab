// Hand-picked "model would predict" distributions for next-token roulette.
// Probabilities sum to ~1 per prompt.

export interface NextTokenChoice {
  token: string
  prob: number
  // optional teacher note shown if user picks it
  note?: string
}

export interface NextTokenPrompt {
  id: string
  prefix: string
  choices: NextTokenChoice[]
  teacher: string
}

export const NEXT_TOKEN_PROMPTS: NextTokenPrompt[] = [
  {
    id: 'cat-mat',
    prefix: 'The cat sat on the',
    choices: [
      { token: 'mat',     prob: 0.48, note: 'Classic. Half of all training data led here.' },
      { token: 'floor',   prob: 0.18 },
      { token: 'couch',   prob: 0.12 },
      { token: 'roof',    prob: 0.07, note: 'Possible but uncommon.' },
      { token: 'bed',     prob: 0.09 },
      { token: 'keyboard', prob: 0.06, note: 'A real GPT puts surprising mass here.' },
    ],
    teacher: 'The model thinks "mat" first because that exact phrase appears all over its training data. But it keeps options open — that\'s why ChatGPT feels different every time.',
  },
  {
    id: 'once-upon',
    prefix: 'Once upon a',
    choices: [
      { token: 'time',  prob: 0.86, note: 'Almost guaranteed. Strong patterns matter.' },
      { token: 'midnight', prob: 0.05 },
      { token: 'dream', prob: 0.04 },
      { token: 'star',  prob: 0.03 },
      { token: 'while', prob: 0.02 },
    ],
    teacher: 'When training data is one-sided (every fairy tale starts the same), the model becomes very confident. 86% on one option.',
  },
  {
    id: 'water-boils',
    prefix: 'Water boils at one hundred',
    choices: [
      { token: 'degrees', prob: 0.78 },
      { token: 'Celsius', prob: 0.08 },
      { token: 'percent', prob: 0.05 },
      { token: 'kelvin',  prob: 0.04 },
      { token: 'meters',  prob: 0.03 },
      { token: 'minutes', prob: 0.02 },
    ],
    teacher: 'Facts and conventions stack. "degrees" is the grammatical next step — "Celsius" comes after that.',
  },
  {
    id: 'i-feel',
    prefix: 'After running a marathon I feel',
    choices: [
      { token: 'tired',     prob: 0.32 },
      { token: 'exhausted', prob: 0.24 },
      { token: 'great',     prob: 0.14 },
      { token: 'sore',      prob: 0.12 },
      { token: 'hungry',    prob: 0.08 },
      { token: 'amazing',   prob: 0.06 },
      { token: 'sleepy',    prob: 0.04 },
    ],
    teacher: 'When many answers are sensible, no single one dominates. This is where temperature and randomness make outputs feel alive.',
  },
]
