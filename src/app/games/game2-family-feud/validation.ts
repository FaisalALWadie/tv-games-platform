import type { Answer } from './types'

export function normalizeArabic(text: string): string {
  return text
    .replace(/[ً-ٰٟ]/g, '')   // strip all diacritics (includes shadda, tanwin, etc.)
    .replace(/[أإآٱ]/g, 'ا')  // Alef variants → bare Alef
    .replace(/[ؤ]/g, 'و')     // Waw with Hamza → Waw
    .replace(/[ئ]/g, 'ي')     // Ya with Hamza → Ya
    .replace(/ة/g, 'ه')        // Ta Marbouta → Ha
    .replace(/ى/g, 'ي')        // Alef Maqsura → Ya
    .replace(/^ال/, '')         // strip definite article prefix
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

export function levenshteinDistance(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])
    }
  }
  return dp[m][n]
}

// Max allowed edit distance given word length
function fuzzyThreshold(len: number): number {
  if (len >= 9) return 3
  if (len >= 6) return 2
  if (len >= 3) return 1
  return 0
}

export function validateAnswer(
  input: string,
  answers: Answer[],
  exactCache: Map<string, number>
): number | null {
  const normalized = normalizeArabic(input)
  if (!normalized) return null

  // Layer 1: exact cache lookup (covers all pre-normalized answer texts + aliases)
  const cachedIdx = exactCache.get(normalized)
  if (cachedIdx !== undefined) return cachedIdx

  // Layer 2: exact match against live answer texts + aliases (handles answers not in cache)
  for (let i = 0; i < answers.length; i++) {
    const a = answers[i]
    if (normalizeArabic(a.text) === normalized) return i
    if (a.aliases) {
      for (const alias of a.aliases) {
        if (normalizeArabic(alias) === normalized) return i
      }
    }
  }

  // Layer 3: fuzzy Levenshtein — threshold scales with word length
  const threshold = fuzzyThreshold(normalized.length)
  if (threshold > 0) {
    for (let i = 0; i < answers.length; i++) {
      const a = answers[i]
      const ansNorm = normalizeArabic(a.text)
      const maxLen = Math.max(normalized.length, ansNorm.length)
      const effectiveThreshold = Math.min(threshold, fuzzyThreshold(maxLen))
      if (levenshteinDistance(normalized, ansNorm) <= effectiveThreshold) return i
      if (a.aliases) {
        for (const alias of a.aliases) {
          const aliasNorm = normalizeArabic(alias)
          const aliasMax = Math.max(normalized.length, aliasNorm.length)
          const aliasThreshold = Math.min(threshold, fuzzyThreshold(aliasMax))
          if (levenshteinDistance(normalized, aliasNorm) <= aliasThreshold) return i
        }
      }
    }
  }

  return null
}

export function buildExactCache(answers: Answer[]): Map<string, number> {
  const cache = new Map<string, number>()
  for (let i = 0; i < answers.length; i++) {
    cache.set(normalizeArabic(answers[i].text), i)
    if (answers[i].aliases) {
      for (const alias of answers[i].aliases!) {
        cache.set(normalizeArabic(alias), i)
      }
    }
  }
  return cache
}
