export function highlight(text, keywords) {
  if (!text) return null
  if (!keywords.length) return text

  const escaped = keywords
    .slice()
    .sort((a, b) => b.length - a.length)
    .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi')
  const keywordSet = new Set(keywords.map((k) => k.toLowerCase()))

  return text.split(regex).map((part, i) =>
    keywordSet.has(part.toLowerCase()) ? (
      <mark key={i} className="rounded-sm bg-mark-bg px-0.5 text-mark-fg">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}
