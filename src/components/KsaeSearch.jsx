import { useEffect, useMemo, useState } from 'react'
import qnaPart1 from '../data/ksae_formula_qna_part1.json'
import qnaPart2 from '../data/ksae_formula_qna_part2.json'
import qnaPart3 from '../data/ksae_formula_qna_part3.json'
import qnaPart4 from '../data/ksae_formula_qna_part4.json'
import qnaPart5 from '../data/ksae_formula_qna_part5.json'
import qnaPart6 from '../data/ksae_formula_qna_part6.json'
import qnaPart7 from '../data/ksae_formula_qna_part7.json'
import qnaPart8 from '../data/ksae_formula_qna_part8.json'
import qnaPart9 from '../data/ksae_formula_qna_part9.json'

const qnaData = [
  ...qnaPart1,
  ...qnaPart2,
  ...qnaPart3,
  ...qnaPart4,
  ...qnaPart5,
  ...qnaPart6,
  ...qnaPart7,
  ...qnaPart8,
  ...qnaPart9,
]

const FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'answered', label: '답변완료' },
  { key: 'unanswered', label: '미답변' },
]

const PAGE_SIZE = 10

const TITLE_WEIGHT = 5
const BODY_WEIGHT = 1

function tokenize(query) {
  return query.trim().split(/\s+/).filter(Boolean)
}

