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

// Present imperfective (-taa/-tee/-te + hoon/hai/ho/hain)
// Past: intransitive → agrees with subject; transitive → ne construction, agree with object
// Future: stem + -oon/-oge/-ogee/-ega/-egee/-enge/-engi

export const VERBS: Verb[] = [
  {
    id: 'honaa',
    infinitive: 'honaa',
    stem: 'ho',
    meaning: 'to be',
    transitive: false,
    tenses: {
      present: [
        { subjectId: 'main', subject: 'main', form: 'hoon' },
        { subjectId: 'tu', subject: 'tu', form: 'hai' },
        { subjectId: 'tum', subject: 'tum', form: 'ho' },
        { subjectId: 'aap', subject: 'aap', form: 'hain' },
        { subjectId: 'voh-m', subject: 'voh (m)', form: 'hai' },
        { subjectId: 'voh-f', subject: 'voh (f)', form: 'hai' },
        { subjectId: 'ham', subject: 'ham', form: 'hain' },
      ],
      past: [
        { subjectId: 'main-m', subject: 'main (m)', form: 'thaa' },
        { subjectId: 'main-f', subject: 'main (f)', form: 'thee' },
        { subjectId: 'tu-m', subject: 'tu (m)', form: 'thaa' },
        { subjectId: 'tu-f', subject: 'tu (f)', form: 'thee' },
        { subjectId: 'tum-m', subject: 'tum (m)', form: 'the' },
        { subjectId: 'tum-f', subject: 'tum (f)', form: 'theen' },
        { subjectId: 'aap-m', subject: 'aap (m)', form: 'the' },
        { subjectId: 'aap-f', subject: 'aap (f)', form: 'theen' },
        { subjectId: 'voh-m', subject: 'voh (m)', form: 'thaa' },
        { subjectId: 'voh-f', subject: 'voh (f)', form: 'thee' },
        { subjectId: 'ham-m', subject: 'ham (m)', form: 'the' },
        { subjectId: 'ham-f', subject: 'ham (f)', form: 'theen' },
      ],
      future: [
        { subjectId: 'main-m', subject: 'main (m)', form: 'hongaa' },
        { subjectId: 'main-f', subject: 'main (f)', form: 'hongee' },
        { subjectId: 'tum-m', subject: 'tum (m)', form: 'hoge' },
        { subjectId: 'tum-f', subject: 'tum (f)', form: 'hogi' },
        { subjectId: 'aap-m', subject: 'aap (m)', form: 'honge' },
        { subjectId: 'aap-f', subject: 'aap (f)', form: 'hongi' },
        { subjectId: 'voh-m', subject: 'voh (m)', form: 'hogaa' },
        { subjectId: 'voh-f', subject: 'voh (f)', form: 'hogee' },
        { subjectId: 'ham', subject: 'ham', form: 'honge' },
      ],
    },
  },
  {
    id: 'jaanaa',
    infinitive: 'jaanaa',
    stem: 'jaa',
    meaning: 'to go',
    transitive: false,
    tenses: {
      present: [
        { subjectId: 'main-m', subject: 'main (m)', form: 'jaataa hoon' },
        { subjectId: 'main-f', subject: 'main (f)', form: 'jaatee hoon' },
        { subjectId: 'tum-m', subject: 'tum (m)', form: 'jaate ho' },
        { subjectId: 'tum-f', subject: 'tum (f)', form: 'jaatee ho' },
        { subjectId: 'aap', subject: 'aap', form: 'jaate hain' },
        { subjectId: 'voh-m', subject: 'voh (m)', form: 'jaataa hai' },
        { subjectId: 'voh-f', subject: 'voh (f)', form: 'jaatee hai' },
        { subjectId: 'ham', subject: 'ham', form: 'jaate hain' },
      ],
      past: [
        { subjectId: 'main-m', subject: 'main (m)', form: 'gayaa' },
        { subjectId: 'main-f', subject: 'main (f)', form: 'gayee' },
        { subjectId: 'tum-m', subject: 'tum (m)', form: 'gaye' },
        { subjectId: 'tum-f', subject: 'tum (f)', form: 'gayin' },
        { subjectId: 'aap-m', subject: 'aap (m)', form: 'gaye' },
        { subjectId: 'aap-f', subject: 'aap (f)', form: 'gayin' },
        { subjectId: 'voh-m', subject: 'voh (m)', form: 'gayaa' },
        { subjectId: 'voh-f', subject: 'voh (f)', form: 'gayee' },
        { subjectId: 'ham', subject: 'ham', form: 'gaye' },
      ],
      future: [
        { subjectId: 'main-m', subject: 'main (m)', form: 'jaaungaa' },
        { subjectId: 'main-f', subject: 'main (f)', form: 'jaaungee' },
        { subjectId: 'tum-m', subject: 'tum (m)', form: 'jaoge' },
        { subjectId: 'tum-f', subject: 'tum (f)', form: 'jaogi' },
        { subjectId: 'aap-m', subject: 'aap (m)', form: 'jaayenge' },
        { subjectId: 'aap-f', subject: 'aap (f)', form: 'jaayengi' },
        { subjectId: 'voh-m', subject: 'voh (m)', form: 'jaayegaa' },
        { subjectId: 'voh-f', subject: 'voh (f)', form: 'jaayegee' },
        { subjectId: 'ham', subject: 'ham', form: 'jaayenge' },
      ],
    },
  },
  {
    id: 'karnaa',
    infinitive: 'karnaa',
    stem: 'kar',
    meaning: 'to do',
    transitive: true,
    tenses: {
      present: [
        { subjectId: 'main-m', subject: 'main (m)', form: 'karta hoon' },
        { subjectId: 'main-f', subject: 'main (f)', form: 'kartee hoon' },
        { subjectId: 'tum-m', subject: 'tum (m)', form: 'karte ho' },
        { subjectId: 'tum-f', subject: 'tum (f)', form: 'kartee ho' },
        { subjectId: 'aap', subject: 'aap', form: 'karte hain' },
        { subjectId: 'voh-m', subject: 'voh (m)', form: 'karta hai' },
        { subjectId: 'voh-f', subject: 'voh (f)', form: 'kartee hai' },
        { subjectId: 'ham', subject: 'ham', form: 'karte hain' },
      ],
      // Transitive past: ergative construction. Verb agrees with direct object.
      // Drill object agreement: show object gender, ask for verb form.
      past: [
        { subjectId: 'obj-m-sg', subject: 'masc. object (sg)', form: 'kiyaa' },
        { subjectId: 'obj-f-sg', subject: 'fem. object (sg)', form: 'kii' },
        { subjectId: 'obj-m-pl', subject: 'masc. object (pl)', form: 'kiye' },
        { subjectId: 'obj-f-pl', subject: 'fem. object (pl)', form: 'keen' },
      ],
      future: [
        { subjectId: 'main-m', subject: 'main (m)', form: 'karuungaa' },
        { subjectId: 'main-f', subject: 'main (f)', form: 'karuungee' },
        { subjectId: 'tum-m', subject: 'tum (m)', form: 'karoge' },
        { subjectId: 'tum-f', subject: 'tum (f)', form: 'karogi' },
        { subjectId: 'aap-m', subject: 'aap (m)', form: 'karenge' },
        { subjectId: 'aap-f', subject: 'aap (f)', form: 'karengi' },
        { subjectId: 'voh-m', subject: 'voh (m)', form: 'karegaa' },
        { subjectId: 'voh-f', subject: 'voh (f)', form: 'karegee' },
        { subjectId: 'ham', subject: 'ham', form: 'karenge' },
      ],
    },
  },
  {
    id: 'aanaa',
    infinitive: 'aanaa',
    stem: 'aa',
    meaning: 'to come',
    transitive: false,
    tenses: {
      present: [
        { subjectId: 'main-m', subject: 'main (m)', form: 'aataa hoon' },
        { subjectId: 'main-f', subject: 'main (f)', form: 'aatee hoon' },
        { subjectId: 'tum-m', subject: 'tum (m)', form: 'aate ho' },
        { subjectId: 'tum-f', subject: 'tum (f)', form: 'aatee ho' },
        { subjectId: 'aap', subject: 'aap', form: 'aate hain' },
        { subjectId: 'voh-m', subject: 'voh (m)', form: 'aataa hai' },
        { subjectId: 'voh-f', subject: 'voh (f)', form: 'aatee hai' },
        { subjectId: 'ham', subject: 'ham', form: 'aate hain' },
      ],
      past: [
        { subjectId: 'main-m', subject: 'main (m)', form: 'aayaa' },
        { subjectId: 'main-f', subject: 'main (f)', form: 'aayee' },
        { subjectId: 'tum-m', subject: 'tum (m)', form: 'aaye' },
        { subjectId: 'tum-f', subject: 'tum (f)', form: 'aayin' },
        { subjectId: 'aap-m', subject: 'aap (m)', form: 'aaye' },
        { subjectId: 'aap-f', subject: 'aap (f)', form: 'aayin' },
        { subjectId: 'voh-m', subject: 'voh (m)', form: 'aayaa' },
        { subjectId: 'voh-f', subject: 'voh (f)', form: 'aayee' },
        { subjectId: 'ham', subject: 'ham', form: 'aaye' },
      ],
      future: [
        { subjectId: 'main-m', subject: 'main (m)', form: 'aaungaa' },
        { subjectId: 'main-f', subject: 'main (f)', form: 'aaungee' },
        { subjectId: 'tum-m', subject: 'tum (m)', form: 'aaoge' },
        { subjectId: 'tum-f', subject: 'tum (f)', form: 'aaogi' },
        { subjectId: 'aap-m', subject: 'aap (m)', form: 'aaenge' },
        { subjectId: 'aap-f', subject: 'aap (f)', form: 'aaengi' },
        { subjectId: 'voh-m', subject: 'voh (m)', form: 'aaegaa' },
        { subjectId: 'voh-f', subject: 'voh (f)', form: 'aaegee' },
        { subjectId: 'ham', subject: 'ham', form: 'aaenge' },
      ],
    },
  },
  {
    id: 'bolnaa',
    infinitive: 'bolnaa',
    stem: 'bol',
    meaning: 'to speak / say',
    transitive: false,
    tenses: {
      present: [
        { subjectId: 'main-m', subject: 'main (m)', form: 'bolta hoon' },
        { subjectId: 'main-f', subject: 'main (f)', form: 'boltee hoon' },
        { subjectId: 'tum-m', subject: 'tum (m)', form: 'bolte ho' },
        { subjectId: 'tum-f', subject: 'tum (f)', form: 'boltee ho' },
        { subjectId: 'aap', subject: 'aap', form: 'bolte hain' },
        { subjectId: 'voh-m', subject: 'voh (m)', form: 'bolta hai' },
        { subjectId: 'voh-f', subject: 'voh (f)', form: 'boltee hai' },
        { subjectId: 'ham', subject: 'ham', form: 'bolte hain' },
      ],
      past: [
        { subjectId: 'main-m', subject: 'main (m)', form: 'bolaa' },
        { subjectId: 'main-f', subject: 'main (f)', form: 'bolee' },
        { subjectId: 'tum-m', subject: 'tum (m)', form: 'bole' },
        { subjectId: 'tum-f', subject: 'tum (f)', form: 'bolin' },
        { subjectId: 'aap-m', subject: 'aap (m)', form: 'bole' },
        { subjectId: 'aap-f', subject: 'aap (f)', form: 'bolin' },
        { subjectId: 'voh-m', subject: 'voh (m)', form: 'bolaa' },
        { subjectId: 'voh-f', subject: 'voh (f)', form: 'bolee' },
        { subjectId: 'ham', subject: 'ham', form: 'bole' },
      ],
      future: [
        { subjectId: 'main-m', subject: 'main (m)', form: 'boluungaa' },
        { subjectId: 'main-f', subject: 'main (f)', form: 'boluungee' },
        { subjectId: 'tum-m', subject: 'tum (m)', form: 'bologe' },
        { subjectId: 'tum-f', subject: 'tum (f)', form: 'bologi' },
        { subjectId: 'aap-m', subject: 'aap (m)', form: 'bolenge' },
        { subjectId: 'aap-f', subject: 'aap (f)', form: 'bolengi' },
        { subjectId: 'voh-m', subject: 'voh (m)', form: 'bolegaa' },
        { subjectId: 'voh-f', subject: 'voh (f)', form: 'bolegee' },
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

/** Pick 3 wrong answers for multiple-choice from the same tense's other forms */
export function getDistractors(verb: Verb, tense: Tense, correctForm: string): string[] {
  const allForms = verb.tenses[tense].map(r => r.form).filter(f => f !== correctForm)
  // Also pull from other tenses for more variety
  const otherTenses: Tense[] = (['present', 'past', 'future'] as Tense[]).filter(t => t !== tense)
  for (const t of otherTenses) {
    allForms.push(...verb.tenses[t].map(r => r.form))
  }
  const unique = [...new Set(allForms)].filter(f => f !== correctForm)
  return shuffle(unique).slice(0, 3)
}
