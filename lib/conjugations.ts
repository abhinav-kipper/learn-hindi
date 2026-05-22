export interface ConjRow {
  subjectId: string
  subject: string   // display label, e.g. "main (m)"
  form: string      // the conjugated verb form
}

export type Tense = 'present' | 'past' | 'future'

export interface Verb {
  id: string
  infinitive: string
  stem: string
  meaning: string
  transitive: boolean
  tenses: Record<Tense, ConjRow[]>
}

// Romanization follows the app's existing style guide (see CONTENT.md):
//   single-vowel endings (karta/karti, gaya/gayi, karunga/karungi, tha/thi)
//   theen for fem. plural past (matches existing content)
//
// Present imperfective: stem + ta/ti/te + hoon/hai/ho/hain
// Past intransitive: stem + (i)ya/(y)i/(y)e/(y)een — agrees with subject
// Past transitive: uses ne construction, verb agrees with direct object
// Future: stem + unga/ungi/oge/ogi/enge/engi/ega/egi

export const VERBS: Verb[] = [
  {
    id: 'honaa',
    infinitive: 'hona',
    stem: 'ho',
    meaning: 'to be',
    transitive: false,
    tenses: {
      // honaa as the auxiliary doesn't show gender — single form per person
      present: [
        { subjectId: 'main', subject: 'main', form: 'hoon' },
        { subjectId: 'tum', subject: 'tum', form: 'ho' },
        { subjectId: 'aap', subject: 'aap', form: 'hain' },
        { subjectId: 'voh', subject: 'voh', form: 'hai' },
        { subjectId: 'ham', subject: 'ham', form: 'hain' },
      ],
      past: [
        { subjectId: 'main-m', subject: 'main (m)', form: 'tha' },
        { subjectId: 'main-f', subject: 'main (f)', form: 'thi' },
        { subjectId: 'tum-m', subject: 'tum (m)', form: 'the' },
        { subjectId: 'tum-f', subject: 'tum (f)', form: 'theen' },
        { subjectId: 'aap-m', subject: 'aap (m)', form: 'the' },
        { subjectId: 'aap-f', subject: 'aap (f)', form: 'theen' },
        { subjectId: 'voh-m', subject: 'voh (m)', form: 'tha' },
        { subjectId: 'voh-f', subject: 'voh (f)', form: 'thi' },
        { subjectId: 'ham-m', subject: 'ham (m)', form: 'the' },
        { subjectId: 'ham-f', subject: 'ham (f)', form: 'theen' },
      ],
      future: [
        { subjectId: 'main-m', subject: 'main (m)', form: 'hunga' },
        { subjectId: 'main-f', subject: 'main (f)', form: 'hungi' },
        { subjectId: 'tum-m', subject: 'tum (m)', form: 'hoge' },
        { subjectId: 'tum-f', subject: 'tum (f)', form: 'hogi' },
        { subjectId: 'aap-m', subject: 'aap (m)', form: 'honge' },
        { subjectId: 'aap-f', subject: 'aap (f)', form: 'hongi' },
        { subjectId: 'voh-m', subject: 'voh (m)', form: 'hoga' },
        { subjectId: 'voh-f', subject: 'voh (f)', form: 'hogi' },
        { subjectId: 'ham', subject: 'ham', form: 'honge' },
      ],
    },
  },
  {
    id: 'jaanaa',
    infinitive: 'jaana',
    stem: 'jaa',
    meaning: 'to go',
    transitive: false,
    tenses: {
      present: [
        { subjectId: 'main-m', subject: 'main (m)', form: 'jaata hoon' },
        { subjectId: 'main-f', subject: 'main (f)', form: 'jaati hoon' },
        { subjectId: 'tum-m', subject: 'tum (m)', form: 'jaate ho' },
        { subjectId: 'tum-f', subject: 'tum (f)', form: 'jaati ho' },
        { subjectId: 'aap-m', subject: 'aap (m)', form: 'jaate hain' },
        { subjectId: 'aap-f', subject: 'aap (f)', form: 'jaati hain' },
        { subjectId: 'voh-m', subject: 'voh (m)', form: 'jaata hai' },
        { subjectId: 'voh-f', subject: 'voh (f)', form: 'jaati hai' },
        { subjectId: 'ham', subject: 'ham', form: 'jaate hain' },
      ],
      past: [
        { subjectId: 'main-m', subject: 'main (m)', form: 'gaya' },
        { subjectId: 'main-f', subject: 'main (f)', form: 'gayi' },
        { subjectId: 'tum-m', subject: 'tum (m)', form: 'gaye' },
        { subjectId: 'tum-f', subject: 'tum (f)', form: 'gayeen' },
        { subjectId: 'aap-m', subject: 'aap (m)', form: 'gaye' },
        { subjectId: 'aap-f', subject: 'aap (f)', form: 'gayeen' },
        { subjectId: 'voh-m', subject: 'voh (m)', form: 'gaya' },
        { subjectId: 'voh-f', subject: 'voh (f)', form: 'gayi' },
        { subjectId: 'ham', subject: 'ham', form: 'gaye' },
      ],
      future: [
        { subjectId: 'main-m', subject: 'main (m)', form: 'jaaunga' },
        { subjectId: 'main-f', subject: 'main (f)', form: 'jaaungi' },
        { subjectId: 'tum-m', subject: 'tum (m)', form: 'jaaoge' },
        { subjectId: 'tum-f', subject: 'tum (f)', form: 'jaaogi' },
        { subjectId: 'aap-m', subject: 'aap (m)', form: 'jaayenge' },
        { subjectId: 'aap-f', subject: 'aap (f)', form: 'jaayengi' },
        { subjectId: 'voh-m', subject: 'voh (m)', form: 'jaayega' },
        { subjectId: 'voh-f', subject: 'voh (f)', form: 'jaayegi' },
        { subjectId: 'ham', subject: 'ham', form: 'jaayenge' },
      ],
    },
  },
  {
    id: 'karnaa',
    infinitive: 'karna',
    stem: 'kar',
    meaning: 'to do',
    transitive: true,
    tenses: {
      present: [
        { subjectId: 'main-m', subject: 'main (m)', form: 'karta hoon' },
        { subjectId: 'main-f', subject: 'main (f)', form: 'karti hoon' },
        { subjectId: 'tum-m', subject: 'tum (m)', form: 'karte ho' },
        { subjectId: 'tum-f', subject: 'tum (f)', form: 'karti ho' },
        { subjectId: 'aap-m', subject: 'aap (m)', form: 'karte hain' },
        { subjectId: 'aap-f', subject: 'aap (f)', form: 'karti hain' },
        { subjectId: 'voh-m', subject: 'voh (m)', form: 'karta hai' },
        { subjectId: 'voh-f', subject: 'voh (f)', form: 'karti hai' },
        { subjectId: 'ham', subject: 'ham', form: 'karte hain' },
      ],
      // Transitive past: ergative ("usne X kiya"). Verb agrees with direct
      // object, not subject. We drill object-agreement rather than subject.
      past: [
        { subjectId: 'obj-m-sg', subject: 'usne (m. obj sg)', form: 'kiya' },
        { subjectId: 'obj-f-sg', subject: 'usne (f. obj sg)', form: 'ki' },
        { subjectId: 'obj-m-pl', subject: 'usne (m. obj pl)', form: 'kiye' },
        { subjectId: 'obj-f-pl', subject: 'usne (f. obj pl)', form: 'keen' },
      ],
      future: [
        { subjectId: 'main-m', subject: 'main (m)', form: 'karunga' },
        { subjectId: 'main-f', subject: 'main (f)', form: 'karungi' },
        { subjectId: 'tum-m', subject: 'tum (m)', form: 'karoge' },
        { subjectId: 'tum-f', subject: 'tum (f)', form: 'karogi' },
        { subjectId: 'aap-m', subject: 'aap (m)', form: 'karenge' },
        { subjectId: 'aap-f', subject: 'aap (f)', form: 'karengi' },
        { subjectId: 'voh-m', subject: 'voh (m)', form: 'karega' },
        { subjectId: 'voh-f', subject: 'voh (f)', form: 'karegi' },
        { subjectId: 'ham', subject: 'ham', form: 'karenge' },
      ],
    },
  },
  {
    id: 'aanaa',
    infinitive: 'aana',
    stem: 'aa',
    meaning: 'to come',
    transitive: false,
    tenses: {
      present: [
        { subjectId: 'main-m', subject: 'main (m)', form: 'aata hoon' },
        { subjectId: 'main-f', subject: 'main (f)', form: 'aati hoon' },
        { subjectId: 'tum-m', subject: 'tum (m)', form: 'aate ho' },
        { subjectId: 'tum-f', subject: 'tum (f)', form: 'aati ho' },
        { subjectId: 'aap-m', subject: 'aap (m)', form: 'aate hain' },
        { subjectId: 'aap-f', subject: 'aap (f)', form: 'aati hain' },
        { subjectId: 'voh-m', subject: 'voh (m)', form: 'aata hai' },
        { subjectId: 'voh-f', subject: 'voh (f)', form: 'aati hai' },
        { subjectId: 'ham', subject: 'ham', form: 'aate hain' },
      ],
      past: [
        { subjectId: 'main-m', subject: 'main (m)', form: 'aaya' },
        { subjectId: 'main-f', subject: 'main (f)', form: 'aayi' },
        { subjectId: 'tum-m', subject: 'tum (m)', form: 'aaye' },
        { subjectId: 'tum-f', subject: 'tum (f)', form: 'aayeen' },
        { subjectId: 'aap-m', subject: 'aap (m)', form: 'aaye' },
        { subjectId: 'aap-f', subject: 'aap (f)', form: 'aayeen' },
        { subjectId: 'voh-m', subject: 'voh (m)', form: 'aaya' },
        { subjectId: 'voh-f', subject: 'voh (f)', form: 'aayi' },
        { subjectId: 'ham', subject: 'ham', form: 'aaye' },
      ],
      future: [
        { subjectId: 'main-m', subject: 'main (m)', form: 'aaunga' },
        { subjectId: 'main-f', subject: 'main (f)', form: 'aaungi' },
        { subjectId: 'tum-m', subject: 'tum (m)', form: 'aaoge' },
        { subjectId: 'tum-f', subject: 'tum (f)', form: 'aaogi' },
        { subjectId: 'aap-m', subject: 'aap (m)', form: 'aayenge' },
        { subjectId: 'aap-f', subject: 'aap (f)', form: 'aayengi' },
        { subjectId: 'voh-m', subject: 'voh (m)', form: 'aayega' },
        { subjectId: 'voh-f', subject: 'voh (f)', form: 'aayegi' },
        { subjectId: 'ham', subject: 'ham', form: 'aayenge' },
      ],
    },
  },
  {
    id: 'bolnaa',
    infinitive: 'bolna',
    stem: 'bol',
    meaning: 'to speak / say',
    transitive: false,
    tenses: {
      present: [
        { subjectId: 'main-m', subject: 'main (m)', form: 'bolta hoon' },
        { subjectId: 'main-f', subject: 'main (f)', form: 'bolti hoon' },
        { subjectId: 'tum-m', subject: 'tum (m)', form: 'bolte ho' },
        { subjectId: 'tum-f', subject: 'tum (f)', form: 'bolti ho' },
        { subjectId: 'aap-m', subject: 'aap (m)', form: 'bolte hain' },
        { subjectId: 'aap-f', subject: 'aap (f)', form: 'bolti hain' },
        { subjectId: 'voh-m', subject: 'voh (m)', form: 'bolta hai' },
        { subjectId: 'voh-f', subject: 'voh (f)', form: 'bolti hai' },
        { subjectId: 'ham', subject: 'ham', form: 'bolte hain' },
      ],
      past: [
        { subjectId: 'main-m', subject: 'main (m)', form: 'bola' },
        { subjectId: 'main-f', subject: 'main (f)', form: 'boli' },
        { subjectId: 'tum-m', subject: 'tum (m)', form: 'bole' },
        { subjectId: 'tum-f', subject: 'tum (f)', form: 'boleen' },
        { subjectId: 'aap-m', subject: 'aap (m)', form: 'bole' },
        { subjectId: 'aap-f', subject: 'aap (f)', form: 'boleen' },
        { subjectId: 'voh-m', subject: 'voh (m)', form: 'bola' },
        { subjectId: 'voh-f', subject: 'voh (f)', form: 'boli' },
        { subjectId: 'ham', subject: 'ham', form: 'bole' },
      ],
      future: [
        { subjectId: 'main-m', subject: 'main (m)', form: 'bolunga' },
        { subjectId: 'main-f', subject: 'main (f)', form: 'bolungi' },
        { subjectId: 'tum-m', subject: 'tum (m)', form: 'bologe' },
        { subjectId: 'tum-f', subject: 'tum (f)', form: 'bologi' },
        { subjectId: 'aap-m', subject: 'aap (m)', form: 'bolenge' },
        { subjectId: 'aap-f', subject: 'aap (f)', form: 'bolengi' },
        { subjectId: 'voh-m', subject: 'voh (m)', form: 'bolega' },
        { subjectId: 'voh-f', subject: 'voh (f)', form: 'bolegi' },
        { subjectId: 'ham', subject: 'ham', form: 'bolenge' },
      ],
    },
  },
]

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Pick up to 3 wrong answers for multiple-choice. Prefer distractors from the
 * SAME tense (they're more believable) and fall back to other tenses only if
 * we don't have enough in-tense alternatives.
 */
export function getDistractors(verb: Verb, tense: Tense, correctForm: string): string[] {
  const sameTense = verb.tenses[tense]
    .map(r => r.form)
    .filter(f => f !== correctForm)
  const inTense = [...new Set(sameTense)]
  if (inTense.length >= 3) return shuffle(inTense).slice(0, 3)

  // Not enough in-tense — pad from other tenses
  const others: string[] = []
  for (const t of (['present', 'past', 'future'] as Tense[])) {
    if (t === tense) continue
    others.push(...verb.tenses[t].map(r => r.form))
  }
  const otherUnique = [...new Set(others)].filter(f => f !== correctForm && !inTense.includes(f))
  return [...shuffle(inTense), ...shuffle(otherUnique)].slice(0, 3)
}
