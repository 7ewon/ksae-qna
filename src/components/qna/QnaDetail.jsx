import { highlight } from './highlight.jsx'
import { normalizeContentText } from './search.js'
import { ArrowIcon } from './icons.jsx'

export function QnaDetail({ item, keywords, onBack }) {
  const answered = Boolean(item.answer)

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-fg-muted hover:text-fg"
      >
        <ArrowIcon className="h-4 w-4 rotate-180" />
        목록으로
      </button>

      <h2 className="text-xl font-semibold leading-snug text-fg sm:text-2xl">
        {highlight(item.title, keywords)}
      </h2>
      <div className="mt-2 flex items-center gap-2 text-sm text-fg-faint">
        <span>{item.author}</span>
        <span>·</span>
        <span>{item.date}</span>
        <span>·</span>
        <span>조회 {item.views}</span>
      </div>

      <div className="mt-8">
        <SectionLabel title="질문" />
        <QnaBody content={item.question} keywords={keywords} />

        {answered ? (
          <>
            <SectionLabel title="답변" className="mt-8" />
            <QnaBody content={item.answer} keywords={keywords} />
          </>
        ) : (
          <p className="mt-8 text-base text-fg-faint">아직 등록된 답변이 없습니다.</p>
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-2 border-t border-border pt-6">
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
  )
}

function SectionLabel({ title, className = '' }) {
  return (
    <div className={`mb-3 flex items-center gap-3 text-sm font-medium text-fg-faint ${className}`}>
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
      <p className="whitespace-pre-line text-base leading-relaxed text-fg-muted">
        {highlight(normalizeContentText(content.content_text), keywords)}
      </p>
      {attachments.length > 0 && (
        <div className="mt-4 border-border py-4">
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
