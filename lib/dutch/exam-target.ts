export const EXAM_TARGET_KEY = 'dutch-exam-target'

export type ExamTarget = 'a2' | 'b1'

function safeWindow(): Window | null {
  return typeof window === 'undefined' ? null : window
}

export function getExamTarget(): ExamTarget {
  const w = safeWindow()
  if (!w) return 'b1'
  const raw = w.localStorage.getItem(EXAM_TARGET_KEY)
  return raw === 'a2' ? 'a2' : 'b1'
}

export function setExamTarget(target: ExamTarget): void {
  const w = safeWindow()
  if (!w) return
  w.localStorage.setItem(EXAM_TARGET_KEY, target)
}
