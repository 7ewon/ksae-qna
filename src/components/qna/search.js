const TITLE_WEIGHT = 5
const BODY_WEIGHT = 1

const REGULATION_UNITS = '장|절|조|항|호|번|편|목|차'
const SEPARATOR_RE = /={5,}\s*원\s*글\s*={5,}/

export function tokenize(query) {
  return query.trim().split(/\s+/).filter(Boolean)
}

export function countOccurrences(haystack, needle) {
  if (!haystack || !needle) return 0
  const lower = haystack.toLowerCase()
  const target = needle.toLowerCase()
  let count = 0
  let idx = 0
  while ((idx = lower.indexOf(target, idx)) !== -1) {
    count += 1
    idx += target.length
  }
  return count
}

export function normalizeContentText(text) {
  if (!text) return text

  // "원 글" 구분선 아래는 질문 원문을 그대로 인용한 부분이라, 질문 탭에서 이미
  // 보여주는 내용과 중복되므로 답변에서는 잘라낸다.
  const withoutQuotedOriginal = text.split(SEPARATOR_RE)[0]

  // 조문 인용 중간에 낀 개행 복원 (예: "15\n장" -> "15장")
  const merged = withoutQuotedOriginal
    .replace(/\r\n/g, '\n')
    .replace(new RegExp(`(\\d+)[ \\t]*\\n[ \\t]*(${REGULATION_UNITS})`, 'g'), '$1$2')

  // 그 외 개행은, 바로 다음이 "1." "2." 같은 항목 번호로 시작할 때만 줄바꿈으로 남기고
  // 나머지(문장 중간에 끼어든 개행)는 공백으로 합친다.
  const relisted = merged.replace(/\n[ \t]*/g, (match, offset, str) => {
    const rest = str.slice(offset + match.length)
    return /^\d+\./.test(rest) ? '\n' : ' '
  })

  return relisted.replace(/[ \t]{2,}/g, ' ').trim()
}

export function searchAndSort(items, keywords) {
  if (keywords.length === 0) return items

  const scored = []
  for (const item of items) {
    const title = item.title || ''
    const qText = item.question?.content_text || ''
    const aText = item.answer?.content_text || ''
    const combined = `${title} ${qText} ${aText}`

    const matchesAll = keywords.every((kw) => countOccurrences(combined, kw) > 0)
    if (!matchesAll) continue

    let score = 0
    for (const kw of keywords) {
      score += countOccurrences(title, kw) * TITLE_WEIGHT
      score += countOccurrences(qText, kw) * BODY_WEIGHT
      score += countOccurrences(aText, kw) * BODY_WEIGHT
    }
    scored.push({ item, score })
  }

  scored.sort((a, b) => b.score - a.score)
  return scored.map((s) => s.item)
}