function countOccurrences(haystack, needle) {
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

const REGULATION_UNITS = '장|절|조|항|호|번|편|목|차'
const SEPARATOR_RE = /={5,}\s*원\s*글\s*={5,}/

function normalizeContentText(text) {
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

function highlight(text, keywords) {
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
      <mark key={i} className="rounded-sm bg-accent/25 px-0.5 text-accent">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}

function searchAndSort(items, keywords) {
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

function SearchIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
    </svg>
  )
}

export default function KsaeSearch() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)

  const keywords = useMemo(() => tokenize(query), [query])

  const results = useMemo(() => {
    let items = qnaData
    if (filter === 'answered') items = items.filter((it) => it.answer)
    if (filter === 'unanswered') items = items.filter((it) => !it.answer)
    return searchAndSort(items, keywords)
  }, [keywords, filter])

  useEffect(() => {
    setPage(1)
  }, [keywords, filter])

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE))
  const pagedResults = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function openModal(item) {
    setSelected(item)
  }

  return (
    <div className="min-h-screen bg-bg text-fg">
      <div className="mx-auto max-w-4xl px-4 py-18">
        <header className="mb-10 flex flex-col text-left px-4">
          <h1 className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">KSAE Q&A</h1>
        </header>

        <div className="mb-4 flex">
          <div className="px-4 flex items-center gap-2 w-full rounded-xl border border-border bg-[#4E5156]">
              <SearchIcon className="h-5 w-5 mr-1 text-fg-faint" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="검색어를 입력해주세요."
                className="w-full py-3 text-md text-fg outline-none placeholder:text-fg-faint focus:border-border-strong"
              />
              
              
            </div>
          
        </div>

        <div className="p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center border-b border-border">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                  filter === f.key ? ' text-fg underline underline-offset-12 decoration-2' : 'text-fg-muted hover:text-fg'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
            <span className="text-sm text-fg-muted">총 {results.length}건</span>
            
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-fg-faint">
                  <th className="w-28 py-3 pr-3 font-medium">상태</th>
                  <th className="py-3 pr-3 font-medium">제목</th>
                  <th className="hidden w-32 py-3 pr-3 font-medium sm:table-cell">작성자</th>
                  <th className="w-28 py-3 pr-3 font-medium">등록일</th>
                  <th className="hidden w-20 py-3 text-right font-medium sm:table-cell">조회</th>
                </tr>
              </thead>
              <tbody>
                {pagedResults.map((item) => {
                  const answered = Boolean(item.answer)
                  return (
                    <tr
                      key={item.id}
                      onClick={() => openModal(item)}
                      className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-2"
                    >
                      <td className="py-3.5 pr-3">
                        <span className={`badge ${answered ? 'badge-answered' : 'badge-unanswered'}`}>
                          {answered ? '답변완료' : '미답변'}
                        </span>
                      </td>
                      <td className="py-3.5 pr-3 font-medium text-fg">
                        {highlight(item.title, keywords)}
                      </td>
                      <td className="hidden py-3.5 pr-3 text-fg-muted sm:table-cell">
                        {item.author}
                      </td>
                      <td className="py-3.5 pr-3 text-fg-muted">{item.date}</td>
                      <td className="hidden py-3.5 text-right text-fg-muted sm:table-cell">
                        {item.views}
                      </td>
                    </tr>
                  )
                })}

                {pagedResults.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-sm text-fg-faint">
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}
        </div>
      </div>

      {selected && (
        <QnaModal item={selected} keywords={keywords} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}

function Pagination({ page, totalPages, onChange }) {
  const start = Math.max(1, Math.min(page - 2, totalPages - 4))
  const end = Math.min(totalPages, Math.max(page + 2, 5))
  const pages = []
  for (let p = Math.max(1, start); p <= end; p++) pages.push(p)

  return (
    <div className="mt-6 flex items-center justify-center gap-1">
      <button
        type="button"
        onClick={() => onChange(1)}
        disabled={page === 1}
        aria-label="처음으로"
        className="flex h-8 w-8 items-center justify-center rounded-full text-fg-muted hover:bg-surface-2 hover:text-fg disabled:opacity-30 disabled:hover:bg-transparent"
      >
        «
      </button>
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        aria-label="이전"
        className="flex h-8 w-8 items-center justify-center rounded-full text-fg-muted hover:bg-surface-2 hover:text-fg disabled:opacity-30 disabled:hover:bg-transparent"
      >
        ‹
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
            p === page ? 'bg-[#4E5156] text-bg' : 'text-fg-muted hover:bg-surface-2 hover:text-fg'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        aria-label="다음"
        className="flex h-8 w-8 items-center justify-center rounded-full text-fg-muted hover:bg-surface-2 hover:text-fg disabled:opacity-30 disabled:hover:bg-transparent"
      >
        ›
      </button>
      <button
        type="button"
        onClick={() => onChange(totalPages)}
        disabled={page === totalPages}
        aria-label="마지막으로"
        className="flex h-8 w-8 items-center justify-center rounded-full text-fg-muted hover:bg-surface-2 hover:text-fg disabled:opacity-30 disabled:hover:bg-transparent"
      >
        »
      </button>
    </div>
  )
}

function QnaModal({ item, keywords, onClose }) {
  const answered = Boolean(item.answer)

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/20 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#22242A] rounded-3xl flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-6">
          <div>
            <h2 className="text-lg font-semibold leading-snug text-fg">
              {highlight(item.title, keywords)}
            </h2>
            <div className="mt-1.5 flex items-center gap-2 text-xs text-fg-faint">
              <span>{item.author}</span>
              <span>·</span>
              <span>{item.date}</span>
              <span>·</span>
              <span>조회 {item.views}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 shrink-0 rounded-full flex items-center justify-center text-fg-faint hover:bg-surface-2 hover:text-fg"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <SectionLabel title="질문" />
          <QnaBody content={item.question} keywords={keywords} />

          {answered ? (
            <>
              <SectionLabel title="답변" className="mt-6" />
              <QnaBody content={item.answer} keywords={keywords} />
            </>
          ) : (
            <p className="mt-6 text-sm text-fg-faint">아직 등록된 답변이 없습니다.</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 border-border p-4">
          <a href={item.q_url} target="_blank" rel="noreferrer" className="pill-link">
            질문 원문 보기 ↗
          </a>
          {item.a_url && (
            <a href={item.a_url} target="_blank" rel="noreferrer" className="pill-link">
              답변 원문 보기 ↗
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function SectionLabel({ title, className = '' }) {
  return (
    <div className={`mb-3 flex items-center gap-3 text-xs font-medium text-fg-faint ${className}`}>
      {title}
      <span className="h-px flex-1 bg-border-strong" />
    </div>
  )
}

function QnaBody({ content, keywords }) {
  if (!content) return null
  const attachments = content.attachments || []

  return (
    <div>
      <p className="whitespace-pre-line text-sm leading-relaxed text-fg-muted">
        {highlight(normalizeContentText(content.content_text), keywords)}
      </p>
      {attachments.length > 0 && (
        <div className="mt-4 border-t border-border pt-3">
          <SectionLabel title="첨부파일" />
          <ul className="flex flex-col gap-1">
            {attachments.map((file, i) => (
              <li key={i}>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-accent hover:underline"
                >
                  📎 {file.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
