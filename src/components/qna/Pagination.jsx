export function Pagination({ page, totalPages, onChange }) {
  const start = Math.max(1, Math.min(page - 2, totalPages - 4))
  const end = Math.min(totalPages, Math.max(page + 2, 5))
  const pages = []
  for (let p = Math.max(1, start); p <= end; p++) pages.push(p)

  return (
    <div className="mt-6 flex items-center justify-center gap-1">
      <button type="button" onClick={() => onChange(1)} disabled={page === 1} aria-label="처음으로" className="page-btn">
        «
      </button>
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        aria-label="이전"
        className="page-btn"
      >
        ‹
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`page-btn ${p === page ? 'page-btn-active' : ''}`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        aria-label="다음"
        className="page-btn"
      >
        ›
      </button>
      <button
        type="button"
        onClick={() => onChange(totalPages)}
        disabled={page === totalPages}
        aria-label="마지막으로"
        className="page-btn"
      >
        »
      </button>
    </div>
  )
}
