import { highlight } from './highlight.jsx'
import { ArrowIcon } from './icons.jsx'

export function QnaList({ items, page, pageSize, total, keywords, onSelect }) {
  if (items.length === 0) {
    return <div className="px-4 py-16 text-center text-base text-fg-faint">검색 결과가 없습니다.</div>
  }

  return (
    <div>
      {items.map((item, i) => {
        const answered = Boolean(item.answer)
        const hasAttachment =
          (item.question?.attachments?.length || 0) > 0 || (item.answer?.attachments?.length || 0) > 0
        const rowNumber = total - ((page - 1) * pageSize + i)
        return (
          <div key={item.id} onClick={() => onSelect(item)} className="list-row">
            <span className="list-index">{rowNumber}</span>
            <span className={`status-pill ${answered ? 'status-pill-answered' : 'status-pill-unanswered'}`}>
              {answered ? '답변완료' : '미답변'}
            </span>
            <span className="list-title">{highlight(item.title, keywords)}</span>
            {hasAttachment && (
              <span className="shrink-0 text-fg-faint" aria-label="첨부파일 있음">
                📎
              </span>
            )}
            <span className="list-date">{item.date}</span>
            <span className="list-arrow">
              <ArrowIcon className="h-4 w-4" />
            </span>
          </div>
        )
      })}
    </div>
  )
}
